import { expect, test } from '@playwright/test';
import type { Locator } from '@playwright/test';

const consumers = ['react', 'svelte', 'vue'] as const;

async function fieldAssociations(input: Locator): Promise<{
  readonly describedBy: readonly string[];
  readonly errorMessage: string | null;
  readonly labelId: string | undefined;
  readonly labelledBy: string | null;
}> {
  return input.evaluate((element) => {
    const inputElement = element as HTMLInputElement;
    const label = document.querySelector<HTMLLabelElement>(
      `label[for="${CSS.escape(inputElement.id)}"]`,
    );

    return {
      describedBy: (inputElement.getAttribute('aria-describedby') ?? '')
        .split(/\s+/u)
        .filter(Boolean),
      errorMessage: inputElement.getAttribute('aria-errormessage'),
      labelId: label?.id,
      labelledBy: inputElement.getAttribute('aria-labelledby'),
    };
  });
}

for (const framework of consumers) {
  test(`${framework} conforms Button, Field, and Input public behavior`, async ({
    page,
    request,
  }) => {
    const url = `http://127.0.0.1:4174/${framework}/`;
    const response = await request.get(url);
    expect(response.ok()).toBe(true);

    const serverHtml = await response.text();
    for (const marker of [
      'data-consumer-button',
      'data-consumer-button-loading',
      'data-consumer-button-disabled',
      'data-consumer-field',
      'data-consumer-input',
      'data-consumer-field-error',
      'data-consumer-input-error',
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

    const button = page.locator('[data-consumer-button]');
    const loadingButton = page.locator('[data-consumer-button-loading]');
    const disabledButton = page.locator('[data-consumer-button-disabled]');
    const buttonCount = page.locator('[data-consumer-button-count]');

    await expect(button).toHaveAttribute('type', 'button');
    await expect(button).toHaveAttribute('data-morfira-button', '');
    await expect(button).toHaveAttribute('data-variant', 'secondary');
    await expect(button).toHaveAttribute('data-size', 'md');

    const initialButtonCount = await buttonCount.textContent();
    await button.click();
    await expect.poll(() => buttonCount.textContent()).not.toBe(initialButtonCount);
    const activeButtonCount = await buttonCount.textContent();

    await expect(loadingButton).toBeDisabled();
    await expect(loadingButton).toHaveAttribute('aria-busy', 'true');
    await expect(loadingButton).toHaveAttribute('data-loading', '');
    await expect(disabledButton).toBeDisabled();
    await expect(disabledButton).not.toHaveAttribute('aria-busy');
    await expect(disabledButton).not.toHaveAttribute('data-loading');

    await loadingButton.evaluate((element) => {
      (element as HTMLButtonElement).click();
    });
    await disabledButton.evaluate((element) => {
      (element as HTMLButtonElement).click();
    });
    await expect.poll(() => buttonCount.textContent()).toBe(activeButtonCount);

    const field = page.locator('[data-consumer-field]');
    const input = page.locator('[data-consumer-input]');
    const inputValue = page.locator('[data-consumer-input-value]');

    await expect(field).toHaveAttribute('data-required', '');
    await expect(input).toHaveAttribute('required', '');
    await expect(input).not.toHaveAttribute('aria-invalid');

    const associations = await fieldAssociations(input);
    expect(associations.labelId).toBeTruthy();
    expect(associations.labelledBy).toBe(associations.labelId);
    expect(associations.describedBy).toHaveLength(1);
    expect(associations.errorMessage).toBeNull();

    const nextValue = `Conformance ${framework}`;
    await input.fill(nextValue);
    await expect(inputValue).toContainText(nextValue);

    const errorField = page.locator('[data-consumer-field-error]');
    const errorInput = page.locator('[data-consumer-input-error]');
    await expect(errorField).toHaveAttribute('data-validation', 'error');
    await expect(errorField).toHaveAttribute('data-readonly', '');
    await expect(errorInput).toHaveAttribute('readonly', '');
    await expect(errorInput).toHaveAttribute('aria-invalid', 'true');

    const errorAssociations = await fieldAssociations(errorInput);
    expect(errorAssociations.labelId).toBeTruthy();
    expect(errorAssociations.labelledBy).toBe(errorAssociations.labelId);
    expect(errorAssociations.describedBy).toHaveLength(2);
    expect(errorAssociations.errorMessage).toBeTruthy();
    expect(errorAssociations.describedBy).toContain(errorAssociations.errorMessage);
    await expect(
      errorField.locator('[data-morfira-field-message][data-message-kind="error"]'),
    ).toHaveCount(1);
    expect(runtimeErrors).toEqual([]);
  });

  test(`${framework} SSR and hydration conform for every Phase 2 adapter`, async ({
    page,
    request,
  }) => {
    const url = `http://127.0.0.1:4174/${framework}/`;
    const response = await request.get(url);
    expect(response.ok()).toBe(true);
    const serverHtml = await response.text();
    for (const marker of [
      'data-consumer-checkbox',
      'data-consumer-radio',
      'data-consumer-switch',
      'data-consumer-textarea',
      'data-consumer-select',
      'data-consumer-tooltip-trigger',
      'data-consumer-popover-trigger',
      'data-consumer-tabs',
      'data-consumer-accordion',
    ]) {
      expect(serverHtml).toContain(marker);
    }

    const runtimeErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') runtimeErrors.push(message.text());
    });
    page.on('pageerror', (error) => {
      runtimeErrors.push(error.message);
    });
    await page.goto(url);
    await page.getByRole('button', { name: 'Close confirmation' }).click();

    const checkbox = page.locator('[data-consumer-checkbox]');
    const checkboxInitiallyChecked = await checkbox.isChecked();
    await checkbox.click();
    await expect(checkbox).toBeChecked({ checked: !checkboxInitiallyChecked });

    const radios = page.locator('input[data-morfira-radio]');
    await expect(radios).toHaveCount(2);
    await radios.nth(1).click();
    await expect(radios.nth(1)).toBeChecked();
    await expect(radios.nth(0)).not.toBeChecked();

    const switchControl = page.locator('[data-consumer-switch]');
    const switchInitiallyChecked = await switchControl.isChecked();
    await switchControl.click();
    await expect(switchControl).toBeChecked({ checked: !switchInitiallyChecked });

    const textarea = page.locator('[data-consumer-textarea]');
    await textarea.fill(`Hydrated ${framework}`);
    await expect(textarea).toHaveValue(`Hydrated ${framework}`);

    const select = page.locator('[data-consumer-select]');
    const options = select.locator('option');
    expect(await options.count()).toBeGreaterThan(1);
    const secondValue = await options.nth(1).getAttribute('value');
    expect(secondValue).toBeTruthy();
    await select.selectOption(secondValue ?? '');
    await expect(select).toHaveValue(secondValue ?? '');

    const tooltipTrigger = page.locator('[data-consumer-tooltip-trigger]');
    await tooltipTrigger.hover();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toBeHidden();

    const popoverTrigger = page.locator('[data-consumer-popover-trigger]');
    await popoverTrigger.click();
    await expect(popoverTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('dialog').last()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(popoverTrigger).toHaveAttribute('aria-expanded', 'false');

    const tabs = page.getByRole('tab');
    await expect(tabs).toHaveCount(2);
    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');

    const accordionTriggers = page.locator('[data-morfira-accordion-trigger]');
    await expect(accordionTriggers).toHaveCount(2);
    await accordionTriggers.nth(1).click();
    await expect(accordionTriggers.nth(1)).toHaveAttribute('aria-expanded', 'true');

    expect(runtimeErrors).toEqual([]);
  });
}
