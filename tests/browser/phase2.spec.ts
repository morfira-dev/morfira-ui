import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
});

test('native form controls preserve labels, state, and visible size contracts', async ({
  page,
}) => {
  const checkbox = page.getByRole('checkbox', { name: 'Checkbox' });
  const switchControl = page.getByRole('switch', { name: 'Notifications' });
  const stable = page.getByRole('radio', { name: 'Stable', exact: true });
  const preview = page.getByRole('radio', { name: 'Preview', exact: true });

  await expect(checkbox).toBeChecked();
  await checkbox.click();
  await expect(checkbox).not.toBeChecked();
  await expect(switchControl).toBeChecked();
  await switchControl.press('Space');
  await expect(switchControl).not.toBeChecked();
  await expect(stable).toBeChecked();
  await preview.click();
  await expect(preview).toBeChecked();
  await expect(stable).not.toBeChecked();

  const disabledStable = page.getByRole('radio', { name: 'Disabled stable' });
  const disabledPreview = page.getByRole('radio', { name: 'Disabled preview' });
  await expect(disabledStable).toBeChecked();
  await expect(disabledPreview).not.toBeChecked();
  const disabledRadioStyles = await Promise.all(
    [disabledStable, disabledPreview].map((control) =>
      control.evaluate((element) => ({
        background: getComputedStyle(element).backgroundColor,
        backgroundImage: getComputedStyle(element).backgroundImage,
        border: getComputedStyle(element).borderColor,
        checked: (element as HTMLInputElement).checked,
        indicator: getComputedStyle(element).boxShadow,
        matchesDisabledChecked: element.matches(':disabled:checked'),
      })),
    ),
  );
  expect(disabledRadioStyles[0]).not.toEqual(disabledRadioStyles[1]);

  await expect(page.getByRole('textbox', { name: 'Release notes' })).toHaveValue(
    'Ready for staged rollout.',
  );
  await expect(page.getByRole('combobox', { name: 'Release region' })).toHaveValue(
    'eu',
  );
});

test('unchecked Switch track remains perceptible on light and dark surfaces', async ({
  page,
}) => {
  const switchControl = page.getByRole('switch', { name: 'Quiet mode' });

  await expect(switchControl).not.toBeChecked();

  for (const theme of ['light', 'dark'] as const) {
    await page.locator('html').evaluate((element, activeTheme) => {
      element.dataset.morfiraTheme = activeTheme;
    }, theme);

    const colors = await switchControl.evaluate((element) => {
      const styles = getComputedStyle(element);
      const panelElement = element.closest<HTMLElement>('.panel');
      if (panelElement === null) throw new Error('Switch panel is missing');
      const panel = getComputedStyle(panelElement);

      return {
        boundary: styles.borderColor,
        panel: panel.backgroundColor,
        thumb: styles.backgroundImage,
        track: styles.backgroundColor,
      };
    });

    expect(colors.boundary, `${theme} theme Switch boundary`).not.toBe(colors.panel);
    expect(colors.track, `${theme} theme Switch track`).not.toBe(colors.panel);
    expect(colors.thumb, `${theme} theme Switch thumb`).not.toBe('none');
  }

  await page.locator('html').evaluate((element) => {
    (element as HTMLElement).dir = 'ltr';
  });
  const ltrPosition = await switchControl.evaluate(
    (element) => getComputedStyle(element).backgroundPositionX,
  );
  await page.locator('html').evaluate((element) => {
    (element as HTMLElement).dir = 'rtl';
  });
  const rtlPosition = await switchControl.evaluate(
    (element) => getComputedStyle(element).backgroundPositionX,
  );
  expect(rtlPosition).not.toBe(ltrPosition);
});

test('Tooltip remains hoverable and Escape dismisses it', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Deployment help' });
  const tooltip = page.getByRole('tooltip');

  await trigger.hover();
  await expect(tooltip).toBeVisible();
  await tooltip.hover();
  await expect(tooltip).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(tooltip).toBeHidden();
});

test('Popover exposes controlled disclosure and restores trigger focus', async ({
  page,
}) => {
  const trigger = page.getByRole('button', { name: 'Deployment actions' });
  const popover = page.getByRole('dialog', { name: 'Deployment actions' });

  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(popover).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(popover).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('Tabs implement selection, roving focus, disabled skipping, and RTL arrows', async ({
  page,
}) => {
  const overview = page.getByRole('tab', { name: 'Overview' });
  const activity = page.getByRole('tab', { name: 'Activity' });
  const audit = page.getByRole('tab', { name: 'Audit' });

  await overview.focus();
  await overview.press('ArrowRight');
  await expect(activity).toBeFocused();
  await expect(activity).toHaveAttribute('aria-selected', 'true');
  await expect(audit).toHaveAttribute('aria-disabled', 'true');

  await page.locator('html').evaluate((element) => {
    element.setAttribute('dir', 'rtl');
  });
  await activity.press('ArrowRight');
  await expect(overview).toBeFocused();
  await expect(overview).toHaveAttribute('aria-selected', 'true');
});

test('Accordion keeps native summary activation under controlled state', async ({
  page,
}) => {
  const requirements = page.getByText('Requirements', { exact: true });
  const rollback = page.getByText('Rollback', { exact: true });

  await expect(requirements).toHaveAttribute('aria-expanded', 'true');
  await rollback.click();
  await expect(rollback).toHaveAttribute('aria-expanded', 'true');
  await expect(requirements).toHaveAttribute('aria-expanded', 'false');
  await rollback.press('ArrowUp');
  await expect(requirements).toBeFocused();
});
