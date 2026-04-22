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

    // Copy built assets to addon (from dist-addon/, built with base: './')
    console.log('[FlightCheck] Copying bundled assets to addon...');
    const distAddon = path.join(cwd, 'dist-addon');
    const assetsDir = path.join(distAddon, 'assets');
    const fcDir = path.join(cwd, 'msfs-addon', 'flightcheck-panel', 'html_ui', 'InstrumentsReact', 'FlightCheck');
    const addonAssetsDir = path.join(fcDir, 'assets');

    if (!fs.existsSync(distAddon)) {
      console.error('[FlightCheck] dist-addon/ not found — run: vite build --config vite.addon.config.ts');
      process.exit(1);
    }

    if (fs.existsSync(assetsDir)) {
      copyDir(assetsDir, addonAssetsDir);
      console.log(`[FlightCheck] Copied assets to ${addonAssetsDir}`);
    } else {
      console.warn('[FlightCheck] dist-addon/assets not found');
    }

    // Copy static root files
    for (const file of ['favicon.svg', 'icons.svg']) {
      const srcPath = path.join(distAddon, file);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, path.join(fcDir, file));
        console.log(`[FlightCheck] Copied ${file}`);
      }
    }

    // Generate offline-data.js — sets window.__ADDON_OFFLINE_DATA__ before app boots
    const offlineDataPath = path.join(fcDir, 'offline-data.js');
    fs.writeFileSync(
      offlineDataPath,
      `window.__ADDON_OFFLINE_DATA__ = ${JSON.stringify({ planes, checklists })};\n`
    );
    console.log(`[FlightCheck] Wrote offline-data.js (${planes.length} planes, ${checklists.length} checklists)`);

    // Copy index.html and inject offline-data.js script before app scripts
    const srcIndexHtml = path.join(distAddon, 'index.html');
    if (!fs.existsSync(srcIndexHtml)) {
      console.error('[FlightCheck] dist-addon/index.html not found');
      process.exit(1);
    }
    let indexHtml = fs.readFileSync(srcIndexHtml, 'utf-8');
    // Strip crossorigin — coui:// has no CORS headers, silent load failure
    indexHtml = indexHtml.replace(/\s+crossorigin(?:="[^"]*")?/g, '');
    // Remove modulepreload links — unsupported in Coherent GT
    indexHtml = indexHtml.replace(/<link[^>]+rel="modulepreload"[^>]*>\n?/g, '');
    // Strip type="module" — IIFE output loads fine as plain <script src>
    indexHtml = indexHtml.replace(/\s+type="module"/g, '');
    // Inject offline-data.js before first <script — ensures data set before React bootstraps
    indexHtml = indexHtml.replace(
      /(<script\b)/,
      '<script src="./offline-data.js"></script>\n  $1'
    );
    fs.writeFileSync(path.join(fcDir, 'index.html'), indexHtml);
    console.log('[FlightCheck] Wrote patched index.html with offline-data.js injection');

    // Generate layout.json
    console.log('[FlightCheck] Generating layout.json...');
    const addonDir = path.join(cwd, 'msfs-addon', 'flightcheck-panel');
    const content = [];

    function walkDir(dir, relativePrefix = '') {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        const relativePath = path.join(relativePrefix, file).replace(/\\/g, '/');

        if (stat.isDirectory()) {
          walkDir(fullPath, relativePath);
        } else {
          content.push({
            path: relativePath,
            size: stat.size,
            date: stat.mtimeMs * 10000 + 116444736000000000 // Convert to Windows FILETIME
          });
        }
      }
    }

    walkDir(addonDir);
    const layoutPath = path.join(addonDir, 'layout.json');
    fs.writeFileSync(layoutPath, JSON.stringify({ content }, null, 2));
    console.log(`[FlightCheck] Generated ${layoutPath} with ${content.length} files`);

    console.log('[FlightCheck] Addon export complete');
  } catch (err) {
    console.error('[FlightCheck] Addon export failed:', err);
    process.exit(1);
  }
}

exportAddonData();
