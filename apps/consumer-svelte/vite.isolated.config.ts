import { fileURLToPath, URL } from 'node:url';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

const component = process.env['MORFIRA_ISOLATED_COMPONENT'];
const supportedComponents = new Set(['button', 'dialog', 'field', 'input']);

if (component === undefined || !supportedComponents.has(component)) {
  throw new TypeError('MORFIRA_ISOLATED_COMPONENT must name a Phase 1 component.');
}

export default defineConfig({
  build: {
    cssCodeSplit: false,
    emptyOutDir: true,
    lib: {
      entry: fileURLToPath(new URL(`./src/isolated/${component}.ts`, import.meta.url)),
      cssFileName: 'style',
      fileName: 'index',
      formats: ['es'],
    },
    outDir: `dist/isolated/${component}`,
    sourcemap: true,
  },
  plugins: [svelte()],
});
