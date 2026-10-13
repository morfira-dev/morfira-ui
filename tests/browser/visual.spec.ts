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

test('keeps Phase 2 native form controls stable in light and dark themes', async ({
  page,
}) => {
  const controls = page
    .getByRole('heading', { name: 'Phase 2 form controls' })
    .locator('xpath=following-sibling::div[1]');
  const checkbox = controls.locator('input[data-morfira-checkbox]');

  await checkbox.evaluate((element: HTMLInputElement) => {
    element.indeterminate = true;
    element.setAttribute('data-indeterminate', '');
  });
  await setTheme(page, 'light');
  await expect(controls).toHaveScreenshot('phase2-form-controls-light.png', {
    maxDiffPixelRatio: 0.002,
  });

  await setTheme(page, 'dark');
  await expect(controls).toHaveScreenshot('phase2-form-controls-dark.png', {
    maxDiffPixelRatio: 0.002,
  });
});

test('keeps the open Phase 2 Tooltip surface stable', async ({ page }) => {
  await setTheme(page, 'light');
  const panel = page
    .getByRole('heading', { name: 'Tooltip and Popover' })
    .locator('..');
  await panel.evaluate((element: HTMLElement) => {
    element.style.minBlockSize = '14rem';
  });
  await page.getByRole('button', { name: 'Deployment help' }).hover();
  await expect(page.getByRole('tooltip')).toBeVisible();

  await expect(panel).toHaveScreenshot('phase2-tooltip-open-light.png');
});

test('keeps the open Phase 2 Popover surface stable', async ({ page }) => {
  await setTheme(page, 'dark');
  const panel = page
    .getByRole('heading', { name: 'Tooltip and Popover' })
    .locator('..');
  await panel.evaluate((element: HTMLElement) => {
    element.style.minBlockSize = '28rem';
  });
  await page.getByRole('button', { name: 'Deployment actions' }).click();
  await expect(page.getByRole('dialog', { name: 'Deployment actions' })).toBeVisible();

  await expect(panel).toHaveScreenshot('phase2-popover-open-dark.png');
});

test('keeps Phase 2 Tabs and Accordion selected states stable', async ({ page }) => {
  await setTheme(page, 'light');
  await page.getByRole('tab', { name: 'Activity' }).click();
  await page.getByText('Rollback', { exact: true }).click();

  const tabs = page.getByRole('heading', { name: 'Tabs', exact: true }).locator('..');
  const accordion = page
    .getByRole('heading', { name: 'Accordion', exact: true })
    .locator('..');
  await expect(tabs).toHaveScreenshot('phase2-tabs-active-light.png');
  await expect(accordion).toHaveScreenshot('phase2-accordion-open-light.png');
});

test('keeps open Phase 3 selection surfaces stable', async ({ page }) => {
  await setTheme(page, 'light');
  const panel = page
    .getByRole('heading', { name: 'Combobox and Autocomplete' })
    .locator('..');
  await page.getByRole('combobox', { name: 'Deployment environment' }).fill('Pro');
  await page
    .getByRole('combobox', { name: 'Deployment environment' })
    .press('ArrowDown');

  await expect(panel).toHaveScreenshot('phase3-combobox-open-light.png');
});

test('keeps Phase 3 Toast and Table presentation stable', async ({ page }) => {
  await setTheme(page, 'dark');
  const toast = page.getByRole('heading', { name: 'Toast', exact: true }).locator('..');
  const table = page.getByRole('table', { name: 'Recent deployments' });

  await expect(toast).toHaveScreenshot('phase3-toast-dark.png');
  await expect(table.locator('..')).toHaveScreenshot('phase3-table-dark.png');
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
