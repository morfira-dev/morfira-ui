import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

const inheritedPanel = 'section[aria-labelledby="light-heading"]';
const explicitDarkPanel = 'section[aria-labelledby="dark-heading"]';

async function setTheme(page: Page, theme: 'dark' | 'light'): Promise<void> {
  await page.locator('html').evaluate((element, activeTheme) => {
    element.dataset.morfiraTheme = activeTheme;
  }, theme);
}

async function openDialog(
  page: Page,
  size: 'small' | 'medium' | 'large',
): Promise<Locator> {
  const dialog = page.locator('dialog[data-morfira-dialog]');

  await page.getByRole('button', { name: `Open ${size}` }).click();
  await expect(dialog).toHaveAttribute('open', '');
  await expect(dialog).toHaveAttribute(
    'data-size',
    size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'md',
  );

  return dialog;
}

test.beforeEach(async ({ browserName, page }) => {
  test.skip(
    browserName !== 'chromium',
    'Chromium owns portable golden images; Firefox and WebKit run behavioral coverage.',
  );

  await page.setViewportSize({ height: 900, width: 1280 });
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.goto('./');
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        caret-color: transparent !important;
      }
    `,
  });
});

test('keeps Button variants, sizes, and inactive states stable in both themes', async ({
  page,
}) => {
  await setTheme(page, 'light');

  await expect(page.locator(inheritedPanel)).toHaveScreenshot(
    'button-states-light.png',
  );
  await expect(page.locator(explicitDarkPanel)).toHaveScreenshot(
    'button-states-dark.png',
  );
});

test('keeps Field and Input sizes, validation states, and focus treatment stable', async ({
  page,
}) => {
  await setTheme(page, 'light');

  const inputPanels = page.locator('section[aria-label$="input states" i]');
  await expect(inputPanels.nth(0)).toHaveScreenshot('field-input-states-light.png');
  await expect(inputPanels.nth(1)).toHaveScreenshot('field-input-states-dark.png');

  const email = page.getByRole('textbox', { exact: true, name: 'Email' });
  await email.focus();
  await expect(email).toBeFocused();
  await expect(email.locator('xpath=../..')).toHaveScreenshot(
    'field-input-focus-light.png',
  );
});

for (const size of ['small', 'medium', 'large'] as const) {
  test(`keeps the ${size} Dialog geometry stable`, async ({ page }) => {
    await setTheme(page, size === 'medium' ? 'dark' : 'light');
    const dialog = await openDialog(page, size);

    await expect(dialog).toHaveScreenshot(
      `dialog-${size}-${size === 'medium' ? 'dark' : 'light'}.png`,
    );
  });
}

test('keeps the modal backdrop and centered composition stable', async ({ page }) => {
  await setTheme(page, 'light');
  await openDialog(page, 'medium');

  await expect(page).toHaveScreenshot('dialog-modal-composition-light.png');
});
