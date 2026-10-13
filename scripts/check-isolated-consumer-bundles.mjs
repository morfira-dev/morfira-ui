import { execFileSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const budgets = JSON.parse(
  await readFile(resolve('tooling/isolated-consumer-size-budgets.json'), 'utf8'),
);
const components = [
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
  'menu',
  'dropdown',
  'combobox',
  'autocomplete',
  'toast',
  'drawer',
  'table',
];
const frameworkPackages = {
  react: '@morfira-dev/consumer-react',
  svelte: '@morfira-dev/consumer-svelte',
  vue: '@morfira-dev/consumer-vue',
};
const cssMarkers = {
  accordion: ['[data-morfira-accordion]'],
  autocomplete: ['[data-morfira-combobox]'],
  button: ['[data-morfira-button]'],
  checkbox: ['[data-morfira-checkbox]'],
  combobox: ['[data-morfira-combobox]'],
  dialog: ['[data-morfira-dialog]'],
  drawer: ['[data-morfira-drawer]'],
  dropdown: ['[data-morfira-dropdown]', '[data-morfira-menu]'],
  field: ['[data-morfira-field]'],
  input: ['[data-morfira-input]'],
  menu: ['[data-morfira-menu]'],
  popover: ['[data-morfira-popover]'],
  radio: ['[data-morfira-radio]'],
  select: ['[data-morfira-select]'],
  switch: ['[data-morfira-switch]'],
  table: ['[data-morfira-table]'],
  tabs: ['[data-morfira-tabs]'],
  textarea: ['[data-morfira-textarea]'],
  toast: ['[data-morfira-toast]'],
  tooltip: ['[data-morfira-tooltip]'],
};
const cssDependencies = {
  autocomplete: new Set(['combobox']),
  dropdown: new Set(['menu']),
};
const forbiddenCssMarkers = Object.fromEntries(
  components.map((component) => [
    component,
    Object.entries(cssMarkers)
      .filter(
        ([candidate]) =>
          candidate !== component &&
          !cssDependencies[component]?.has(candidate) &&
          !(
            candidate === 'field' && ['input', 'select', 'textarea'].includes(component)
          ),
      )
      .flatMap(([, markers]) => markers)
      .filter((marker) => !cssMarkers[component].includes(marker)),
  ]),
);
const componentPattern = components.join('|');
const adapterDependencies = {
  autocomplete: new Set(['combobox']),
  dropdown: new Set(['menu']),
};
const behaviorDependencies = {
  autocomplete: new Set(['combobox']),
  dropdown: new Set(['menu']),
  field: new Set(['input']),
};

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

function assertSourceBoundary(framework, component, source) {
  const normalizedSource = source.replaceAll('\\', '/');
  const workspacePackage =
    '(?:packages/(?:core|dom|react|svelte|vue)|node_modules/@morfira-dev/(?:core|dom|react|svelte|vue))';

  if (new RegExp(`/${workspacePackage}/dist/index\\.js$`, 'u').test(normalizedSource)) {
    throw new Error(
      `${framework}/${component} pulled a package root barrel: ${source}`,
    );
  }

  const adapterMatch = new RegExp(
    `/(?:packages/(react|svelte|vue)|node_modules/@morfira-dev/(react|svelte|vue))/dist/(${componentPattern})/([^/]+)$`,
    'u',
  ).exec(normalizedSource);
  if (adapterMatch !== null) {
    const [, workspaceFramework, installedFramework, sourceComponent, sourceFile] =
      adapterMatch;
    const sourceFramework = workspaceFramework ?? installedFramework;
    const fieldContext =
      ['input', 'select', 'textarea'].includes(component) &&
      sourceComponent === 'field' &&
      sourceFile === 'context.js';
    const componentDependency = adapterDependencies[component]?.has(sourceComponent);

    if (
      sourceFramework !== framework ||
      (sourceComponent !== component && !fieldContext && !componentDependency)
    ) {
      throw new Error(
        `${framework}/${component} pulled an unrelated adapter module: ${source}`,
      );
    }
  }

  const behaviorMatch = new RegExp(
    `/(?:packages/(core|dom)|node_modules/@morfira-dev/(core|dom))/dist/(${componentPattern})\\.js$`,
    'u',
  ).exec(normalizedSource);
  if (behaviorMatch !== null) {
    const [, workspaceLayer, installedLayer, sourceComponent] = behaviorMatch;
    const layer = workspaceLayer ?? installedLayer;
    const allowed =
      sourceComponent === component ||
      (layer === 'core' && behaviorDependencies[component]?.has(sourceComponent));

    if (!allowed) {
      throw new Error(
        `${framework}/${component} pulled unrelated ${layer} behavior: ${source}`,
      );
    }
  }
}

function isExpectedAdapterSource(framework, component, source) {
  const normalizedSource = source.replaceAll('\\', '/');
  return new RegExp(
    `/(?:packages/${framework}|node_modules/@morfira-dev/${framework})/dist/${component}/[^/]+$`,
    'u',
  ).test(normalizedSource);
}

for (const [framework, packageName] of Object.entries(frameworkPackages)) {
  for (const component of components) {
    execFileSync(
      'pnpm',
      [
        '--filter',
        packageName,
        'exec',
        'vite',
        'build',
        '--config',
        'vite.isolated.config.ts',
        '--logLevel',
        'warn',
      ],
      {
        env: { ...process.env, MORFIRA_ISOLATED_COMPONENT: component },
        stdio: 'inherit',
      },
    );

    const outputRoot = resolve(`apps/consumer-${framework}/dist/isolated/${component}`);
    const files = await collectFiles(outputRoot);
    const jsFiles = files.filter((file) => extname(file) === '.js');
    const cssFiles = files.filter((file) => extname(file) === '.css');
    const sourceMaps = files.filter((file) => file.endsWith('.js.map'));

    if (jsFiles.length === 0 || cssFiles.length === 0 || sourceMaps.length === 0) {
      throw new Error(
        `${framework}/${component} did not emit JS, CSS, and a JS source map.`,
      );
    }

    const totals = { cssGzipBytes: 0, jsGzipBytes: 0 };
    for (const file of jsFiles) {
      totals.jsGzipBytes += gzipSync(await readFile(file)).byteLength;
    }
    for (const file of cssFiles) {
      totals.cssGzipBytes += gzipSync(await readFile(file)).byteLength;
    }

    const budget = budgets[framework]?.[component];
    if (budget === undefined) {
      throw new Error(`Missing isolated size budget for ${framework}/${component}.`);
    }
    for (const key of Object.keys(totals)) {
      if (!Number.isFinite(budget[key]) || budget[key] < 0) {
        throw new Error(
          `Invalid or missing ${key} budget for ${framework}/${component}.`,
        );
      }
      if (totals[key] > budget[key]) {
        throw new Error(
          `${framework}/${component} ${key} is ${totals[key]} bytes; budget is ${budget[key]} bytes.`,
        );
      }
    }

    let expectedAdapterSourceSeen = false;
    for (const file of sourceMaps) {
      const sourceMap = JSON.parse(await readFile(file, 'utf8'));
      const sources = sourceMap.sources;
      if (!Array.isArray(sources) || sources.length === 0) {
        throw new Error(`${framework}/${component} emitted an empty source map.`);
      }
      for (const source of sources) {
        if (typeof source !== 'string') {
          throw new Error(`${framework}/${component} emitted an invalid source map.`);
        }
        assertSourceBoundary(framework, component, source);
        expectedAdapterSourceSeen ||= isExpectedAdapterSource(
          framework,
          component,
          source,
        );
      }
    }
    if (!expectedAdapterSourceSeen) {
      throw new Error(
        `${framework}/${component} source maps do not prove the expected adapter boundary.`,
      );
    }

    const css = (
      await Promise.all(cssFiles.map(async (file) => readFile(file, 'utf8')))
    ).join('\n');
    for (const marker of cssMarkers[component]) {
      if (!css.includes(marker)) {
        throw new Error(
          `${framework}/${component} did not include its required CSS: ${marker}`,
        );
      }
    }
    for (const marker of forbiddenCssMarkers[component]) {
      if (css.includes(marker)) {
        throw new Error(`${framework}/${component} included unrelated CSS: ${marker}`);
      }
    }

    console.log(`${framework}/${component}: ${JSON.stringify(totals)}`);
  }
}
