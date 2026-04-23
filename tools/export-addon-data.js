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

    // Clear stale assets from previous build (legacy plugin renames entries)
    if (fs.existsSync(addonAssetsDir)) {
      for (const f of fs.readdirSync(addonAssetsDir)) {
        fs.rmSync(path.join(addonAssetsDir, f), { recursive: true, force: true });
      }
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

    // Write FlightCheck.html — single-file entry point with all assets inlined.
    // Eliminates coui:// path resolution issues entirely. Shows visible status
    // before React mounts so grey-screen = JS error (we can see which script
    // loaded). Diagnostic messages remain until React replaces #root.
    // CSS may be inlined in JS bundle (Vite IIFE default) — skip if missing
    const cssPath = path.join(addonAssetsDir, 'index.css');
    const cssContent = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf-8') : '';
    const jsContent = fs.readFileSync(path.join(addonAssetsDir, 'index.js'), 'utf-8');
    const offlineDataContent = fs.readFileSync(offlineDataPath, 'utf-8');

    const flightCheckHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>FlightCheck</title>
  <style>
    /* CSS variables pre-defined so they're available before JS injects bundle styles */
    :root {
      --bg-primary: #0f172a;
      --bg-secondary: #1e293b;
      --bg-tertiary: #334155;
      --text-primary: #f1f5f9;
      --text-secondary: #94a3b8;
      --accent: #3b82f6;
      --accent-hover: #2563eb;
      --success: #22c55e;
      --border: #334155;
      --radius: 0.5rem;
      --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      --header-height: 64px;
      --transition-speed: 0.2s;
    }
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #0f172a !important; color: #f1f5f9; font-family: sans-serif; overflow: hidden; }
    body { display: flex; flex-direction: column; }
    /* position:fixed fills the Coherent viewport regardless of iframe intrinsic height */
    #root { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #0f172a; display: flex; flex-direction: column; overflow: hidden; }
    #fc-boot { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px; font-size: 14px; color: #94a3b8; pointer-events: none; z-index: 0; }
    #fc-boot-err { color: #ef4444; white-space: pre-wrap; text-align: left; max-width: 80%; font-family: monospace; font-size: 11px; }
  </style>
  <style>
${cssContent}
  </style>
</head>
<body>
  <div id="fc-boot">
    <div>FlightCheck loading...</div>
    <div id="fc-boot-err"></div>
    <pre id="fc-boot-feat" style="font-family:monospace;font-size:10px;color:#94a3b8;text-align:left;max-width:90%;"></pre>
  </div>
  <div id="root"></div>
  <script>
    window.addEventListener('error', function(e) {
      var el = document.getElementById('fc-boot-err');
      if (el) el.textContent = 'Error: ' + (e.message || 'unknown') + '\\n@ ' + (e.filename || '?') + ':' + (e.lineno || '?');
    });
    // Feature detection — shows in overlay so we know what Coherent supports
    var feats = [
      ['arrow', 'return (function(){var f=new Function("return () => 1"); return f()()})()'],
      ['template', 'return new Function("return \`x\`")()'],
      ['let', 'return new Function("let a=1; return a")()'],
      ['const', 'return new Function("const a=1; return a")()'],
      ['default', 'return new Function("var f=function(a){if(a===undefined)a=1;return a}; return f()")()'],
      ['spread', 'return new Function("return [].concat([1,2])")()'],
      ['destructure', 'return new Function("var o={a:1}; var a=o.a; return a")()'],
      ['class', 'return new Function("return class{}")()'],
      ['async', 'return new Function("return (async function(){})")()'],
      ['optchain', 'return new Function("var o={}; return o&&o.a")()'],
      ['nullcoal', 'var x=null; return x===null||x===undefined?1:x'],
      ['Promise', 'return typeof Promise'],
      ['fetch', 'return typeof fetch'],
      ['Symbol', 'return typeof Symbol'],
    ];
    try {
      var lines = [];
      for (var i=0; i<feats.length; i++) {
        try { var r = new Function(feats[i][1])(); lines.push('OK  ' + feats[i][0] + ' (' + r + ')'); }
        catch(e) { lines.push('ERR ' + feats[i][0] + ': ' + (e.message||e)); }
      }
      lines.push('UA: ' + navigator.userAgent);
      document.getElementById('fc-boot-feat').textContent = lines.join('\\n');
    } catch(e) {}
  </script>
  <script>
    if (typeof globalThis === 'undefined') {
      globalThis = typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : this;
    }
    if (!Array.prototype.flatMap) {
      Array.prototype.flatMap = function(callback, thisArg) {
        var result = [];
        for (var i = 0; i < this.length; i++) {
          var item = callback.call(thisArg, this[i], i, this);
          if (Array.isArray(item)) {
            for (var j = 0; j < item.length; j++) {
              result.push(item[j]);
            }
          } else {
            result.push(item);
          }
        }
        return result;
      };
    }
    if (!Array.prototype.includes) {
      Array.prototype.includes = function(searchElement) {
        for (var i = 0; i < this.length; i++) {
          if (this[i] === searchElement) return true;
        }
        return false;
      };
    }
    if (!Object.assign) {
      Object.assign = function(target) {
        for (var i = 1; i < arguments.length; i++) {
          var src = arguments[i];
          for (var key in src) {
            if (src.hasOwnProperty(key)) {
              target[key] = src[key];
            }
          }
        }
        return target;
      };
    }
    if (!Object.entries) {
      Object.entries = function(obj) {
        var result = [];
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            result.push([key, obj[key]]);
          }
        }
        return result;
      };
    }
  </script>
  <script>
${offlineDataContent}
  </script>
  <script>
${jsContent}
  </script>
  <script>
    setTimeout(function() {
      var boot = document.getElementById('fc-boot');
      if (boot) boot.style.display = 'none';
    }, 500);
  </script>
</body>
</html>
`;
    fs.writeFileSync(path.join(fcDir, 'FlightCheck.html'), flightCheckHtml);
    console.log('[FlightCheck] Wrote FlightCheck.html (single-file, all inline)');

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
