import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import type {
  DialogController,
  DialogDomOptions,
  enhanceDialog as enhanceDialogType,
} from '../../packages/dom/src/dialog.js';

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

test('nested modals retain the shared scroll lock and restore focus in stack order', async ({
  page,
}) => {
  const initialOverflow = await page.evaluate(async () => {
    const moduleUrl = '/packages/dom/dist/dialog.js';
    const dialogModule: unknown = await import(moduleUrl);
    const { enhanceDialog } = dialogModule as {
      enhanceDialog: typeof enhanceDialogType;
    };
    const root = document.documentElement;
    root.style.overflow = 'clip';

    const opener = document.createElement('button');
    opener.textContent = 'Nested dialog opener';
    const outer = document.createElement('dialog');
    const outerControl = document.createElement('button');
    outerControl.textContent = 'Outer control';
    outer.append(outerControl);
    const inner = document.createElement('dialog');
    const innerControl = document.createElement('button');
    innerControl.textContent = 'Inner control';
    inner.append(innerControl);
    document.body.append(opener, outer, inner);
    opener.focus();

    const controllers: {
      inner?: DialogController;
      outer?: DialogController;
    } = {};
    const outerOptions: DialogDomOptions = {
      ids: { titleId: 'nested-outer-title' },
      open: true,
      initialFocus: outerControl,
      onDismiss: () => {
        controllers.outer?.update({
          ids: { titleId: 'nested-outer-title' },
          open: false,
          initialFocus: outerControl,
        });
      },
    };
    const innerOptions: DialogDomOptions = {
      ids: { titleId: 'nested-inner-title' },
      open: true,
      initialFocus: innerControl,
      onDismiss: () => {
        controllers.inner?.update({
          ids: { titleId: 'nested-inner-title' },
          open: false,
          initialFocus: innerControl,
        });
      },
    };
    controllers.outer = enhanceDialog(outer, outerOptions);
    controllers.inner = enhanceDialog(inner, innerOptions);

    Object.assign(window, {
      __morfiraNestedDialogProof: {
        inner,
        innerControl,
        innerController: controllers.inner,
        opener,
        outer,
        outerControl,
        outerController: controllers.outer,
      },
    });

    return root.style.overflow;
  });

  expect(initialOverflow).toBe('hidden');
  await expect(page.getByRole('button', { name: 'Inner control' })).toBeFocused();

  await page.keyboard.press('Escape');

  await expect(page.getByRole('button', { name: 'Outer control' })).toBeFocused();
  expect(
    await page.evaluate(() => {
      const proof = Reflect.get(window, '__morfiraNestedDialogProof') as {
        inner: HTMLDialogElement;
        outer: HTMLDialogElement;
      };
      return {
        innerOpen: proof.inner.open,
        outerOpen: proof.outer.open,
        overflow: document.documentElement.style.overflow,
      };
    }),
  ).toEqual({ innerOpen: false, outerOpen: true, overflow: 'hidden' });

  await page.keyboard.press('Escape');

  await expect(
    page.getByRole('button', { name: 'Nested dialog opener' }),
  ).toBeFocused();
  expect(
    await page.evaluate(() => {
      const proof = Reflect.get(window, '__morfiraNestedDialogProof') as {
        innerController: { destroy(): void };
        outerController: { destroy(): void };
      };
      proof.innerController.destroy();
      proof.outerController.destroy();
      const overflow = document.documentElement.style.overflow;
      Reflect.deleteProperty(window, '__morfiraNestedDialogProof');
      return overflow;
    }),
  ).toBe('clip');
});

test('destroying the outer modal first preserves the inner top layer and scroll lock', async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const moduleUrl = '/packages/dom/dist/dialog.js';
    const dialogModule: unknown = await import(moduleUrl);
    const { enhanceDialog } = dialogModule as {
      enhanceDialog: typeof enhanceDialogType;
    };
    const root = document.documentElement;
    root.style.overflow = 'clip';
    const opener = document.createElement('button');
    opener.textContent = 'Out-of-order opener';
    const outer = document.createElement('dialog');
    const outerControl = document.createElement('button');
    outerControl.textContent = 'Out-of-order outer control';
    outer.append(outerControl);
    const inner = document.createElement('dialog');
    const innerControl = document.createElement('button');
    innerControl.textContent = 'Out-of-order inner control';
    inner.append(innerControl);
    document.body.append(opener, outer, inner);
    opener.focus();

    const outerController = enhanceDialog(outer, {
      ids: { titleId: 'out-of-order-outer-title' },
      initialFocus: outerControl,
      open: true,
      returnFocus: opener,
    });
    const innerController = enhanceDialog(inner, {
      ids: { titleId: 'out-of-order-inner-title' },
      initialFocus: innerControl,
      open: true,
      returnFocus: opener,
    });

    outerController.destroy();
    const afterOuterDestroy = {
      activeText: document.activeElement?.textContent,
      innerOpen: inner.open,
      outerOpen: outer.open,
      overflow: root.style.overflow,
    };
    innerController.destroy();
    const afterInnerDestroy = {
      activeText: document.activeElement?.textContent,
      innerOpen: inner.open,
      overflow: root.style.overflow,
    };

    outer.remove();
    inner.remove();
    opener.remove();
    root.style.overflow = '';
    return { afterInnerDestroy, afterOuterDestroy };
  });

  expect(result).toEqual({
    afterInnerDestroy: {
      activeText: 'Out-of-order opener',
      innerOpen: false,
      overflow: 'clip',
    },
    afterOuterDestroy: {
      activeText: 'Out-of-order inner control',
      innerOpen: true,
      outerOpen: false,
      overflow: 'hidden',
    },
  });
});

test('rapid state synchronization and disconnected teardown leave no modal effects', async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const moduleUrl = '/packages/dom/dist/dialog.js';
    const dialogModule: unknown = await import(moduleUrl);
    const { enhanceDialog } = dialogModule as {
      enhanceDialog: typeof enhanceDialogType;
    };
    const root = document.documentElement;
    root.style.overflow = 'scroll';
    const opener = document.createElement('button');
    opener.textContent = 'Lifecycle opener';
    const dialog = document.createElement('dialog');
    const control = document.createElement('button');
    control.textContent = 'Lifecycle control';
    dialog.append(control);
    document.body.append(opener, dialog);
    opener.focus();

    const nativeShowModal = dialog.showModal.bind(dialog);
    const nativeClose = dialog.close.bind(dialog);
    let showModalCalls = 0;
    let closeCalls = 0;
    dialog.showModal = () => {
      showModalCalls += 1;
      nativeShowModal();
    };
    dialog.close = () => {
      closeCalls += 1;
      nativeClose();
    };

    const ids = { titleId: 'lifecycle-title' } as const;
    const controller = enhanceDialog(dialog, {
      ids,
      open: true,
      initialFocus: control,
    });
    controller.update({ ids, open: false, initialFocus: control });
    controller.update({ ids, open: true, initialFocus: control });
    controller.update({ ids, open: true, initialFocus: control, size: 'lg' });
    dialog.remove();
    controller.destroy();
    controller.destroy();
    controller.update({ ids, open: true });
    controller.requestClose('close-button');

    return {
      activeText: document.activeElement?.textContent,
      closeCalls,
      connected: dialog.isConnected,
      dataState: dialog.getAttribute('data-state'),
      open: dialog.open,
      overflow: root.style.overflow,
      showModalCalls,
    };
  });

  expect(result).toEqual({
    activeText: 'Lifecycle opener',
    closeCalls: 2,
    connected: false,
    dataState: null,
    open: false,
    overflow: 'scroll',
    showModalCalls: 2,
  });
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
