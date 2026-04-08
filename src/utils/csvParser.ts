import type { Plane, PlaneChecklist, ChecklistPhase, ChecklistItem } from '../data/types';

/**
 * Parses a CSV string and returns a Plane, PlaneChecklist, and any category checklists.
 *
 * CSV Format expected:
 * name,category,phase,item,expectedState,reference
 * "Cessna 182","","Pre-Start","Battery","ON",""
 * "Cessna 182","","Engine Fire","Mixture","CUTOFF",""
 * "Cessna 182","Reference Tables","Performance","","data:table/json,[[...]]"
 *
 * reference: optional — use "data:table/json,[[...]]" for reference tables, "data:image/..." for images.
 * category: items with no category, "Normal Checklist", or "Standard" go into the main checklist.
 *           Items with any other category become separate category checklists (e.g. "Reference Tables", "Emergency").
 *
 * @param csvContent The raw CSV text content.
 */
export function parsePlaneCsv(csvContent: string): { plane: Plane; checklist: PlaneChecklist; categories: Record<string, PlaneChecklist> } {
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
    category: headers.indexOf('category'),
    phase: headers.indexOf('phase'),
    item: headers.indexOf('item'),
    expectedState: headers.indexOf('expectedstate'),
    reference: headers.indexOf('reference'),
  };

  console.log('[FlightCheck CSV] Detected columns:', Object.entries(col).filter(([,v]) => v !== -1).map(([k,v]) => `${k}=${v}`).join(', '));
  console.log('[FlightCheck CSV] Headers found:', headers.join(', '));

  // Check required headers
  if (col.name === -1 || col.phase === -1 || col.item === -1) {
    throw new Error('CSV missing required headers: name, phase, item');
  }

  const MAIN_KEY = '__main__';

  // Data extraction
  let planeData: Partial<Plane> = {};
  const categoryPhaseMaps: Map<string, Map<string, ChecklistPhase>> = new Map();
  let planeName = '';
  let planeManufacturer = 'Unknown';
  let planeType = 'GA';
  let planeImage = '';

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvRow(lines[i]);
    // Require at least the mandatory columns (name, manufacturer, phase, item)
    const minCols = Math.max(col.name, col.phase, col.item) + 1;
    if (values.length < minCols) continue;

    const name = values[col.name]?.trim() || planeName;
    const manufacturer = col.manufacturer !== -1 && values[col.manufacturer] ? values[col.manufacturer].trim() : planeManufacturer;
    const type = col.type !== -1 && values[col.type] ? values[col.type].trim() : planeType;
    const image = col.image !== -1 && values[col.image] ? values[col.image].trim() : planeImage;
    const category = col.category !== -1 && values[col.category] ? values[col.category].trim() : '';
    const phaseTitle = values[col.phase]?.trim();
    const itemLabel = values[col.item]?.trim();
    const expectedState = col.expectedState !== -1 && values[col.expectedState] ? values[col.expectedState].trim() : undefined;
    const reference = col.reference !== -1 && values[col.reference] ? values[col.reference].trim() : undefined;

    // Determine category
    const isMain = !category || category.toLowerCase() === 'normal checklist' || category.toLowerCase() === 'standard';
    const mapKey = isMain ? MAIN_KEY : category;

    if (!phaseTitle || !itemLabel) continue;

    // Track plane info from first non-empty row
    if (!planeName && name) {
      planeName = name;
      planeManufacturer = manufacturer;
      planeType = type;
      planeImage = image;
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
      reference,
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

  // Build category checklists from all other keys
  const categories: Record<string, PlaneChecklist> = {};
  for (const [key, phasesMap] of categoryPhaseMaps) {
    if (key === MAIN_KEY) continue;
    categories[key] = {
      planeId: plane.id,
      phases: Array.from(phasesMap.values()),
    };
  }

  const mainItems = checklist.phases.reduce((s, p) => s + p.items.length, 0);
  const categoryNames = Object.keys(categories);
  console.log(`[FlightCheck CSV] Parsed: "${plane.name}" → main checklist: ${checklist.phases.length} phases, ${mainItems} items. Categories: ${categoryNames.length > 0 ? categoryNames.join(', ') : 'none'}`);

  return { plane, checklist, categories };
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
