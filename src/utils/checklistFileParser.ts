import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { Plane, PlaneChecklist, ChecklistPhase, ChecklistItem } from '../data/types';

// Set worker source once at module load — Vite copies the worker file to assets
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

// ─── HTML Checklist Parser ────────────────────────────────────────────────────

const TABLE_NOTE_PREFIX = 'data:table/json,';
const EM_DASH = '\u2014'; // —

interface JsAnnotation {
  type: 'caution' | 'note' | 'warning';
  text: string;
}

interface JsPhaseData {
  name: string;
  type: string;
  /** Ordered list: string = checklist item text, JsAnnotation = caution/note/warning */
  items: Array<string | JsAnnotation>;
}

interface RefTableData {
  label: string;
  rows: string[][];
}

function htmlToTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Extract the content between the opening bracket at `startBracket` and its
 * matching closing bracket, tracking string literals (including backticks) to
 * avoid false matches.
 */
function extractBracketContent(text: string, startBracket: number): string {
  let depth = 0;
  let inString = false;
  let stringChar = '';
  for (let i = startBracket; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (c === '\\' && stringChar !== '`') { i++; continue; }
      if (c === stringChar) inString = false;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inString = true; stringChar = c; continue; }
    if (c === '[' || c === '{') depth++;
    else if (c === ']' || c === '}') {
      depth--;
      if (depth === 0) return text.slice(startBracket + 1, i);
    }
  }
  return '';
}

/**
 * Walk the raw items-array content and return an ordered list of string items
 * and annotation objects, preserving their original interleaved order.
 * Comment lines (// ...) are skipped.
 */
function parseItemsFromArray(
  content: string,
): Array<string | JsAnnotation> {
  const result: Array<string | JsAnnotation> = [];
  let i = 0;

  while (i < content.length) {
    const c = content[i];

    // Whitespace / commas
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === ',') { i++; continue; }

    // Line comment
    if (c === '/' && content[i + 1] === '/') {
      while (i < content.length && content[i] !== '\n') i++;
      continue;
    }

    // Quoted string item (" or ')
    if (c === '"' || c === "'") {
      let str = '';
      let j = i + 1;
      while (j < content.length) {
        const ch = content[j];
        if (ch === '\\') { str += content[j + 1] ?? ''; j += 2; continue; }
        if (ch === c) { j++; break; }
        str += ch;
        j++;
      }
      const raw = str.trim();
      if (raw.length > 0) result.push(raw);
      i = j;
      continue;
    }

    // Backtick template literal at top level → plain string item
    if (c === '`') {
      let str = '';
      let j = i + 1;
      while (j < content.length) {
        const ch = content[j];
        if (ch === '\\') { str += content[j + 1] ?? ''; j += 2; continue; }
        if (ch === '`') { j++; break; }
        str += ch;
        j++;
      }
      const raw = str.trim();
      if (raw.length > 0) result.push(raw);
      i = j;
      continue;
    }

    // Object item { type: "caution"|"note"|"warning", text: `...` }
    if (c === '{') {
      let depth = 1;
      let j = i + 1;
      let inStr = false;
      let strCh = '';
      while (j < content.length && depth > 0) {
        const ch = content[j];
        if (inStr) {
          if (ch === '\\' && strCh !== '`') { j += 2; continue; }
          if (ch === strCh) inStr = false;
        } else {
          if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; }
          else if (ch === '{') depth++;
          else if (ch === '}') depth--;
        }
        j++;
      }
      const objText = content.slice(i, j);

      const typeMatch = objText.match(/\btype\s*:\s*["']([^"']+)["']/);
      const textBtMatch = objText.match(/\btext\s*:\s*`([\s\S]*?)`/);
      const textQMatch = objText.match(/\btext\s*:\s*["']((?:[^"'\\]|\\.)*)["']/);

      const type = typeMatch?.[1]?.toLowerCase();
      const text = (textBtMatch?.[1] ?? textQMatch?.[1] ?? '').trim();

      if ((type === 'caution' || type === 'note' || type === 'warning') && text.length > 0) {
        result.push({ type: type as 'caution' | 'note' | 'warning', text });
      }

      i = j;
      continue;
    }

    i++;
  }

  return result;
}

/**
 * Parse a single phase object from its JS source text.
 * Expected shape: { name: "...", type: "...", items: ["...", ...] }
 */
function parsePhaseObject(objText: string): JsPhaseData | null {
  const nameMatch = objText.match(/name:\s*"([^"]+)"/);
  if (!nameMatch) return null;
  const typeMatch = objText.match(/type:\s*"([^"]+)"/);
  const type = typeMatch ? typeMatch[1] : 'normal';

  const itemsStart = objText.indexOf('items:');
  if (itemsStart === -1) return null;
  const bracketIdx = objText.indexOf('[', itemsStart);
  if (bracketIdx === -1) return null;

  const itemsContent = extractBracketContent(objText, bracketIdx);
  const mixedItems = parseItemsFromArray(itemsContent);

  return { name: nameMatch[1], type, items: mixedItems };
}

/**
 * Parse the `const phases = [...]` JS array from a script block.
 */
function parseJsPhasesFromScript(scriptText: string): JsPhaseData[] {
  const phases: JsPhaseData[] = [];

  const declIdx = scriptText.indexOf('const phases = [');
  if (declIdx === -1) return phases;
  const arrStart = scriptText.indexOf('[', declIdx);
  if (arrStart === -1) return phases;

  const arrContent = extractBracketContent(scriptText, arrStart);

  // Walk the array content, collecting top-level { } objects
  let objStart = -1;
  let objDepth = 0;
  let inStr = false;
  let strChar = '';

  for (let i = 0; i < arrContent.length; i++) {
    const c = arrContent[i];
    if (inStr) {
      // Backtick strings don't use backslash escapes the same way as " and '
      if (c === '\\' && strChar !== '`') { i++; continue; }
      if (c === strChar) inStr = false;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = true; strChar = c; continue; }
    if (c === '{') {
      if (objDepth === 0) objStart = i;
      objDepth++;
    } else if (c === '}') {
      objDepth--;
      if (objDepth === 0 && objStart !== -1) {
        const objText = arrContent.slice(objStart, i + 1);
        const phase = parsePhaseObject(objText);
        if (phase) phases.push(phase);
        objStart = -1;
      }
    }
  }

  return phases;
}

/**
 * Extract HTML table rows from a DOM table element.
 * Returns rows as string[][], with a synthetic header prepended
 * if the table has no <th> elements.
 */
function extractTableRowsFromEl(table: HTMLTableElement): string[][] {
  const rows: string[][] = [];
  const hasHeader = table.querySelector('th') !== null;

  for (const tr of table.querySelectorAll('tr')) {
    const cells: string[] = [];
    for (const cell of tr.querySelectorAll('th, td')) {
      cells.push(((cell.textContent ?? '').replace(/\s+/g, ' ')).trim());
    }
    if (cells.some(c => c.length > 0)) rows.push(cells);
  }

  if (!hasHeader && rows.length > 0) {
    const numCols = rows[0].length;
    const header = numCols === 2
      ? ['Specification', 'Value']
      : Array.from({ length: numCols }, (_, i) => `Col ${i + 1}`);
    rows.unshift(header);
  }

  return rows;
}

/**
 * Find all HTML template-literal entries of the form
 *   title: "...", html: `...`
 * inside the AIRCRAFT_PERFORMANCE / CHARTS JS objects and extract tables.
 */
function parseRefTablesFromScript(scriptText: string): RefTableData[] {
  const tables: RefTableData[] = [];

  // Match: title: "LABEL", html: `HTML_CONTENT`
  // Using a regex that stops at the first unescaped backtick
  const entryRe = /title:\s*"([^"]+)",\s*html:\s*`([\s\S]*?)`/g;
  let match: RegExpExecArray | null;

  while ((match = entryRe.exec(scriptText)) !== null) {
    const sectionTitle = match[1].trim();
    const htmlContent = match[2];

    // Parse the HTML fragment in a sandbox element
    const container = document.createElement('div');
    container.innerHTML = htmlContent;

    let currentLabel = sectionTitle;
    const elements = container.querySelectorAll('h3, table');

    for (const el of elements) {
      if (el.tagName === 'H3') {
        currentLabel = el.textContent?.trim() || sectionTitle;
      } else if (el.tagName === 'TABLE') {
        const rows = extractTableRowsFromEl(el as HTMLTableElement);
        if (rows.length > 1) { // at least header + 1 data row
          tables.push({ label: currentLabel, rows });
          // Reset label so next table gets the next h3
          currentLabel = sectionTitle;
        }
      }
    }
  }

  return tables;
}

/**
 * Parse a FlightCheck-style HTML checklist file.
 *
 * The format expected:
 *  - Aircraft name in <title> tag
 *  - Checklist items in a `const phases = [...]` JS array inside a <script>
 *    Each phase: { name: "NAME", type: "normal"|"emergency"|"abnormal", items: ["Label — State", ...] }
 *  - Reference tables in AIRCRAFT_PERFORMANCE / CHARTS JS objects as HTML template literals
 */
// Phase types that map to named categories (not the main checklist)
const CATEGORY_PHASE_TYPES: Record<string, string> = {
  emergency: 'Emergency',
  abnormal: 'Abnormal',
  performance: 'Performance',
};

export function parseHtmlChecklist(
  htmlText: string,
): { plane: Plane; checklist: PlaneChecklist; categories: Record<string, PlaneChecklist> } {
  const doc = new DOMParser().parseFromString(htmlText, 'text/html');

  // Extract plane name from <title>
  const rawTitle = doc.querySelector('title')?.textContent?.trim() ?? '';
  const planeName = rawTitle.replace(/\s*checklist\s*$/i, '').trim() || 'Imported Aircraft';
  const planeId = planeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Collect all <script> text
  const scriptText = Array.from(doc.querySelectorAll('script'))
    .map(s => s.textContent ?? '')
    .join('\n');

  // Parse checklist phases from JS
  const jsPhases = parseJsPhasesFromScript(scriptText);

  // Bucket phases: normal → main checklist, others → named categories
  const mainPhases: ChecklistPhase[] = [];
  const categoryPhaseMap: Record<string, ChecklistPhase[]> = {};

  jsPhases.forEach((p, i) => {
    const phaseId = `phase-${p.type}-${i}`;
    const title = htmlToTitleCase(p.name);

    let itemIdx = 0;
    const items: ChecklistItem[] = p.items
      .filter(entry => {
        if (typeof entry === 'string') return entry.trim().length > 0;
        return true; // keep all annotation objects
      })
      .map((entry) => {
        if (typeof entry !== 'string') {
          // Annotation object — stored inline as a special ChecklistItem
          const ann = entry as JsAnnotation;
          return {
            id: `${phaseId}-ann-${itemIdx++}`,
            label: ann.text,
            annotationType: ann.type,
          };
        }
        // Regular checklist item
        const raw = entry;
        const sepIdx = raw.indexOf(` ${EM_DASH} `);
        const label = sepIdx >= 0 ? raw.slice(0, sepIdx).trim() : raw.trim();
        const expectedState = sepIdx >= 0 ? raw.slice(sepIdx + 3).trim() : undefined;
        return {
          id: `${phaseId}-item-${itemIdx++}`,
          label,
          expectedState: expectedState || undefined,
        };
      });

    if (items.length === 0) return;

    const phase: ChecklistPhase = { id: phaseId, title, items };

    const categoryName = CATEGORY_PHASE_TYPES[p.type.toLowerCase()];
    if (categoryName) {
      (categoryPhaseMap[categoryName] ??= []).push(phase);
    } else {
      mainPhases.push(phase);
    }
  });

  // Parse reference tables from JS template literals → Reference Tables category
  const refTables = parseRefTablesFromScript(scriptText);
  if (refTables.length > 0) {
    const refPhaseId = 'phase-reference-tables';
    (categoryPhaseMap['Reference Tables'] ??= []).push({
      id: refPhaseId,
      title: 'Reference Tables',
      items: refTables.map((t, i) => ({
        id: `${refPhaseId}-${i}`,
        label: t.label,
        reference: `${TABLE_NOTE_PREFIX}${JSON.stringify(t.rows)}`,
      })),
    });
  }

  if (mainPhases.length === 0 && Object.keys(categoryPhaseMap).length === 0) {
    throw new Error(
      'No checklist data found in this HTML file. ' +
      'The parser expects a HTML checklist with a const phases = [...] array in a <script> block.',
    );
  }

  const plane: Plane = {
    id: planeId,
    name: planeName,
    manufacturer: '',
    image: '',
    type: 'GA',
  };

  const checklist: PlaneChecklist = { planeId, phases: mainPhases };

  const categories: Record<string, PlaneChecklist> = {};
  for (const [catName, phases] of Object.entries(categoryPhaseMap)) {
    categories[catName] = { planeId, phases };
  }

  return { plane, checklist, categories };
}

/**
 * Extract text from a PDF file using pdfjs-dist.
 */
async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const lines: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = (content.items as Array<Record<string, unknown>>)
      .filter(item => typeof item.str === 'string')
      .map(item => item.str as string)
      .join(' ');
    lines.push(pageText);
  }

  return lines.join('\n');
}

/**
 * Extract text from a DOCX file using mammoth.
 */
async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Extract text from a supported file (PDF or DOCX).
 */
export async function extractFileText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) {
    return extractPdfText(file);
  }
  if (name.endsWith('.docx')) {
    return extractDocxText(file);
  }
  if (name.endsWith('.txt') || name.endsWith('.csv')) {
    return file.text();
  }
  if (name.endsWith('.html') || name.endsWith('.htm')) {
    return file.text();
  }
  throw new Error('Unsupported file type. Please upload a PDF, DOCX, TXT, or HTML file.');
}

/**
 * Heuristic parser: takes raw text extracted from a checklist document
 * and attempts to identify phases and items.
 *
 * Common patterns:
 * - Phase headers: ALL CAPS lines, or lines ending with ':'
 * - Items: lines with dots/dashes separating label from state
 * - Items: "Label ......... STATE" or "Label - STATE" or "Label\tSTATE"
 */
export function parseChecklistText(
  text: string,
  planeName: string,
  manufacturer: string,
): { plane: Plane; checklist: PlaneChecklist } {
  const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

  const phases: ChecklistPhase[] = [];
  let currentPhase: ChecklistPhase | null = null;

  for (const line of rawLines) {
    // Skip very short lines (page numbers, etc.)
    if (line.length < 3) continue;

    // Detect phase header heuristics:
    // 1. ALL CAPS line (at least 3 chars, mostly letters)
    // 2. Line ending with ':' that doesn't contain dots/dashes pattern
    // 3. Common phase keywords
    if (isPhaseHeader(line)) {
      const title = cleanPhaseTitle(line);
      if (title.length < 2) continue;
      const phaseId = `phase-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${phases.length}`;
      currentPhase = { id: phaseId, title, items: [] };
      phases.push(currentPhase);
      continue;
    }

    // Try to parse as a checklist item
    const parsed = parseItemLine(line);
    if (parsed) {
      if (!currentPhase) {
        // Create a default phase if items appear before any header
        currentPhase = { id: 'phase-general-0', title: 'General', items: [] };
        phases.push(currentPhase);
      }
      const itemId = `${currentPhase.id}-item-${currentPhase.items.length}`;
      const item: ChecklistItem = {
        id: itemId,
        label: parsed.label,
        expectedState: parsed.state || undefined,
      };
      currentPhase.items.push(item);
    }
  }

  // Filter out empty phases
  const nonEmptyPhases = phases.filter(p => p.items.length > 0);

  if (nonEmptyPhases.length === 0) {
    throw new Error(
      'Could not parse any checklist items from this file. ' +
      'The parser looks for phase headers (ALL CAPS or ending with ":") ' +
      'and items with labels and states separated by dots, dashes, or tabs.',
    );
  }

  const planeId = planeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const plane: Plane = {
    id: planeId,
    name: planeName,
    manufacturer,
    image: '',
    type: 'GA',
  };

  const checklist: PlaneChecklist = {
    planeId,
    phases: nonEmptyPhases,
  };

  return { plane, checklist };
}

function isPhaseHeader(line: string): boolean {
  // Remove trailing colon for analysis
  const clean = line.replace(/:$/, '').trim();

  // ALL CAPS with at least 3 letter characters
  const letters = clean.replace(/[^a-zA-Z]/g, '');
  if (letters.length >= 3 && clean === clean.toUpperCase() && /[A-Z]/.test(clean)) {
    // But not if it looks like an item (contains dots or common separators)
    if (!/\.{3,}|_{3,}|-{3,}|\t/.test(line)) {
      return true;
    }
  }

  // Ends with colon and is relatively short (likely a header)
  if (line.endsWith(':') && line.length < 60 && !/\.{3,}/.test(line)) {
    return true;
  }

  // Common checklist phase keywords (case-insensitive match for full line)
  const phaseKeywords = /^(pre[- ]?flight|before\s|after\s|engine\s|taxi|takeoff|take-off|landing|climb|cruise|descent|approach|shutdown|securing|startup|run[- ]?up)/i;
  if (phaseKeywords.test(clean) && clean.length < 50 && !/\.{3,}|_{3,}/.test(line)) {
    return true;
  }

  return false;
}

function cleanPhaseTitle(line: string): string {
  return line
    .replace(/:$/, '')
    .replace(/^\d+[.)]\s*/, '') // Remove leading numbers like "1." or "1)"
    .trim()
    // Title case: first letter of each word uppercase, rest lowercase
    .replace(/\w\S*/g, txt =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
}

function parseItemLine(line: string): { label: string; state: string } | null {
  // Skip lines that are too short or look like headers/noise
  if (line.length < 5) return null;

  // Pattern 1: "Label ......... STATE" or "Label _____ STATE"
  const dotsMatch = line.match(/^(.+?)\s*[._]{3,}\s*(.+)$/);
  if (dotsMatch) {
    return { label: dotsMatch[1].trim(), state: dotsMatch[2].trim() };
  }

  // Pattern 2: "Label - STATE" or "Label -- STATE" (with short state)
  const dashMatch = line.match(/^(.{5,}?)\s+-{1,3}\s+([A-Z][A-Z0-9 /()]{1,40})$/);
  if (dashMatch) {
    return { label: dashMatch[1].trim(), state: dashMatch[2].trim() };
  }

  // Pattern 3: Tab-separated "Label\tSTATE"
  const tabMatch = line.match(/^(.+?)\t+(.+)$/);
  if (tabMatch && tabMatch[2].trim().length < 40) {
    return { label: tabMatch[1].trim(), state: tabMatch[2].trim() };
  }

  // Pattern 4: "Label    STATE" (multiple spaces, state is ALL CAPS)
  const spacesMatch = line.match(/^(.{5,}?)\s{3,}([A-Z][A-Z0-9 /()]{1,40})$/);
  if (spacesMatch) {
    return { label: spacesMatch[1].trim(), state: spacesMatch[2].trim() };
  }

  // Pattern 5: Just a label with no state (common in simpler checklists)
  // Only if it starts with a bullet, checkbox, number, or dash
  const bulletMatch = line.match(/^[-\u2022\u25CB\u25A1\u2610□○●]\s+(.+)$/);
  if (bulletMatch) {
    return { label: bulletMatch[1].trim(), state: '' };
  }

  // Pattern 6: Numbered item "1. Label" or "1) Label"
  const numberedMatch = line.match(/^\d+[.)]\s+(.+)$/);
  if (numberedMatch && !isPhaseHeader(line)) {
    return { label: numberedMatch[1].trim(), state: '' };
  }

  return null;
}
