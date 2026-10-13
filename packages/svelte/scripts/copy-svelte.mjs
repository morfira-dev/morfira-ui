import { cp, mkdir } from 'node:fs/promises';
import { URL } from 'node:url';

await mkdir(new URL('../dist/button/', import.meta.url), { recursive: true });
await Promise.all([
  cp(
    new URL('../src/button/Button.svelte', import.meta.url),
    new URL('../dist/button/Button.svelte', import.meta.url),
  ),
  cp(
    new URL('../src/button/Button.svelte.d.ts', import.meta.url),
    new URL('../dist/button/Button.svelte.d.ts', import.meta.url),
  ),
  cp(
    new URL('../src/button/Button.svelte.d.ts', import.meta.url),
    new URL('../dist/button/Button.d.svelte.ts', import.meta.url),
  ),
]);
