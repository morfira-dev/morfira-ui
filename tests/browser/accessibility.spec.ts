import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function expectNoWcag22AAViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'])
    .analyze();

  const report = results.violations
    .map(
      (violation) =>
        `${violation.id} (${violation.impact ?? 'unknown impact'}): ${violation.help}\n` +
        violation.nodes
          .map(
            (node) =>
              `  ${node.target.join(' ')}\n  ${node.failureSummary ?? node.html}`,
          )
          .join('\n'),
    )
    .join('\n\n');

  expect(results.violations, report).toEqual([]);
}

test('DOM playground base page has no automated WCAG 2.2 AA violations', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Morfira UI' }),
  ).toBeVisible();
  await expectNoWcag22AAViolations(page);
});

test('DOM playground open Dialog has no automated WCAG 2.2 AA violations', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await page.getByRole('button', { name: 'Open medium' }).click();

  const dialog = page.getByRole('dialog', { name: 'Review deployment' });
  await expect(dialog).toHaveAttribute('open', '');
  await expect
    .poll(() => dialog.evaluate((element) => element.matches(':modal')))
    .toBe(true);

  await expectNoWcag22AAViolations(page);
});

test('DOM playground open Phase 3 disclosures have no automated WCAG 2.2 AA violations', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await page.getByRole('button', { name: 'Release actions' }).click();
  await page
    .getByRole('combobox', { name: 'Deployment environment' })
    .fill('Production');

  await expect(page.getByRole('menu')).toBeVisible();
  await expect(
    page.getByRole('listbox', { name: 'Deployment environment' }),
  ).toBeVisible();
  await expectNoWcag22AAViolations(page);
});

test('DOM playground open Drawer has no automated WCAG 2.2 AA violations', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await page.getByRole('button', { name: 'Inspect deployment' }).click();

  const drawer = page.getByRole('dialog', { name: 'Deployment details' });
  await expect(drawer).toHaveAttribute('open', '');
  await expect
    .poll(() => drawer.evaluate((element) => element.matches(':modal')))
    .toBe(true);
  await expectNoWcag22AAViolations(page);
});

for (const framework of ['react', 'svelte', 'vue'] as const) {
  test(`${framework} hydrated Phase 2 surface has no automated WCAG 2.2 AA violations`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`http://127.0.0.1:4174/${framework}/`);
    await page.getByRole('button', { name: 'Close confirmation' }).click();

    await expect(page.locator('[data-consumer-checkbox]')).toBeVisible();
    await expectNoWcag22AAViolations(page);
  });

  test(`${framework} hydrated open Dialog has no automated WCAG 2.2 AA violations`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`http://127.0.0.1:4174/${framework}/`);

    const dialog = page.locator(`dialog[data-consumer-dialog="${framework}"]`);
    await expect(dialog).toHaveAttribute('open', '');
    await expect
      .poll(() => dialog.evaluate((element) => element.matches(':modal')))
      .toBe(true);

    await expectNoWcag22AAViolations(page);
  });
}
