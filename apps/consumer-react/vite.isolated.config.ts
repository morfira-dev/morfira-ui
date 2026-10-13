import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';

const component = process.env['MORFIRA_ISOLATED_COMPONENT'];
const supportedComponents = new Set([
  'accordion',
  'autocomplete',
  'button',
  'checkbox',
  'combobox',
  'dialog',
  'drawer',
  'dropdown',
  'field',
  'input',
  'menu',
  'popover',
  'radio',
  'select',
  'switch',
  'table',
  'tabs',
  'textarea',
  'tooltip',
  'toast',
]);

if (component === undefined || !supportedComponents.has(component)) {
  throw new TypeError('MORFIRA_ISOLATED_COMPONENT must name a supported component.');
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
});
