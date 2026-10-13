import { expect, test } from '@playwright/test';

const consumers = ['react', 'svelte', 'vue'] as const;

for (const framework of consumers) {
  test(`${framework} preserves SSR markup and promotes Dialog during hydration`, async ({
    page,
    request,
  }) => {
    const url = `http://127.0.0.1:4174/${framework}/`;
    const response = await request.get(url);
    expect(response.ok()).toBe(true);

    const serverHtml = await response.text();
    const dialogTag = serverHtml.match(
      new RegExp(`<dialog\\b[^>]*data-consumer-dialog="${framework}"[^>]*>`, 'u'),
    )?.[0];

    expect(dialogTag).toBeDefined();
    expect(dialogTag).toContain('data-state="open"');
    expect(dialogTag).not.toMatch(/\sopen(?:=|\s|>)/u);
    expect(dialogTag).toContain('aria-labelledby=');
    expect(dialogTag).toContain('aria-describedby=');

    const runtimeErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') {
        runtimeErrors.push(message.text());
      }
    });
    page.on('pageerror', (error) => {
      runtimeErrors.push(error.message);
    });

    await page.goto(url);

    const dialog = page.locator(`dialog[data-consumer-dialog="${framework}"]`);
    const initialFocus = dialog.getByRole('button', { name: 'Review deployment' });
    const close = dialog.getByRole('button', { name: 'Close confirmation' });

    await expect(dialog).toHaveAttribute('open', '');
    await expect(dialog).toHaveAttribute('data-state', 'open');
    await expect(initialFocus).toBeFocused();
    await expect
      .poll(() => dialog.evaluate((element) => element.matches(':modal')))
      .toBe(true);
    await expect
      .poll(() => page.locator('html').evaluate((element) => element.style.overflow))
      .toBe('hidden');

    const ids = await dialog.evaluate((element) => ({
      describedBy: element.getAttribute('aria-describedby'),
      labelledBy: element.getAttribute('aria-labelledby'),
    }));
    expect(ids.describedBy).toBeTruthy();
    expect(ids.labelledBy).toBeTruthy();

    await close.click();
    await expect(dialog).not.toHaveAttribute('open', '');
    await expect(dialog).toHaveAttribute('data-state', 'closed');
    await expect(page.locator('[data-consumer-dismiss-reason]')).toContainText(
      'close-button',
    );
    await expect
      .poll(() => page.locator('html').evaluate((element) => element.style.overflow))
      .toBe('');

    const trigger = page.locator('[data-consumer-dialog-trigger]');
    await trigger.focus();
    await trigger.press('Enter');
    await expect(dialog).toHaveAttribute('open', '');
    await close.click();
    await expect(trigger).toBeFocused();
    expect(runtimeErrors).toEqual([]);
  });

  test(`${framework} preserves Button, Field, and Input SSR contracts through hydration`, async ({
    page,
    request,
  }) => {
    const url = `http://127.0.0.1:4174/${framework}/`;
    const response = await request.get(url);
    expect(response.ok()).toBe(true);

    const serverHtml = await response.text();
    for (const marker of [
      'data-consumer-button',
      'data-consumer-button-count',
      'data-consumer-field',
      'data-consumer-input',
      'data-consumer-input-value',
    ]) {
      expect(serverHtml).toContain(marker);
    }

    const runtimeErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') {
        runtimeErrors.push(message.text());
      }
    });
    page.on('pageerror', (error) => {
      runtimeErrors.push(error.message);
    });

    await page.goto(url);
    await page.getByRole('button', { name: 'Close confirmation' }).click();

    const field = page.locator('[data-consumer-field]');
    const input = page.locator('[data-consumer-input]');
    const inputValue = page.locator('[data-consumer-input-value]');
    const button = page.locator('[data-consumer-button]');
    const buttonCount = page.locator('[data-consumer-button-count]');

    await expect(field).toHaveAttribute('data-morfira-field', '');
    await expect(field).toHaveAttribute('data-required', '');
    await expect(input).toHaveAttribute('data-morfira-input', '');
    await expect(button).toHaveAttribute('data-morfira-button', '');

    const associations = await input.evaluate((element) => {
      const inputElement = element as HTMLInputElement;
      const label = document.querySelector<HTMLLabelElement>(
        `label[for="${CSS.escape(inputElement.id)}"]`,
      );

      return {
        describedBy: inputElement.getAttribute('aria-describedby'),
        labelId: label?.id,
        labelledBy: inputElement.getAttribute('aria-labelledby'),
      };
    });
    expect(associations.labelId).toBeTruthy();
    expect(associations.labelledBy).toBe(associations.labelId);
    expect(associations.describedBy).toBeTruthy();

    const initialInputValue = await input.inputValue();
    const initialButtonCount = await buttonCount.textContent();
    expect(initialInputValue).not.toBe('');
    await expect(inputValue).toContainText(initialInputValue);

    await button.click();
    await expect.poll(() => buttonCount.textContent()).not.toBe(initialButtonCount);

    const hydratedValue = `Hydrated ${framework}`;
    await input.fill(hydratedValue);
    await expect(inputValue).toContainText(hydratedValue);
    expect(runtimeErrors).toEqual([]);
  });
}
