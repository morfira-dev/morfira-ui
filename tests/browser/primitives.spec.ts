import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

interface BoxSize {
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

async function requireBox(locator: Locator): Promise<BoxSize> {
  const box = await locator.boundingBox();

  expect(box).not.toBeNull();

  if (box === null) {
    throw new Error('Expected the element to have visible geometry.');
  }

  return box;
}

async function backgroundColor(locator: Locator): Promise<string> {
  return locator.evaluate((element) => getComputedStyle(element).backgroundColor);
}

async function removeExplicitTheme(page: Page): Promise<void> {
  await page.locator('html').evaluate((element) => {
    element.removeAttribute('data-morfira-theme');
  });
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.setViewportSize({ height: 1000, width: 1280 });
  await page.goto('./');
});

test('switches the inherited theme without overriding an explicit dark subtree', async ({
  page,
}) => {
  const root = page.locator('html');
  const inheritedPanel = page.locator('section[aria-labelledby="light-heading"]');
  const explicitDarkPanel = page.locator('section[aria-labelledby="dark-heading"]');
  const themeToggle = page.getByRole('button', { name: 'Toggle page theme' });

  const lightBackground = await backgroundColor(inheritedPanel);
  const explicitDarkBackground = await backgroundColor(explicitDarkPanel);

  expect(lightBackground).not.toBe(explicitDarkBackground);
  await expect(root).not.toHaveAttribute('data-morfira-theme');

  await themeToggle.click();

  await expect(root).toHaveAttribute('data-morfira-theme', 'dark');
  await expect.poll(() => backgroundColor(inheritedPanel)).toBe(explicitDarkBackground);
  await expect
    .poll(() => backgroundColor(explicitDarkPanel))
    .toBe(explicitDarkBackground);

  await themeToggle.click();

  await expect(root).toHaveAttribute('data-morfira-theme', 'light');
  await expect.poll(() => backgroundColor(inheritedPanel)).toBe(lightBackground);
  await expect
    .poll(() => backgroundColor(explicitDarkPanel))
    .toBe(explicitDarkBackground);
});

test('applies the explicit subtree content color instead of inheriting the page theme', async ({
  page,
}) => {
  const inheritedHeading = page.getByRole('heading', { name: 'Inherited theme' });
  const explicitDarkHeading = page.getByRole('heading', {
    name: 'Explicit dark subtree',
  });
  const explicitDarkPanel = page.locator('section[aria-labelledby="dark-heading"]');

  const [inheritedColor, darkHeadingColor, darkPanelColor] = await Promise.all([
    inheritedHeading.evaluate((element) => getComputedStyle(element).color),
    explicitDarkHeading.evaluate((element) => getComputedStyle(element).color),
    explicitDarkPanel.evaluate((element) => getComputedStyle(element).color),
  ]);

  expect(darkHeadingColor).toBe(darkPanelColor);
  expect(darkHeadingColor).not.toBe(inheritedColor);
});

test('switches away from an implicit dark preference on the first activation', async ({
  page,
}) => {
  const root = page.locator('html');
  const inheritedPanel = page.locator('section[aria-labelledby="light-heading"]');
  const explicitDarkPanel = page.locator('section[aria-labelledby="dark-heading"]');
  const themeToggle = page.getByRole('button', { name: 'Toggle page theme' });

  await removeExplicitTheme(page);
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });

  const implicitDarkBackground = await backgroundColor(inheritedPanel);
  expect(implicitDarkBackground).toBe(await backgroundColor(explicitDarkPanel));
  await expect(root).not.toHaveAttribute('data-morfira-theme');

  await themeToggle.click();

  await expect(root).toHaveAttribute('data-morfira-theme', 'light');
  await expect
    .poll(() => backgroundColor(inheritedPanel))
    .not.toBe(implicitDarkBackground);
});

test('follows the preferred color scheme only when no explicit theme is set', async ({
  page,
}) => {
  const inheritedPanel = page.locator('section[aria-labelledby="light-heading"]');
  const explicitDarkPanel = page.locator('section[aria-labelledby="dark-heading"]');
  const explicitDarkBackground = await backgroundColor(explicitDarkPanel);
  const lightBackground = await backgroundColor(inheritedPanel);

  await removeExplicitTheme(page);
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });

  await expect.poll(() => backgroundColor(inheritedPanel)).toBe(explicitDarkBackground);

  await page.locator('html').evaluate((element) => {
    element.setAttribute('data-morfira-theme', 'light');
  });

  await expect.poll(() => backgroundColor(inheritedPanel)).toBe(lightBackground);
  await expect
    .poll(() => backgroundColor(explicitDarkPanel))
    .toBe(explicitDarkBackground);
});

test('renders distinct Button size geometry and exposes disabled and loading states', async ({
  page,
}) => {
  const inheritedPanel = page.locator('section[aria-labelledby="light-heading"]');
  const sizes = [
    { height: 32, name: 'Small' },
    { height: 40, name: 'Medium' },
    { height: 48, name: 'Large' },
  ] as const;

  const measuredHeights: number[] = [];

  for (const { height, name } of sizes) {
    const button = inheritedPanel.getByRole('button', { exact: true, name });
    const box = await requireBox(button);

    expect(Math.abs(box.height - height)).toBeLessThanOrEqual(0.5);
    expect(box.width).toBeGreaterThan(0);
    measuredHeights.push(box.height);
  }

  expect(measuredHeights[0]).toBeLessThan(measuredHeights[1] ?? 0);
  expect(measuredHeights[1]).toBeLessThan(measuredHeights[2] ?? 0);

  await expect(inheritedPanel.getByRole('button', { name: 'Disabled' })).toBeDisabled();

  const loading = inheritedPanel.getByRole('button', { name: 'Saving' });
  await expect(loading).toHaveAttribute('data-loading', '');
  await expect(loading).toHaveAttribute('aria-busy', 'true');
  await expect(loading).toBeDisabled();

  const loadingIndicator = await loading.evaluate((element) => {
    const style = getComputedStyle(element, '::before');

    return {
      animationName: style.animationName,
      blockSize: style.blockSize,
      content: style.content,
      inlineSize: style.inlineSize,
    };
  });

  expect(loadingIndicator.content).not.toBe('none');
  expect(Number.parseFloat(loadingIndicator.inlineSize)).toBeGreaterThan(0);
  expect(Number.parseFloat(loadingIndicator.blockSize)).toBeGreaterThan(0);
  expect(loadingIndicator.animationName).toBe('none');
});

test('connects Field labels and messages while preserving native Input states', async ({
  page,
}) => {
  const email = page.getByRole('textbox', { exact: true, name: 'Email' });
  const slug = page.getByRole('textbox', { exact: true, name: 'Workspace slug' });
  const token = page.getByRole('textbox', { exact: true, name: 'Access token' });
  const region = page.getByRole('textbox', { exact: true, name: 'Region' });

  await expect(email).toHaveAccessibleName('Email');
  await expect(email).toHaveAccessibleDescription('Used for account notifications.');
  await expect(email).toHaveAttribute('required', '');

  await expect(slug).toHaveAccessibleName('Workspace slug');
  await expect(slug).toHaveAccessibleDescription('Choose a unique workspace slug.');
  await expect(slug).toHaveAttribute('aria-invalid', 'true');
  await expect(slug).toHaveAttribute('aria-errormessage', 'slug-error');

  const errorCue = await page
    .locator('#slug-error')
    .evaluate((element) => getComputedStyle(element, '::before').content);
  expect(errorCue).toContain('×');

  await expect(token).toBeEnabled();
  await expect(token).not.toBeEditable();
  await token.focus();
  await expect(token).toBeFocused();

  await expect(region).toBeDisabled();
  await region.evaluate((element) => {
    element.focus();
  });
  await expect(region).not.toBeFocused();
});

test('renders Input sizes as control geometry and exposes focus on the composed shell', async ({
  page,
}) => {
  const cases = [
    { height: 32, inputName: 'Access token' },
    { height: 40, inputName: 'Email' },
    { height: 48, inputName: 'Region' },
  ] as const;

  for (const { height, inputName } of cases) {
    const input = page.getByRole('textbox', { exact: true, name: inputName });
    const shell = input.locator('xpath=..');
    const [inputBox, shellBox] = await Promise.all([
      requireBox(input),
      requireBox(shell),
    ]);

    expect(Math.abs(shellBox.height - height)).toBeLessThanOrEqual(0.5);
    expect(inputBox.height).toBeLessThanOrEqual(shellBox.height);
    expect(inputBox.height).toBeGreaterThanOrEqual(shellBox.height - 2.5);
  }

  const email = page.getByRole('textbox', { exact: true, name: 'Email' });
  const emailShell = email.locator('xpath=..');

  await email.focus();
  await expect(email).toBeFocused();

  const [shellFocusStyle, inputFocusStyle] = await Promise.all([
    emailShell.evaluate((element) => {
      const style = getComputedStyle(element);

      return {
        outlineOffset: Number.parseFloat(style.outlineOffset),
        outlineStyle: style.outlineStyle,
        outlineWidth: Number.parseFloat(style.outlineWidth),
      };
    }),
    email.evaluate((element) => {
      const style = getComputedStyle(element);

      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: Number.parseFloat(style.outlineWidth),
      };
    }),
  ]);

  expect(shellFocusStyle.outlineStyle).not.toBe('none');
  expect(shellFocusStyle.outlineWidth).toBeGreaterThanOrEqual(2);
  expect(shellFocusStyle.outlineOffset).toBe(0);
  expect(inputFocusStyle.outlineStyle).toBe('none');
  expect(inputFocusStyle.outlineWidth).toBe(0);
});

test('moves prefix content to logical inline-start when direction changes', async ({
  page,
}) => {
  const email = page.getByRole('textbox', { exact: true, name: 'Email' });
  const shell = email.locator('xpath=..');
  const prefix = shell.locator('[data-morfira-field-prefix]');
  const root = page.locator('html');

  const [ltrInputBox, ltrPrefixBox] = await Promise.all([
    requireBox(email),
    requireBox(prefix),
  ]);

  expect(ltrPrefixBox.x + ltrPrefixBox.width).toBeLessThanOrEqual(ltrInputBox.x);

  await page.getByRole('button', { name: 'Toggle RTL' }).click();
  await expect(root).toHaveAttribute('dir', 'rtl');

  const [rtlInputBox, rtlPrefixBox, direction] = await Promise.all([
    requireBox(email),
    requireBox(prefix),
    shell.evaluate((element) => getComputedStyle(element).direction),
  ]);

  expect(direction).toBe('rtl');
  expect(rtlPrefixBox.x).toBeGreaterThanOrEqual(rtlInputBox.x + rtlInputBox.width);
});
