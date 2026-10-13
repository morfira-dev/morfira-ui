import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

interface Box {
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

async function requireBox(locator: Locator): Promise<Box> {
  const box = await locator.boundingBox();

  expect(box).not.toBeNull();
  if (box === null) {
    throw new Error('Expected visible geometry.');
  }

  return box;
}

async function openDialog(page: Page): Promise<Locator> {
  const dialog = page.locator('dialog[data-morfira-dialog]');

  await page.getByRole('button', { name: 'Open medium' }).click();
  await expect(dialog).toHaveAttribute('open', '');

  return dialog;
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 1280 });
});

test('forced colors preserve system-safe borders and visible focus', async ({
  browserName,
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.goto('./');

  expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(
    true,
  );

  const email = page.getByRole('textbox', { exact: true, name: 'Email' });
  const inputShell = email.locator('xpath=..');
  const primaryButton = page
    .locator('section[aria-labelledby="light-heading"]')
    .getByRole('button', { exact: true, name: 'Primary' });
  const switchControl = page.getByRole('switch', { name: 'Quiet mode' });

  await email.focus();

  const [buttonStyle, inputStyle, switchStyle] = await Promise.all([
    primaryButton.evaluate((element) => {
      const style = getComputedStyle(element);

      return {
        borderColor: style.borderTopColor,
        borderStyle: style.borderTopStyle,
        borderWidth: Number.parseFloat(style.borderTopWidth),
        forcedColorAdjust: style.forcedColorAdjust,
      };
    }),
    inputShell.evaluate((element) => {
      const style = getComputedStyle(element);

      return {
        borderColor: style.borderTopColor,
        borderStyle: style.borderTopStyle,
        borderWidth: Number.parseFloat(style.borderTopWidth),
        forcedColorAdjust: style.forcedColorAdjust,
        outlineStyle: style.outlineStyle,
        outlineWidth: Number.parseFloat(style.outlineWidth),
      };
    }),
    switchControl.evaluate((element) => {
      const style = getComputedStyle(element);

      return {
        appearance: style.appearance,
        blockSize: Number.parseFloat(style.blockSize),
        forcedColorAdjust: style.forcedColorAdjust,
        inlineSize: Number.parseFloat(style.inlineSize),
      };
    }),
  ]);

  expect([undefined, 'auto']).toContain(buttonStyle.forcedColorAdjust);
  expect(buttonStyle.borderStyle).toBe('solid');
  expect(buttonStyle.borderWidth).toBeGreaterThanOrEqual(1);
  expect(buttonStyle.borderColor).not.toBe('rgba(0, 0, 0, 0)');
  expect([undefined, 'auto']).toContain(inputStyle.forcedColorAdjust);
  expect(inputStyle.borderStyle).toBe('solid');
  expect(inputStyle.borderWidth).toBeGreaterThanOrEqual(1);
  expect(inputStyle.borderColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(inputStyle.outlineStyle).not.toBe('none');
  expect(inputStyle.outlineWidth).toBeGreaterThanOrEqual(2);
  expect(switchStyle.appearance).not.toBe('none');
  expect([undefined, 'auto']).toContain(switchStyle.forcedColorAdjust);
  expect(switchStyle.inlineSize).toBeGreaterThan(0);
  expect(switchStyle.blockSize).toBeGreaterThan(0);

  await switchControl.focus();
  await expect(switchControl).toBeFocused();
  await expect(switchControl).not.toBeChecked();
  await switchControl.press('Space');
  await expect(switchControl).toBeChecked();

  const dialog = await openDialog(page);
  const close = dialog.getByRole('button', { name: 'Close dialog' });
  if (browserName === 'webkit') {
    await close.focus();
  } else {
    for (
      let index = 0;
      index < 4 && !(await close.evaluate((element) => element.matches(':focus')));
      index += 1
    ) {
      await page.keyboard.press('Shift+Tab');
    }
  }
  await expect(close).toBeFocused();

  const [dialogStyle, closeStyle, backdropStyle] = await Promise.all([
    dialog.evaluate((element) => {
      const style = getComputedStyle(element);

      return {
        borderColor: style.borderTopColor,
        borderStyle: style.borderTopStyle,
        borderWidth: Number.parseFloat(style.borderTopWidth),
        boxShadow: style.boxShadow,
        forcedColorAdjust: style.forcedColorAdjust,
      };
    }),
    close.evaluate((element) => {
      const style = getComputedStyle(element);

      return {
        borderColor: style.borderTopColor,
        borderStyle: style.borderTopStyle,
        borderWidth: Number.parseFloat(style.borderTopWidth),
        outlineStyle: style.outlineStyle,
        outlineWidth: Number.parseFloat(style.outlineWidth),
      };
    }),
    dialog.evaluate((element) => {
      const style = getComputedStyle(element, '::backdrop');

      return {
        backgroundColor: style.backgroundColor,
        opacity: Number.parseFloat(style.opacity),
      };
    }),
  ]);

  expect([undefined, 'auto']).toContain(dialogStyle.forcedColorAdjust);
  expect(dialogStyle.borderStyle).toBe('solid');
  expect(dialogStyle.borderWidth).toBeGreaterThanOrEqual(1);
  expect(dialogStyle.borderColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(dialogStyle.boxShadow).toBe('none');
  expect(closeStyle.borderStyle).toBe('solid');
  expect(closeStyle.borderWidth).toBeGreaterThanOrEqual(1);
  expect(closeStyle.borderColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(closeStyle.outlineStyle).not.toBe('none');
  expect(closeStyle.outlineWidth).toBeGreaterThanOrEqual(2);
  expect(backdropStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(backdropStyle.opacity).toBeGreaterThan(0);
});

test('reduced motion disables Dialog and control animations and transitions', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');

  const input = page.getByRole('textbox', { exact: true, name: 'Email' });
  const loading = page
    .locator('section[aria-labelledby="light-heading"]')
    .getByRole('button', { name: 'Saving' });
  const switchControl = page.getByRole('switch', { name: 'Quiet mode' });

  await switchControl.focus();
  await expect(switchControl).toBeFocused();
  expect(
    await switchControl.evaluate((element) => element.matches(':focus-visible')),
  ).toBe(true);

  const switchFocus = await switchControl.evaluate((element) => {
    const style = getComputedStyle(element);

    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
    };
  });

  const dialog = await openDialog(page);

  const [
    dialogAnimation,
    backdropAnimation,
    inputTransition,
    spinnerAnimation,
    switchTransition,
  ] = await Promise.all([
    dialog.evaluate((element) => getComputedStyle(element).animationName),
    dialog.evaluate((element) => getComputedStyle(element, '::backdrop').animationName),
    input.evaluate((element) => getComputedStyle(element).transitionDuration),
    loading.evaluate((element) => getComputedStyle(element, '::before').animationName),
    switchControl.evaluate((element) => {
      const style = getComputedStyle(element);

      return {
        delay: style.transitionDelay,
        duration: style.transitionDuration,
      };
    }),
  ]);

  expect(dialogAnimation).toBe('none');
  expect(backdropAnimation).toBe('none');
  expect(inputTransition).toBe('0s');
  expect(spinnerAnimation).toBe('none');
  expect(switchTransition).toEqual({ delay: '0s', duration: '0s' });
  expect(switchFocus.outlineStyle).not.toBe('none');
  expect(switchFocus.outlineWidth).toBeGreaterThanOrEqual(2);
});

test('RTL moves close and affixes to logical inline positions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');

  await page.getByRole('button', { name: 'Toggle RTL' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

  const email = page.getByRole('textbox', { exact: true, name: 'Email' });
  const inputShell = email.locator('xpath=..');
  const prefix = inputShell.locator('[data-morfira-field-prefix]');
  const dialog = await openDialog(page);
  const header = dialog.locator('[data-morfira-dialog-header]');
  const title = dialog.locator('[data-morfira-dialog-title]');
  const close = dialog.getByRole('button', { name: 'Close dialog' });

  const [inputBox, prefixBox, headerBox, titleBox, closeBox, directions] =
    await Promise.all([
      requireBox(email),
      requireBox(prefix),
      requireBox(header),
      requireBox(title),
      requireBox(close),
      Promise.all([
        dialog.evaluate((element) => getComputedStyle(element).direction),
        inputShell.evaluate((element) => getComputedStyle(element).direction),
      ]).then(([dialogDirection, inputDirection]) => ({
        dialog: dialogDirection,
        input: inputDirection,
      })),
    ]);

  expect(directions).toEqual({ dialog: 'rtl', input: 'rtl' });
  expect(prefixBox.x).toBeGreaterThanOrEqual(inputBox.x + inputBox.width);
  expect(closeBox.x + closeBox.width).toBeLessThanOrEqual(titleBox.x);
  expect(closeBox.x).toBeGreaterThanOrEqual(headerBox.x);
  expect(closeBox.x + closeBox.width).toBeLessThan(headerBox.x + headerBox.width / 2);
});
