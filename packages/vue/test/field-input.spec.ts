import { renderToString } from 'vue/server-renderer';
import { createSSRApp, h } from 'vue';
import { describe, expect, it } from 'vitest';

import { Field } from '../src/field/index.js';
import type { FieldProps } from '../src/field/index.js';
import { Input } from '../src/input/index.js';
import type { InputProps } from '../src/input/index.js';

describe('Vue Field and Input', () => {
  it('exposes native div attributes through FieldProps', () => {
    type PublicFieldProps = InstanceType<typeof Field>['$props'];

    const props = {
      ids: {
        inputId: 'email',
        labelId: 'email-label',
      },
      label: 'Email',
      id: 'email-field',
      class: 'account-field',
      role: 'group',
      'aria-label': 'Email field',
      onClick: (): void => undefined,
    } satisfies FieldProps & PublicFieldProps;

    expect(props.id).toBe('email-field');
  });

  it('exposes native input attributes through InputProps', () => {
    type PublicInputProps = InstanceType<typeof Input>['$props'];

    const props = {
      id: 'email',
      name: 'email',
      type: 'email',
      autocomplete: 'email',
      placeholder: 'name@example.com',
      class: 'account-input',
      'aria-label': 'Email address',
      onBlur: (): void => undefined,
    } satisfies InputProps & PublicInputProps;

    expect(props.autocomplete).toBe('email');
  });

  it('renders deterministic associations and native attrs during SSR', async () => {
    const app = createSSRApp({
      render: () =>
        h(
          Field,
          {
            ids: {
              inputId: 'email',
              labelId: 'email-label',
              descriptionId: 'email-help',
            },
            label: 'Email',
            description: 'Work address',
            required: true,
          },
          {
            prefix: () => '@',
            default: () => h(Input, { name: 'email', placeholder: 'name@example.com' }),
          },
        ),
    });

    const markup = await renderToString(app);

    expect(markup).toContain('for="email"');
    expect(markup).toContain('id="email-label"');
    expect(markup).toContain('id="email"');
    expect(markup).toContain('aria-labelledby="email-label"');
    expect(markup).toContain('aria-describedby="email-help"');
    expect(markup).toContain('name="email"');
    expect(markup).toMatch(/data-morfira-field-prefix(?:="")?/);
    expect(markup).toMatch(/data-required(?:="")?/);
    expect(markup).toContain('required');
    expect(markup).not.toContain('aria-invalid');
    expect(markup).not.toContain('aria-errormessage');
  });

  it('associates warning feedback without marking the input invalid', async () => {
    const app = createSSRApp({
      render: () =>
        h(
          Field,
          {
            ids: {
              inputId: 'quota',
              labelId: 'quota-label',
              validationMessageId: 'quota-warning',
            },
            label: 'Quota',
            validation: 'warning',
            validationMessage: 'Near the limit',
            readOnly: true,
          },
          { default: () => h(Input, { modelValue: '90' }) },
        ),
    });

    const markup = await renderToString(app);

    expect(markup).toContain('readonly');
    expect(markup).toMatch(/data-readonly(?:="")?/);
    expect(markup).not.toContain('disabled');
    expect(markup).not.toContain('aria-invalid');
    expect(markup).toContain('aria-describedby="quota-warning"');
    expect(markup).toContain('data-message-kind="warning"');
  });
});
