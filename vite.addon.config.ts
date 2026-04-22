import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Addon-specific build: IIFE format for Coherent GT (MSFS browser) compatibility.
// - No ES modules, no crossorigin, no modulepreload — all known to fail under coui://
// - inlineDynamicImports bundles all chunks into one file
// - pdfjs worker uses ?url static import (not affected by inlineDynamicImports)
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
