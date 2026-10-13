import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL, URL } from 'node:url';
import { resolve } from 'node:path';

const framework = process.argv[2];
const supportedFrameworks = new Set(['react', 'svelte', 'vue']);

if (!supportedFrameworks.has(framework)) {
  throw new TypeError(
    `Expected one of ${[...supportedFrameworks].join(', ')}, received ${String(framework)}.`,
  );
}

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const appRoot = resolve(repositoryRoot, `apps/consumer-${framework}`);
const serverEntry = resolve(appRoot, 'dist/server/entry-server.js');
const clientIndex = resolve(appRoot, 'dist/client/index.html');
const marker = '<!--app-html-->';
const serverModule = await import(pathToFileURL(serverEntry).href);

if (typeof serverModule.render !== 'function') {
  throw new TypeError(`${serverEntry} must export render().`);
}

const [template, rendered] = await Promise.all([
  readFile(clientIndex, 'utf8'),
  serverModule.render(),
]);

if (!template.includes(marker)) {
  throw new Error(`${clientIndex} does not contain ${marker}.`);
}

await writeFile(clientIndex, template.replace(marker, String(rendered)), 'utf8');
