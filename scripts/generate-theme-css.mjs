import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  darkThemeTokens,
  lightThemeTokens,
  primitiveTokens,
  themeAttribute,
} from '../packages/tokens/dist/index.js';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = resolve(repositoryRoot, 'packages/css/dist');
const themesDirectory = resolve(outputDirectory, 'themes');
const generatedNotice = '/* Generated from @morfira-dev/tokens. Do not edit. */';
const buttonSource = resolve(repositoryRoot, 'packages/css/src/button.css');

const isRecord = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isColorToken = (value) =>
  isRecord(value) &&
  typeof value.fallback === 'string' &&
  typeof value.modern === 'string';

const toKebabCase = (value) =>
  value
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z\d]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

const toCustomProperty = (path) =>
  `--morfira-${path.map((segment) => toKebabCase(segment)).join('-')}`;

const flattenTokens = (tokens, path = []) => {
  if (!isRecord(tokens)) {
    throw new TypeError(`Expected a token object at ${path.join('.') || '<root>'}.`);
  }

  return Object.entries(tokens).flatMap(([key, value]) => {
    const tokenPath = [...path, key];

    if (isColorToken(value)) {
      return [
        {
          name: toCustomProperty(tokenPath),
          fallback: value.fallback,
          modern: value.modern,
          path: tokenPath,
        },
      ];
    }

    if (isRecord(value)) {
      return flattenTokens(value, tokenPath);
    }

    if (typeof value !== 'string' && typeof value !== 'number') {
      throw new TypeError(`Unsupported token value at ${tokenPath.join('.')}.`);
    }

    return [
      {
        name: toCustomProperty(tokenPath),
        fallback: String(value),
        path: tokenPath,
      },
    ];
  });
};

const indentDeclarations = (tokens, valueKey = 'fallback', spaces = 4) => {
  const indentation = ' '.repeat(spaces);

  return tokens
    .map((token) => `${indentation}${token.name}: ${token[valueKey]};`)
    .join('\n');
};

const primitiveEntries = flattenTokens(primitiveTokens);
const lightEntries = flattenTokens(lightThemeTokens);
const darkEntries = flattenTokens(darkThemeTokens);
const modernColorEntries = primitiveEntries.filter(
  (token) => typeof token.modern === 'string',
);

const pathSet = (tokens) => new Set(tokens.map((token) => token.path.join('.')));

const lightPaths = pathSet(lightEntries);
const darkPaths = pathSet(darkEntries);
const missingFromDark = [...lightPaths].filter((path) => !darkPaths.has(path));
const missingFromLight = [...darkPaths].filter((path) => !lightPaths.has(path));

if (missingFromDark.length > 0 || missingFromLight.length > 0) {
  throw new Error(
    [
      'Light and dark themes must expose the same semantic token paths.',
      missingFromDark.length > 0
        ? `Missing from dark: ${missingFromDark.join(', ')}.`
        : '',
      missingFromLight.length > 0
        ? `Missing from light: ${missingFromLight.join(', ')}.`
        : '',
    ]
      .filter(Boolean)
      .join(' '),
  );
}

if (!/^[a-z][a-z\d-]*$/.test(themeAttribute)) {
  throw new Error(`Invalid theme attribute: ${themeAttribute}.`);
}

const lightSelector = `:root:not([${themeAttribute}]),\n  [${themeAttribute}='light']`;
const darkSelector = `[${themeAttribute}='dark']`;
const automaticDarkSelector = `:root:not([${themeAttribute}])`;

const primitiveCss = `${generatedNotice}
@layer morfira.tokens {
  :root {
${indentDeclarations(primitiveEntries)}
  }

  @supports (color: oklch(50% 0 0)) {
    :root {
${indentDeclarations(modernColorEntries, 'modern', 6)}
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :root {
${indentDeclarations(
  primitiveEntries
    .filter((token) => token.path.join('.').startsWith('motion.duration.'))
    .map((token) => ({ ...token, fallback: '0ms' })),
  'fallback',
  6,
)}
    }
  }
}
`;

const lightCss = `${generatedNotice}
@layer morfira.tokens {
  ${lightSelector} {
    color-scheme: light;
${indentDeclarations(lightEntries)}
  }
}
`;

const darkCss = `${generatedNotice}
@layer morfira.tokens {
  ${darkSelector} {
    color-scheme: dark;
${indentDeclarations(darkEntries)}
  }

  @media (prefers-color-scheme: dark) {
    ${automaticDarkSelector} {
      color-scheme: dark;
${indentDeclarations(darkEntries, 'fallback', 6)}
    }
  }
}
`;

const forcedColorValue = (token) => {
  const [group, role = ''] = token.path.map((segment) => toKebabCase(segment));

  if (group === 'shadow') return 'none';
  if (group === 'border') return 'CanvasText';
  if (group === 'surface') return role === 'inverse' ? 'Highlight' : 'Canvas';
  if (group === 'focus') return role === 'offset' ? 'Canvas' : 'Highlight';
  if (group === 'content') {
    if (role === 'inverse') return 'HighlightText';
    if (role === 'accent') return 'LinkText';
    return 'CanvasText';
  }

  if (group === 'interactive') {
    if (role === 'primary-content') return 'HighlightText';
    if (role === 'disabled-content') return 'GrayText';
    if (role === 'disabled') return 'Canvas';
    return 'Highlight';
  }

  return 'CanvasText';
};

const forcedColorEntries = lightEntries.map((token) => ({
  ...token,
  fallback: forcedColorValue(token),
}));

const forcedColorsCss = `${generatedNotice}
@layer morfira.tokens {
  @media (forced-colors: active) {
    :root,
    [${themeAttribute}='light'],
    [${themeAttribute}='dark'] {
      forced-color-adjust: auto;
${indentDeclarations(forcedColorEntries, 'fallback', 6)}
    }
  }
}
`;

const aggregateCss = `${generatedNotice}
@layer morfira.reset, morfira.tokens, morfira.components, morfira.utilities, morfira.overrides;

@import './primitives.css';
@import './themes/light.css';
@import './themes/dark.css';
@import './themes/forced-colors.css';
`;

await mkdir(themesDirectory, { recursive: true });
const buttonCss = await readFile(buttonSource, 'utf8');
await Promise.all([
  writeFile(resolve(outputDirectory, 'button.css'), buttonCss),
  writeFile(resolve(outputDirectory, 'primitives.css'), primitiveCss),
  writeFile(resolve(outputDirectory, 'theme.css'), aggregateCss),
  writeFile(resolve(themesDirectory, 'light.css'), lightCss),
  writeFile(resolve(themesDirectory, 'dark.css'), darkCss),
  writeFile(resolve(themesDirectory, 'forced-colors.css'), forcedColorsCss),
]);
