import type { Plane, PlaneChecklist } from '../data/types';

const EM_DASH = '\u2014';
const TABLE_NOTE_PREFIX = 'data:table/json,';

// Strip any "Category: " prefix that was baked in during HTML import
// e.g. "Abnormal: Ac Door Illuminated" → "Ac Door Illuminated"
const CATEGORY_PREFIXES = ['emergency: ', 'abnormal: ', 'reference: ', 'reference tables: ', 'caution: ', 'note: '];
function stripCategoryPrefix(title: string): string {
  const lower = title.toLowerCase();
  for (const prefix of CATEGORY_PREFIXES) {
    if (lower.startsWith(prefix)) return title.slice(prefix.length).trim();
  }
  return title;
}

/**
 * Export a single plane + all its category checklists as the Format 6 JSON
 * structure (aircraft / nickname / checklist array with phase-level type field).
 * Categories are merged back into the phases array with the appropriate type.
 */
export function exportPlaneAsJson(
  plane: Plane,
  checklists: Record<string, PlaneChecklist>,
): void {
  // Collect all checklist phases, tagging each phase with its category type
  const allPhases: Array<{
    title: string;
    type?: string;
    items: Array<{ callout: string; response?: string }>;
  }> = [];

  // Normal checklist first
  const mainChecklist = checklists[plane.id];
  if (mainChecklist) {
    for (const phase of mainChecklist.phases) {
      allPhases.push({
        title: stripCategoryPrefix(phase.title),
        items: phase.items.map(item => {
          if (item.annotationType) return { type: item.annotationType, callout: item.label };
          return {
            callout: item.label,
            ...(item.expectedState ? { response: item.expectedState } : {}),
          };
        }),
      });
    }
  }

  // Category checklists (Emergency, Abnormal, Reference, and any custom)
  for (const [key, cl] of Object.entries(checklists)) {
    if (!key.startsWith(`${plane.id}::`)) continue;
    const categoryName = key.split('::')[1];
    const typeValue = categoryName.toLowerCase();
    for (const phase of cl.phases) {
      allPhases.push({
        title: stripCategoryPrefix(phase.title),
        type: typeValue,
        items: phase.items.map(item => {
          if (item.annotationType) return { type: item.annotationType, callout: item.label };
          return {
            callout: item.label,
            ...(item.expectedState ? { response: item.expectedState } : {}),
          };
        }),
      });
    }
  }

  const json = {
    aircraft: plane.name,
    nickname: plane.name,
    checklist: allPhases,
  };

  triggerDownload(
    JSON.stringify(json, null, 2),
    `${plane.id}-checklist.json`,
    'application/json',
  );
}

/**
 * Export a plane's checklists as a reader-friendly JSON (no reference table items).
 * Phases with no remaining items are omitted. Reference Tables category is excluded entirely.
 */
export function exportPlaneAsChecklistJson(
  plane: Plane,
  checklists: Record<string, PlaneChecklist>,
): void {
  const allPhases: Array<{
    title: string;
    type?: string;
    items: Array<{ callout: string; response?: string }>;
  }> = [];

  const addPhases = (cl: PlaneChecklist, type?: string) => {
    for (const phase of cl.phases) {
      const items = phase.items
        .filter(item => !item.annotationType && !item.reference?.startsWith(TABLE_NOTE_PREFIX))
        .map(item => ({
          callout: item.label,
          ...(item.expectedState ? { response: item.expectedState } : {}),
        }));
      if (items.length === 0) continue;
      allPhases.push({
        title: stripCategoryPrefix(phase.title),
        ...(type ? { type } : {}),
        items,
      });
    }
  };

  const mainChecklist = checklists[plane.id];
  if (mainChecklist) addPhases(mainChecklist);

  for (const [key, cl] of Object.entries(checklists)) {
    if (!key.startsWith(`${plane.id}::`)) continue;
    const categoryName = key.split('::')[1];
    if (categoryName.toLowerCase() === 'reference tables') continue;
    addPhases(cl, categoryName.toLowerCase());
  }

  const json = {
    aircraft: plane.name,
    nickname: plane.name,
    checklist: allPhases,
  };

  triggerDownload(
    JSON.stringify(json, null, 2),
    `${plane.id}-checklist-reader.json`,
    'application/json',
  );
}

/**
 * Export a single plane + all its category checklists as a self-contained
 * HTML file matching the format expected by parseHtmlChecklist().
 *
 * Structure:
 *  - <title> = plane name + " Checklist"
 *  - const phases = [...] JS array in a <script> block
 *    Each phase: { name: "NAME", type: "normal"|"emergency"|"abnormal"|..., items: ["Label — State", ...] }
 *  - Reference table items are rendered as inline HTML tables inside
 *    AIRCRAFT_PERFORMANCE template literals so the parser can re-import them
 */
export function exportPlaneAsHtml(
  plane: Plane,
  checklists: Record<string, PlaneChecklist>,
): void {
  // Build phase data for the JS array
  interface ExportPhase {
    name: string;
    type: string;
    items: Array<string | { type: string; text: string }>;
    refTables?: Array<{ label: string; rows: string[][] }>;
  }

  const exportPhases: ExportPhase[] = [];

  const addPhases = (cl: PlaneChecklist, type: string) => {
    for (const phase of cl.phases) {
      const items: Array<string | { type: string; text: string }> = [];
      const refTables: Array<{ label: string; rows: string[][] }> = [];

      // Inline annotations and regular items in order
      for (const item of phase.items) {
        if (item.annotationType) {
          items.push({ type: item.annotationType, text: item.label });
          continue;
        }
        if (item.reference?.startsWith(TABLE_NOTE_PREFIX)) {
          try {
            const rawRows = item.reference.slice(TABLE_NOTE_PREFIX.length);
            const rows: string[][] = typeof rawRows === 'string' ? JSON.parse(rawRows) : rawRows;
            if (Array.isArray(rows)) refTables.push({ label: item.label, rows });
          } catch { /* skip */ }
        } else {
          const state = item.expectedState ? ` ${EM_DASH} ${item.expectedState}` : '';
          items.push(`${item.label}${state}`);
        }
      }

      if (items.length > 0 || refTables.length > 0) {
        exportPhases.push({ name: phase.title, type, items, refTables });
      }
    }
  };

  // Normal checklist
  const mainChecklist = checklists[plane.id];
  if (mainChecklist) addPhases(mainChecklist, 'normal');

  // Category checklists
  for (const [key, cl] of Object.entries(checklists)) {
    if (!key.startsWith(`${plane.id}::`)) continue;
    const categoryName = key.split('::')[1].toLowerCase();
    addPhases(cl, categoryName);
  }

  // Collect all reference tables for the AIRCRAFT_PERFORMANCE block
  const allRefTables = exportPhases.flatMap(p => p.refTables ?? []);

  // Build the JS phases array string
  const phasesJs = exportPhases
    .map(p => {
      const itemsJs = p.items
        .map(i => {
          if (typeof i === 'string') {
            return `"${i.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
          }
          // Annotation object — use backtick string for text to match source format
          const escapedText = i.text.replace(/\\/g, '\\\\').replace(/`/g, '\\`');
          return `{ type: "${i.type}", text: \`${escapedText}\` }`;
        })
        .join(',\n        ');
      return `  {
    name: "${p.name.replace(/"/g, '\\"')}",
    type: "${p.type}",
    items: [
        ${itemsJs}
    ]
  }`;
    })
    .join(',\n  ');

  // Build AIRCRAFT_PERFORMANCE block for reference tables
  let perfJs = '';
  if (allRefTables.length > 0) {
    const entries = allRefTables.map(t => {
      const tableHtml = buildHtmlTable(t.rows);
      return `  { title: "${t.label.replace(/"/g, '\\"')}", html: \`${tableHtml}\` }`;
    }).join(',\n  ');
    perfJs = `\nconst AIRCRAFT_PERFORMANCE = [\n  ${entries}\n];\n`;
  }

  const safeId = plane.id.replace(/[^a-z0-9-]/g, '-');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(plane.name)} Checklist</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
    h1 { font-size: 1.5rem; }
    h2 { font-size: 1.1rem; margin-top: 1.5rem; border-bottom: 1px solid #ccc; padding-bottom: 0.25rem; }
    ul { list-style: none; padding: 0; }
    li { padding: 0.2rem 0; }
    .type-emergency h2 { color: #c00; }
    .type-abnormal h2 { color: #c80; }
    table { border-collapse: collapse; width: 100%; margin: 0.5rem 0; font-size: 0.85rem; }
    th, td { border: 1px solid #ccc; padding: 0.25rem 0.5rem; text-align: left; }
    th { background: #f0f0f0; }
  </style>
</head>
<body>
  <h1>${escHtml(plane.name)} Checklist</h1>

  <div id="checklist-${safeId}"></div>
  <script>
const phases = [
  ${phasesJs}
];
${perfJs}
// Render checklist for human reading
(function() {
  const container = document.getElementById('checklist-${safeId}');
  if (!container) return;
  phases.forEach(function(phase) {
    const section = document.createElement('div');
    section.className = 'type-' + phase.type;
    const h2 = document.createElement('h2');
    h2.textContent = (phase.type !== 'normal' ? phase.type.charAt(0).toUpperCase() + phase.type.slice(1) + ': ' : '') + phase.name;
    section.appendChild(h2);
    const ul = document.createElement('ul');
    phase.items.forEach(function(item) {
      const li = document.createElement('li');
      li.textContent = item;
      ul.appendChild(li);
    });
    section.appendChild(ul);
    container.appendChild(section);
  });
})();
  </script>
</body>
</html>`;

  triggerDownload(html, `${plane.id}-checklist.html`, 'text/html');
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHtmlTable(rows: string[][]): string {
  if (rows.length === 0) return '';
  const [header, ...dataRows] = rows;
  const ths = header.map(h => `<th>${escHtml(h)}</th>`).join('');
  const trs = dataRows.map(row =>
    `<tr>${row.map(cell => `<td>${escHtml(cell)}</td>`).join('')}</tr>`
  ).join('');
  return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
}
