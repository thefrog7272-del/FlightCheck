import type { Plane, PlaneChecklist, ChecklistPhase, ChecklistItem } from '../data/types';

/**
 * Extract text from a PDF file using pdfjs-dist.
 */
async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');

  // Set worker source to bundled worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const lines: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .filter((item): item is { str: string } => 'str' in item)
      .map(item => item.str)
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
  throw new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
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
