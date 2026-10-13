import { describe, expect, it } from 'vitest';

import {
  darkThemeTokens,
  lightThemeTokens,
  primitiveTokens,
  themeAttribute,
} from '../src/index.js';
import type { ColorToken, TokenTree, TokenValue } from '../src/index.js';

const isColorToken = (value: TokenValue): value is ColorToken =>
  typeof value === 'object' && 'fallback' in value && 'modern' in value;

const collectLeafEntries = (
  tree: TokenTree,
  prefix = '',
): ReadonlyArray<readonly [string, string | ColorToken]> =>
  Object.entries(tree).flatMap(([name, value]) => {
    const path = prefix === '' ? name : `${prefix}.${name}`;

    if (typeof value === 'string' || isColorToken(value)) {
      return [[path, value] as const];
    }

    return collectLeafEntries(value, path);
  });

describe('primitive tokens', () => {
  it('provides a fallback and a modern value for every color', () => {
    const colors = collectLeafEntries(primitiveTokens.color);

    expect(colors.length).toBeGreaterThan(0);

    for (const [path, value] of colors) {
      expect(path).toMatch(/^(neutral|accent|danger|success|warning)\./);
      expect(isColorToken(value)).toBe(true);

      if (!isColorToken(value)) {
        throw new TypeError(`Expected ${path} to be a color token.`);
      }

      expect(value.fallback).toMatch(/^#[\da-f]{6}$/i);
      expect(value.modern).toMatch(/^oklch\(.+\)$/);
    }
  });

  it('keeps the minimum touch target independent from visual control sizes', () => {
    expect(primitiveTokens.control.touchTarget).toBe('2.75rem');
    expect(primitiveTokens.control.touchTarget).not.toBe(
      primitiveTokens.control.sizeSm,
    );
  });
});

describe('semantic themes', () => {
  it('keeps light and dark themes structurally compatible', () => {
    const lightPaths = collectLeafEntries(lightThemeTokens).map(([path]) => path);
    const darkPaths = collectLeafEntries(darkThemeTokens).map(([path]) => path);

    expect(darkPaths).toEqual(lightPaths);
  });

  it.each([
    ['light', lightThemeTokens],
    ['dark', darkThemeTokens],
  ] as const)('%s theme references public CSS custom properties', (_name, theme) => {
    for (const [, value] of collectLeafEntries(theme)) {
      expect(value).toEqual(expect.stringMatching(/^var\(--morfira-[\w-]+\)$/));
    }
  });

  it.each([
    ['light', lightThemeTokens],
    ['dark', darkThemeTokens],
  ] as const)('%s theme does not create self-referencing variables', (_name, theme) => {
    for (const [path, value] of collectLeafEntries(theme)) {
      const variableName = `--morfira-${path.replaceAll('.', '-')}`;

      expect(value).not.toBe(`var(${variableName})`);
    }
  });

  it('uses a stable explicit-theme attribute', () => {
    expect(themeAttribute).toBe('data-morfira-theme');
  });

  it('keeps dark disabled content on the higher-contrast neutral step', () => {
    expect(darkThemeTokens.interactive.disabledContent).toBe(
      'var(--morfira-color-neutral-400)',
    );
  });
});
