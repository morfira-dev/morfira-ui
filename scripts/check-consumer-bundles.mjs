import { readdir, readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const budgets = JSON.parse(
  await readFile(resolve('tooling/consumer-size-budgets.json'), 'utf8'),
);
const fixtureComponents = new Set([
  'button',
  'dialog',
  'field',
  'input',
  'checkbox',
  'radio',
  'switch',
  'textarea',
  'select',
  'tooltip',
  'popover',
  'tabs',
  'accordion',
  'internal',
]);
const componentSourcePath =
  /\/packages\/(?:core|dom|react|svelte|vue)\/dist\/([^/]+)\//u;

async function collectFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(root, entry.name);
      return entry.isDirectory() ? collectFiles(path) : [path];
    }),
  );
  return files.flat();
}

for (const [framework, budget] of Object.entries(budgets)) {
  const clientRoot = resolve(`apps/consumer-${framework}/dist/client`);
  const files = await collectFiles(clientRoot);
  const assets = files.filter((file) => ['.css', '.js'].includes(extname(file)));
  const sourceMaps = files.filter((file) => file.endsWith('.js.map'));

  if (!assets.some((file) => extname(file) === '.js')) {
    throw new Error(`${framework} consumer did not produce a JavaScript asset.`);
  }
  if (!assets.some((file) => extname(file) === '.css')) {
    throw new Error(`${framework} consumer did not produce a CSS asset.`);
  }
  if (sourceMaps.length === 0) {
    throw new Error(
      `${framework} consumer must emit source maps for import-boundary checks.`,
    );
  }

  const totals = { cssGzipBytes: 0, jsGzipBytes: 0 };
  for (const file of assets) {
    const compressedBytes = gzipSync(await readFile(file)).byteLength;
    if (extname(file) === '.css') {
      totals.cssGzipBytes += compressedBytes;
    } else {
      totals.jsGzipBytes += compressedBytes;
    }
  }

  for (const key of Object.keys(totals)) {
    if (!Number.isFinite(budget[key]) || budget[key] < 0) {
      throw new Error(`Invalid or missing ${key} budget for ${framework}.`);
    }
    if (totals[key] > budget[key]) {
      throw new Error(
        `${framework} ${key} is ${totals[key]} bytes; budget is ${budget[key]} bytes.`,
      );
    }
  }

  for (const file of sourceMaps) {
    const sourceMap = JSON.parse(await readFile(file, 'utf8'));
    const leakedSource = sourceMap.sources?.find((source) => {
      const component = componentSourcePath.exec(source)?.[1];

      return component !== undefined && !fixtureComponents.has(component);
    });
    if (leakedSource !== undefined) {
      throw new Error(
        `${framework} consumer bundle pulled a component outside its fixture: ${leakedSource}`,
      );
    }
  }

  console.log(`${framework}: ${JSON.stringify(totals)}`);
}
