#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cwd = path.join(__dirname, '..');

let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Try to read from docker-compose.yaml if not in env
if (!supabaseUrl || !supabaseKey) {
  try {
    const yamlPath = path.join(cwd, 'docker-compose.yaml');
    if (!fs.existsSync(yamlPath)) {
      console.log('[FlightCheck] docker-compose.yaml not found at:', yamlPath);
    } else {
      const yaml = fs.readFileSync(yamlPath, 'utf-8');
      const urlMatch = yaml.match(/VITE_SUPABASE_URL=([^\s]+)/);
      const keyMatch = yaml.match(/VITE_SUPABASE_ANON_KEY=([^\s]+)/);
      if (urlMatch) {
        supabaseUrl = urlMatch[1];
        console.log('[FlightCheck] Found VITE_SUPABASE_URL in docker-compose.yaml');
      }
      if (keyMatch) {
        supabaseKey = keyMatch[1];
        console.log('[FlightCheck] Found VITE_SUPABASE_ANON_KEY in docker-compose.yaml');
      }
    }
  } catch (err) {
    console.log('[FlightCheck] Error reading docker-compose.yaml:', err.message);
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('[FlightCheck] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  console.error('  Set env vars or ensure docker-compose.yaml has them');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function copyDir(src, dst) {
  if (!fs.existsSync(dst)) {
    fs.mkdirSync(dst, { recursive: true });
  }
  const files = fs.readdirSync(src);
  for (const file of files) {
    const srcPath = path.join(src, file);
    const dstPath = path.join(dst, file);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDir(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

async function exportAddonData() {
  try {
    console.log('[FlightCheck] Fetching shared_planes...');
    const { data: planes, error: planesError } = await supabase
      .from('shared_planes')
      .select('*')
      .order('sort_order', { ascending: true, nullsFirst: false });

    if (planesError) throw planesError;

    console.log(`[FlightCheck] Fetched ${planes.length} planes`);

    console.log('[FlightCheck] Fetching shared_checklists...');
    const { data: checklists, error: checklistsError } = await supabase
      .from('shared_checklists')
      .select('*');

    if (checklistsError) throw checklistsError;

    console.log(`[FlightCheck] Fetched ${checklists.length} checklists`);

    // Write data files
    const dataDir = path.join(cwd, 'msfs-addon', 'flightcheck-panel', 'html_ui', 'InstrumentsReact', 'FlightCheck', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const planesFile = path.join(dataDir, 'planes.json');
    fs.writeFileSync(planesFile, JSON.stringify(planes, null, 2));
    console.log(`[FlightCheck] Wrote ${planesFile}`);

    const checklistsFile = path.join(dataDir, 'checklists.json');
    fs.writeFileSync(checklistsFile, JSON.stringify(checklists, null, 2));
    console.log(`[FlightCheck] Wrote ${checklistsFile}`);

    // Copy built assets to addon
    console.log('[FlightCheck] Copying bundled assets to addon...');
    const assetsDir = path.join(cwd, 'dist', 'assets');
    const addonAssetsDir = path.join(cwd, 'msfs-addon', 'flightcheck-panel', 'html_ui', 'InstrumentsReact', 'FlightCheck', 'assets');

    if (fs.existsSync(assetsDir)) {
      copyDir(assetsDir, addonAssetsDir);
      console.log(`[FlightCheck] Copied assets to ${addonAssetsDir}`);

      // Rename hashed bundle files to fixed names for offline use
      const files = fs.readdirSync(addonAssetsDir);
      const indexJsMatch = files.find(f => f.match(/^index-[\w]+\.js$/));
      const indexCssMatch = files.find(f => f.match(/^index-[\w]+\.css$/));
      const libJsMatch = files.find(f => f.match(/^lib-[\w]+\.js$/));

      if (indexJsMatch) {
        const oldPath = path.join(addonAssetsDir, indexJsMatch);
        const newPath = path.join(addonAssetsDir, 'index.js');
        fs.renameSync(oldPath, newPath);
        console.log(`[FlightCheck] Renamed ${indexJsMatch} to index.js`);
      }

      if (indexCssMatch) {
        const oldPath = path.join(addonAssetsDir, indexCssMatch);
        const newPath = path.join(addonAssetsDir, 'index.css');
        fs.renameSync(oldPath, newPath);
        console.log(`[FlightCheck] Renamed ${indexCssMatch} to index.css`);
      }

      if (libJsMatch) {
        const oldPath = path.join(addonAssetsDir, libJsMatch);
        const newPath = path.join(addonAssetsDir, 'lib.js');
        fs.renameSync(oldPath, newPath);
        console.log(`[FlightCheck] Renamed ${libJsMatch} to lib.js`);
      }
    } else {
      console.warn('[FlightCheck] dist/assets not found');
    }

    // Copy favicon and icons
    const distFiles = ['favicon.svg', 'icons.svg'];
    const fcDir = path.join(cwd, 'msfs-addon', 'flightcheck-panel', 'html_ui', 'InstrumentsReact', 'FlightCheck');
    for (const file of distFiles) {
      const srcPath = path.join(cwd, 'dist', file);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, path.join(fcDir, file));
        console.log(`[FlightCheck] Copied ${file}`);
      }
    }

    console.log('[FlightCheck] Addon export complete');
  } catch (err) {
    console.error('[FlightCheck] Addon export failed:', err);
    process.exit(1);
  }
}

exportAddonData();
