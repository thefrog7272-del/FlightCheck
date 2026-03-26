import type { Plane, PlaneChecklist, ChecklistPhase, ChecklistItem } from '../data/types';

/**
 * Parses a CSV string and returns a Plane and PlaneChecklist object.
 * 
 * CSV Format expected:
 * name,manufacturer,type,image,phase,item,expectedState
 * "Cessna 182","Cessna","GA","https://...","Pre-Start","Battery","ON"
 * 
 * @param csvContent The raw CSV text content.
 */
export function parsePlaneCsv(csvContent: string): { plane: Plane; checklist: PlaneChecklist } {
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
    notes: headers.indexOf('notes')
  };

  // Check required headers
  if (col.name === -1 || col.manufacturer === -1 || col.phase === -1 || col.item === -1) {
    throw new Error('CSV missing required headers: name, manufacturer, phase, item');
  }

  // Data extraction
  let planeData: Partial<Plane> = {};
  const phasesMap: Map<string, ChecklistPhase> = new Map();

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

    if (!phaseTitle || !itemLabel) continue;

    // Use first row to define the plane
    if (i === 1) {
      const planeId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      planeData = { id: planeId, name, manufacturer, type, image };
    }

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
  const checklist: PlaneChecklist = {
    planeId: plane.id,
    phases: Array.from(phasesMap.values())
  };

  return { plane, checklist };
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
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map(v => v.replace(/^"|"$/g, ''));
}
