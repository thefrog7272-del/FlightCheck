import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const PLANES_FILE = path.join(ROOT, 'src/data/planes.ts');
const CHECKLISTS_FILE = path.join(ROOT, 'src/data/checklists.ts');
const OUTPUT_FILE = path.join(ROOT, 'supabase/seed-from-static.sql');

function sqlEscape(str) {
  if (str === undefined || str === null) return 'NULL';
  return "'" + str.replace(/\\/g, '\\\\').replace(/'/g, "''") + "'";
}

function main() {
  const planesRaw = fs.readFileSync(PLANES_FILE, 'utf-8');
  const checklistsRaw = fs.readFileSync(CHECKLISTS_FILE, 'utf-8');

  // Extract the array literal for planes
  const planesMatch = planesRaw.match(/export const planes:\s*Plane\[\]\s*=\s*(\[[\s\S]*\]);?\s*$/);
  if (!planesMatch) {
    console.error('ERROR: Could not parse planes.ts');
    process.exit(1);
  }

  // Evaluate the array literal to get actual JS objects
  const planes = eval(`(${planesMatch[1]})`);

  // Extract the object literal for checklists
  const checklistsMatch = checklistsRaw.match(/export const checklists:\s*Record<string,\s*PlaneChecklist>\s*=\s*(\{[\s\S]*\});?\s*$/);
  if (!checklistsMatch) {
    console.error('ERROR: Could not parse checklists.ts');
    process.exit(1);
  }

  const checklists = eval(`(${checklistsMatch[1]})`);

  console.log(`Found ${planes.length} planes`);
  console.log(`Found ${Object.keys(checklists).length} checklists`);

  const lines = [];
  lines.push('-- Auto-generated Supabase seed data');
  lines.push('-- Source: src/data/planes.ts + src/data/checklists.ts');
  lines.push(`-- Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('-- Clear existing data (remove if appending)');
  lines.push('DELETE FROM shared_checklists;');
  lines.push('DELETE FROM shared_planes;');
  lines.push('');

  lines.push(`-- Planes: ${planes.length} records`);
  lines.push('INSERT INTO shared_planes (id, plane_id, name, manufacturer, image, type, sim, sort_order) VALUES');

  const planeValues = planes.map((p, i) => {
    return `  (gen_random_uuid(), ${sqlEscape(p.id)}, ${sqlEscape(p.name || '')}, ${sqlEscape(p.manufacturer || '')}, ${sqlEscape(p.image || '')}, ${sqlEscape(p.type || '')}, ${p.sim ? sqlEscape(p.sim) : 'NULL'}, ${i})`;
  });

  lines.push(planeValues.join(',\n') + ';');
  lines.push('');

  const checklistEntries = Object.entries(checklists);
  lines.push(`-- Checklists: ${checklistEntries.length} records`);
  lines.push('INSERT INTO shared_checklists (id, plane_id, variant_name, category, phases) VALUES');

  const checklistValues = checklistEntries.map(([key, val]) => {
    // Extract base plane ID for FK constraint (e.g. "plane::Emergency" -> "plane")
    const parts = val.planeId.split('::');
    const basePlaneId = parts[0];
    const variantName = parts[1] || 'Standard';

    // Determine category from variant name
    let category = 'normal';
    const variantLower = variantName.toLowerCase();
    if (variantLower === 'emergency') category = 'emergency';
    else if (variantLower === 'abnormal') category = 'abnormal';
    else if (variantLower === 'reference tables') category = 'reference_table';

    const phasesJson = JSON.stringify(val.phases);
    return `  (gen_random_uuid(), ${sqlEscape(basePlaneId)}, ${sqlEscape(variantName)}, ${sqlEscape(category)}, ${sqlEscape(phasesJson)})`;
  });

  lines.push(checklistValues.join(',\n') + ';');
  lines.push('');
  lines.push('-- Done');

  const sql = lines.join('\n');
  fs.writeFileSync(OUTPUT_FILE, sql, 'utf-8');
  console.log(`\nWritten to: ${OUTPUT_FILE}`);
  console.log(`File size: ${(Buffer.byteLength(sql) / 1024).toFixed(1)} KB`);
}

main();
