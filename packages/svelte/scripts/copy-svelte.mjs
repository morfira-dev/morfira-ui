import { cp, mkdir } from 'node:fs/promises';
import { URL } from 'node:url';

const components = [
  ['accordion', 'Accordion'],
  ['button', 'Button'],
  ['checkbox', 'Checkbox'],
  ['dialog', 'Dialog'],
  ['field', 'Field'],
  ['input', 'Input'],
  ['popover', 'Popover'],
  ['radio', 'Radio'],
  ['select', 'Select'],
  ['switch', 'Switch'],
  ['tabs', 'Tabs'],
  ['textarea', 'Textarea'],
  ['tooltip', 'Tooltip'],
];

await Promise.all(
  components.flatMap(([directory, component]) => {
    const destination = new URL(`../dist/${directory}/`, import.meta.url);

    return [
      mkdir(destination, { recursive: true }),
      cp(
        new URL(`../src/${directory}/${component}.svelte`, import.meta.url),
        new URL(`${component}.svelte`, destination),
      ),
      cp(
        new URL(`../src/${directory}/${component}.svelte.d.ts`, import.meta.url),
        new URL(`${component}.svelte.d.ts`, destination),
      ),
      cp(
        new URL(`../src/${directory}/${component}.svelte.d.ts`, import.meta.url),
        new URL(`${component}.d.svelte.ts`, destination),
      ),
    ];
  }),
);
