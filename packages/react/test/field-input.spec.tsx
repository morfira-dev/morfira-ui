import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Field } from '../src/field/index.js';
import { Input } from '../src/input/index.js';

describe('React Field and Input', () => {
  it('renders deterministic associations during SSR', () => {
    const markup = renderToStaticMarkup(
      <Field
        ids={{
          inputId: 'email',
          labelId: 'email-label',
          descriptionId: 'email-help',
        }}
        label="Email"
        description="Work address"
        prefix="@"
        required
      >
        <Input name="email" placeholder="name@example.com" />
      </Field>,
    );

    expect(markup).toContain('for="email"');
    expect(markup).toContain('id="email-label"');
    expect(markup).toContain('id="email"');
    expect(markup).toContain('aria-labelledby="email-label"');
    expect(markup).toContain('aria-describedby="email-help"');
    expect(markup).toContain('data-morfira-field-prefix=""');
    expect(markup).toContain('data-required=""');
    expect(markup).toContain('required=""');
    expect(markup).not.toContain('aria-invalid');
  });

  it('associates an error message and keeps read-only distinct from disabled', () => {
    const markup = renderToStaticMarkup(
      <Field
        ids={{
          inputId: 'slug',
          labelId: 'slug-label',
          descriptionId: 'slug-help',
          validationMessageId: 'slug-error',
        }}
        label="Slug"
        description="Lowercase characters"
        validation="error"
        validationMessage="Already taken"
        readOnly
      >
        <Input value="morfira" onChange={() => undefined} />
      </Field>,
    );

    expect(markup).toContain('readonly=""');
    expect(markup).toContain('data-readonly=""');
    expect(markup).not.toContain('disabled=""');
    expect(markup).toContain('aria-invalid="true"');
    expect(markup).toContain('aria-errormessage="slug-error"');
    expect(markup).toContain('aria-describedby="slug-help slug-error"');
    expect(markup).toContain('data-message-kind="error"');
  });
});
