import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Addon build: IIFE for direct <script src> loading under coui://.
// - inlineDynamicImports → single self-contained bundle
// - base:'./' + no modulepreload → coui:// path friendly
// - HashRouter selected via __ADDON_BUILD__ define
// Note: rolldown's minimum target is ES2015 — runtime helpers always emit
// arrow fns / template literals. If MSFS Coherent rejects ES2015 we'd need
// a Babel post-process step (plugin-legacy in Vite 8+rolldown is broken).
export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    __ADDON_BUILD__: 'true',
  },
  build: {
    outDir: 'dist-addon',
    modulePreload: false,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'assets/index.js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] ?? assetInfo.name ?? ''
          if (name.endsWith('.css')) return 'assets/index.css'
          return 'assets/[name][extname]'
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
  },
})
