import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

const dialogSizes = [
  { label: 'Open small', rem: 26, size: 'sm' },
  { label: 'Open medium', rem: 36, size: 'md' },
  { label: 'Open large', rem: 48, size: 'lg' },
] as const;

async function openDialog(
  page: Page,
  label: string,
): Promise<{ dialog: Locator; trigger: Locator }> {
  const trigger = page.getByRole('button', { name: label });
  const dialog = page.locator('dialog[data-morfira-dialog]');

  await trigger.focus();
  await trigger.press('Enter');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('open', '');

  return { dialog, trigger };
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ height: 900, width: 1280 });
  await page.goto('./');
});

for (const { label, rem, size } of dialogSizes) {
  test(`${size} keeps distinct surface width and an unwrapped inline-end close control`, async ({
    page,
  }) => {
    const { dialog } = await openDialog(page, label);
    const header = dialog.locator('[data-morfira-dialog-header]');
    const title = dialog.locator('[data-morfira-dialog-title]');
    const close = dialog.getByRole('button', { name: 'Close dialog' });

    await expect(dialog).toHaveAttribute('data-size', size);

    const [dialogBox, headerBox, titleBox, closeBox, rootFontSize, flexWrap] =
      await Promise.all([
        dialog.boundingBox(),
        header.boundingBox(),
        title.boundingBox(),
        close.boundingBox(),
        page
          .locator('html')
          .evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize)),
        header.evaluate((element) => getComputedStyle(element).flexWrap),
      ]);

    expect(dialogBox).not.toBeNull();
    expect(headerBox).not.toBeNull();
    expect(titleBox).not.toBeNull();
    expect(closeBox).not.toBeNull();

    if (
      dialogBox === null ||
      headerBox === null ||
      titleBox === null ||
      closeBox === null
    ) {
      return;
    }

    expect(Math.abs(dialogBox.width - rem * rootFontSize)).toBeLessThanOrEqual(1);
    expect(flexWrap).toBe('nowrap');
    expect(closeBox.x).toBeGreaterThan(titleBox.x + titleBox.width);
    expect(closeBox.x).toBeGreaterThan(headerBox.x + headerBox.width / 2);
    expect(closeBox.x + closeBox.width).toBeLessThanOrEqual(
      headerBox.x + headerBox.width,
    );
    expect(closeBox.y).toBeGreaterThanOrEqual(headerBox.y);
    expect(closeBox.y + closeBox.height).toBeLessThanOrEqual(
      headerBox.y + headerBox.height,
    );
    expect(
      Math.abs(closeBox.y + closeBox.height / 2 - (titleBox.y + titleBox.height / 2)),
    ).toBeLessThanOrEqual(3);
  });
}

test('moves initial focus into the modal', async ({ page }) => {
  const { dialog } = await openDialog(page, 'Open medium');

  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
});

test('prevents programmatic focus from escaping the modal top layer', async ({
  page,
}) => {
  const { dialog, trigger } = await openDialog(page, 'Open medium');

  await trigger.focus();
  await expect
    .poll(() => dialog.evaluate((element) => element.contains(document.activeElement)))
    .toBe(true);
});

test('Escape closes the modal and restores focus to its trigger', async ({ page }) => {
  const { dialog, trigger } = await openDialog(page, 'Open medium');

  await page.keyboard.press('Escape');

  await expect(dialog).not.toHaveAttribute('open', '');
  await expect(dialog).toHaveAttribute('data-state', 'closed');
  await expect(trigger).toBeFocused();
});

test('content interaction stays open while direct backdrop interaction dismisses', async ({
  page,
}) => {
  const { dialog, trigger } = await openDialog(page, 'Open medium');

  await dialog.locator('[data-morfira-dialog-body]').click();
  await expect(dialog).toHaveAttribute('open', '');

  const box = await dialog.boundingBox();
  expect(box).not.toBeNull();

  if (box === null) {
    return;
  }

  const backdropX = Math.max(1, box.x / 2);
  const backdropY = Math.max(1, box.y / 2);
  await page.mouse.click(backdropX, backdropY);

  await expect(dialog).not.toHaveAttribute('open', '');
  await expect(trigger).toBeFocused();
});

test('locks document scrolling only for the open lifecycle', async ({ page }) => {
  const { dialog } = await openDialog(page, 'Open large');

  await expect
    .poll(() => page.locator('html').evaluate((element) => element.style.overflow))
    .toBe('hidden');

  await dialog.getByRole('button', { name: 'Cancel' }).click();

  await expect(dialog).not.toHaveAttribute('open', '');
  await expect
    .poll(() => page.locator('html').evaluate((element) => element.style.overflow))
    .toBe('');
});

test('keeps header and footer fixed while a long body owns scrolling', async ({
  page,
}) => {
  const { dialog } = await openDialog(page, 'Open medium');
  const header = dialog.locator('[data-morfira-dialog-header]');
  const body = dialog.locator('[data-morfira-dialog-body]');
  const footer = dialog.locator('[data-morfira-dialog-footer]');

  await body.evaluate((element) => {
    const longContent = document.createElement('div');
    longContent.style.blockSize = '100rem';
    element.append(longContent);
  });

  const [headerBefore, footerBefore, scrollGeometry] = await Promise.all([
    header.boundingBox(),
    footer.boundingBox(),
    body.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    })),
  ]);
  expect(scrollGeometry.scrollHeight).toBeGreaterThan(scrollGeometry.clientHeight);

  await body.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });

  const [headerAfter, footerAfter] = await Promise.all([
    header.boundingBox(),
    footer.boundingBox(),
  ]);
  expect(headerAfter?.y).toBe(headerBefore?.y);
  expect(footerAfter?.y).toBe(footerBefore?.y);
});
