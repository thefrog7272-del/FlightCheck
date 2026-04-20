const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

async function fetchPlanes() {
  const { data, error } = await supabase
    .from('shared_planes')
    .select('*')
    .order('sort_order', { ascending: true, nullsFirst: false });
  if (error) throw new Error(`Failed to fetch planes: ${error.message}`);
  return data ?? [];
}

async function fetchChecklists() {
  const { data, error } = await supabase
    .from('shared_checklists')
    .select('*');
  if (error) throw new Error(`Failed to fetch checklists: ${error.message}`);
  return data ?? [];
}

function buildPlanesFile(records) {
  const planes = records.map(r => {
    const entry = {
      id: r.plane_id,
      name: r.name,
      manufacturer: r.manufacturer,
      image: r.image,
      type: r.type,
    };
    if (r.sim) entry.sim = r.sim;
    return entry;
  });

  const json = JSON.stringify(planes, null, 2)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"/g, '"');

  return `import type { Plane } from './types';

export const planes: Plane[] = ${json};
`;
}

function buildChecklistsFile(records) {
  const checklists = {};
  for (const r of records) {
    // The variant_name column was dropped. Non-normal categories (Emergency,
    // Abnormal, Reference tables) still need a disambiguated key so multiple
    // checklists per plane_id don't collide in the static-data map.
    const category = typeof r.category === 'string' ? r.category : '';
    const isNormal = !category || category.toLowerCase() === 'normal';
    const key = isNormal ? r.plane_id : `${r.plane_id}::${category}`;
    checklists[key] = {
      planeId: r.plane_id,
      phases: JSON.parse(r.phases),
    };
  }

  const json = JSON.stringify(checklists, null, 2);

  return `import type { PlaneChecklist } from './types';

export const checklists: Record<string, PlaneChecklist> = ${json};
`;
}

async function main() {
  console.log('Fetching planes from Supabase...');
  const planes = await fetchPlanes();
  console.log(`  → ${planes.length} planes fetched`);

  console.log('Fetching checklists from Supabase...');
  const checklists = await fetchChecklists();
  console.log(`  → ${checklists.length} checklists fetched`);

  const planesContent = buildPlanesFile(planes);
  const checklistsContent = buildChecklistsFile(checklists);

  const planesPath = path.join(DATA_DIR, 'planes.ts');
  const checklistsPath = path.join(DATA_DIR, 'checklists.ts');

  const existingPlanes = fs.existsSync(planesPath) ? fs.readFileSync(planesPath, 'utf8') : '';
  const existingChecklists = fs.existsSync(checklistsPath) ? fs.readFileSync(checklistsPath, 'utf8') : '';

  if (planesContent === existingPlanes && checklistsContent === existingChecklists) {
    console.log('No changes detected. Static data is up to date.');
    return;
  }

  fs.writeFileSync(planesPath, planesContent);
  fs.writeFileSync(checklistsPath, checklistsContent);
  console.log('Static data updated successfully.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
