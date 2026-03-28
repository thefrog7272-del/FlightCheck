import type { Plane, PlaneChecklist, ChecklistPhase, ChecklistItem } from '../data/types';

/**
 * Parses a CSV string and returns a Plane, PlaneChecklist, and any variant checklists.
 *
 * CSV Format expected:
 * name,manufacturer,type,image,phase,item,expectedState,category
 * "Cessna 182","Cessna","GA","https://...","Pre-Start","Battery","ON",""
 * "Cessna 182","Cessna","GA","https://...","Engine Fire","Mixture","CUTOFF","Emergency"
 *
 * Items with no category, "Normal Checklist", or "Standard" go into the main checklist.
 * Items with any other category become separate variant checklists.
 *
 * @param csvContent The raw CSV text content.
 */
export function parsePlaneCsv(csvContent: string): { plane: Plane; checklist: PlaneChecklist; variants: Record<string, PlaneChecklist> } {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) throw new Error('CSV must contain a header and at least one data row.');

  // Extract header to determine column indices
  const headerLine = lines[0];
  const headers = parseCsvRow(headerLine).map(h => h.toLowerCase().trim());

  const col = {
    name: headers.indexOf('name'),
    manufacturer: headers.indexOf('manufacturer'),
    type: headers.indexOf('type'),
    image: headers.indexOf('image'),
    phase: headers.indexOf('phase'),
    item: headers.indexOf('item'),
    expectedState: headers.indexOf('expectedstate'),
    notes: headers.indexOf('notes'),
    category: Math.max(headers.indexOf('category'), headers.indexOf('checklist category'), headers.indexOf('checklistcategory')),
  };

  console.log('[FlightCheck CSV] Detected columns:', Object.entries(col).filter(([,v]) => v !== -1).map(([k,v]) => `${k}=${v}`).join(', '));
  console.log('[FlightCheck CSV] Headers found:', headers.join(', '));

  // Check required headers
  if (col.name === -1 || col.manufacturer === -1 || col.phase === -1 || col.item === -1) {
    throw new Error('CSV missing required headers: name, manufacturer, phase, item');
  }

  const MAIN_KEY = '__main__';

  // Data extraction
  let planeData: Partial<Plane> = {};
  const categoryPhaseMaps: Map<string, Map<string, ChecklistPhase>> = new Map();

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvRow(lines[i]);
    // Require at least the mandatory columns (name, manufacturer, phase, item)
    const minCols = Math.max(col.name, col.manufacturer, col.phase, col.item) + 1;
    if (values.length < minCols) continue;

    const name = values[col.name].trim();
    const manufacturer = values[col.manufacturer].trim();
    const type = col.type !== -1 && values[col.type] ? values[col.type].trim() : 'GA';
    const image = col.image !== -1 && values[col.image] ? values[col.image].trim() : '';
    const phaseTitle = values[col.phase]?.trim();
    const itemLabel = values[col.item]?.trim();
    const expectedState = col.expectedState !== -1 && values[col.expectedState] ? values[col.expectedState].trim() : undefined;
    const notes = col.notes !== -1 && values[col.notes] ? values[col.notes].trim() : undefined;

    // Determine category
    const category = col.category !== -1 && values[col.category] ? values[col.category].trim() : '';
    const isMain = !category || category.toLowerCase() === 'normal checklist' || category.toLowerCase() === 'standard';
    const mapKey = isMain ? MAIN_KEY : category;

    if (!phaseTitle || !itemLabel) continue;

    // Use first row to define the plane
    if (i === 1) {
      const planeId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      planeData = { id: planeId, name, manufacturer, type, image };
    }

    // Get or create the phases map for this category
    if (!categoryPhaseMaps.has(mapKey)) {
      categoryPhaseMaps.set(mapKey, new Map());
    }
    const phasesMap = categoryPhaseMaps.get(mapKey)!;

    // Process phase and item
    if (!phasesMap.has(phaseTitle)) {
      const phaseId = phaseTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
      phasesMap.set(phaseTitle, { id: phaseId, title: phaseTitle, items: [] });
    }

    const currentPhase = phasesMap.get(phaseTitle)!;
    const itemId = itemLabel.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const newItem: ChecklistItem = {
      id: `${currentPhase.id}-${itemId}-${currentPhase.items.length}`,
      label: itemLabel,
      expectedState,
      notes,
    };

    currentPhase.items.push(newItem);
  }

  if (!planeData.id) throw new Error('Failed to parse plane information from CSV.');

  const plane: Plane = planeData as Plane;

  // Build the main checklist from the __main__ key
  const mainPhasesMap = categoryPhaseMaps.get(MAIN_KEY) ?? new Map();
  const checklist: PlaneChecklist = {
    planeId: plane.id,
    phases: Array.from(mainPhasesMap.values())
  };

  // Build variant checklists from all other keys
  const variants: Record<string, PlaneChecklist> = {};
  for (const [key, phasesMap] of categoryPhaseMaps) {
    if (key === MAIN_KEY) continue;
    variants[key] = {
      planeId: plane.id,
      phases: Array.from(phasesMap.values()),
    };
  }

  const mainItems = checklist.phases.reduce((s, p) => s + p.items.length, 0);
  const variantNames = Object.keys(variants);
  console.log(`[FlightCheck CSV] Parsed: "${plane.name}" → main checklist: ${checklist.phases.length} phases, ${mainItems} items. Variants: ${variantNames.length > 0 ? variantNames.join(', ') : 'none'}`);

  return { plane, checklist, variants };
}

/**
 * Splits a CSV row while respecting quoted values containing commas.
 */
function parseCsvRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (inQuotes) {
      if (char === '"') {
        if (row[i + 1] === '"') {
          // RFC 4180: "" inside a quoted field is an escaped literal "
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}
