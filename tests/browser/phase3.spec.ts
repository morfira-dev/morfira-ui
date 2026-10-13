import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
});

test('Dropdown delegates keyboard navigation to Menu and restores trigger focus', async ({
  page,
}) => {
  const trigger = page.getByRole('button', { name: 'Release actions' });
  const menu = page.getByRole('menu');
  const promote = page.getByRole('menuitem', { name: 'Promote release' });
  const rollback = page.getByRole('menuitem', { name: 'Rollback unavailable' });
  const archive = page.getByRole('menuitem', { name: 'Archive release' });

  await trigger.focus();
  await trigger.press('ArrowDown');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(menu).toBeVisible();
  await expect(promote).toBeFocused();
  await expect(rollback).toHaveAttribute('aria-disabled', 'true');

  await promote.press('ArrowDown');
  await expect(archive).toBeFocused();
  await archive.press('Escape');
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('Menu selection closes Dropdown and announces the selected action', async ({
  page,
}) => {
  const trigger = page.getByRole('button', { name: 'Release actions' });
  const archive = page.getByRole('menuitem', { name: 'Archive release' });

  await trigger.click();
  await archive.click();

  await expect(page.getByRole('menu')).toBeHidden();
  await expect(page.locator('#release-menu-result')).toHaveText(
    'Selected: release-archive',
  );
  await expect(trigger).toBeFocused();
});

test('Combobox filters options, exposes active descendant, and selects by keyboard', async ({
  page,
}) => {
  const input = page.getByRole('combobox', { name: 'Deployment environment' });
  const listbox = page.getByRole('listbox', { name: 'Deployment environment' });

  await input.fill('Pro');
  await expect(listbox).toBeVisible();
  await expect(page.getByRole('option', { name: 'Production' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'Development' })).toBeHidden();

  await input.press('ArrowDown');
  await expect(input).toHaveAttribute(
    'aria-activedescendant',
    'environment-production',
  );
  await input.press('Enter');
  await expect(input).toHaveValue('Production');
  await expect(listbox).toBeHidden();
  await expect(input).not.toHaveAttribute('aria-activedescendant', /.+/u);
});

test('Autocomplete keeps DOM focus in the input while navigating suggestions', async ({
  page,
}) => {
  const input = page.getByRole('combobox', { name: 'Release owner' });

  await input.fill('Grace');
  await input.press('ArrowDown');

  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute('aria-activedescendant', 'owner-grace');
  await expect(page.getByRole('option', { name: 'Grace Hopper' })).toHaveAttribute(
    'data-active',
    '',
  );
});

test('Toast exposes a polite status and supports close and reopen controls', async ({
  page,
}) => {
  const toast = page.getByRole('status');

  await expect(toast).toBeVisible();
  await expect(toast).toHaveAttribute('aria-live', 'polite');
  await page.getByRole('button', { name: 'Dismiss deployment notification' }).click();
  await expect(toast).toBeHidden();
  await page.getByRole('button', { name: 'Show deployment toast' }).click();
  await expect(toast).toBeVisible();
});

test('Drawer uses the native modal layer, initial focus, Escape, and focus restoration', async ({
  page,
}) => {
  const trigger = page.getByRole('button', { name: 'Inspect deployment' });
  const drawer = page.locator('#deployment-drawer');
  const initialFocus = page.getByRole('button', { name: 'View release log' });

  await trigger.click();
  await expect(drawer).toHaveAttribute('open', '');
  await expect
    .poll(() => drawer.evaluate((element) => element.matches(':modal')))
    .toBe(true);
  await expect(initialFocus).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(drawer).not.toHaveAttribute('open', '');
  await expect(trigger).toBeFocused();
});

test('Table enhancement preserves native caption, headers, rows, and sorting semantics', async ({
  page,
}) => {
  const table = page.getByRole('table', { name: 'Recent deployments' });

  await expect(table).toHaveAttribute('data-density', 'comfortable');
  await expect(table).toHaveAttribute('data-striped', '');
  await expect(table).toHaveAttribute('data-hoverable', '');
  await expect(table).toHaveAttribute('data-sticky-header', '');
  await expect(page.getByRole('columnheader', { name: 'Version' })).toHaveAttribute(
    'aria-sort',
    'descending',
  );
  await expect(
    page.getByRole('rowheader', { name: '3.0.0', exact: true }),
  ).toBeVisible();
  await expect(table.getByRole('row')).toHaveCount(4);
});
