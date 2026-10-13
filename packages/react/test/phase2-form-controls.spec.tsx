import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Checkbox } from '../src/checkbox/index.js';
import { Field } from '../src/field/index.js';
import { Radio } from '../src/radio/index.js';
import { Select } from '../src/select/index.js';
import { Switch } from '../src/switch/index.js';
import { Textarea } from '../src/textarea/index.js';

describe('React Phase 2 native form controls', () => {
  it('preserves native checkbox, radio, and switch form attributes', () => {
    const markup = renderToStaticMarkup(
      <form>
        <Checkbox name="accepted" value="yes" defaultChecked indeterminate size="sm" />
        <Radio name="tier" value="pro" defaultChecked size="lg" />
        <Switch name="alerts" value="enabled" checked onChange={() => undefined} />
      </form>,
    );

    expect(markup).toContain('type="checkbox"');
    expect(markup).toContain('name="accepted"');
    expect(markup).toContain('data-morfira-checkbox=""');
    expect(markup).toContain('data-indeterminate=""');
    expect(markup).toContain('aria-checked="mixed"');
    expect(markup).toContain('type="radio"');
    expect(markup).toContain('data-morfira-radio=""');
    expect(markup).toContain('role="switch"');
    expect(markup).toContain('aria-checked="true"');
  });

  it('connects textarea to Field without replacing native value behavior', () => {
    const markup = renderToStaticMarkup(
      <Field
        ids={{ inputId: 'notes', labelId: 'notes-label', descriptionId: 'notes-help' }}
        label="Notes"
        description="Add context"
        validation="error"
        validationMessage="Notes are required"
        required
      >
        <Textarea name="notes" defaultValue="Draft" rows={4} resize="both" />
      </Field>,
    );

    expect(markup).toContain('<textarea');
    expect(markup).toContain('id="notes"');
    expect(markup).toContain('aria-labelledby="notes-label"');
    expect(markup).toContain('aria-invalid="true"');
    expect(markup).toContain('data-resize="both"');
    expect(markup).toContain('rows="4"');
    expect(markup).toContain('Draft</textarea>');
  });

  it('renders a native multiple select with a distinct visual and row-count API', () => {
    const markup = renderToStaticMarkup(
      <Select name="regions" multiple size="lg" visibleRows={3.8} defaultValue={['eu']}>
        <option value="eu">Europe</option>
        <option value="us">United States</option>
      </Select>,
    );

    expect(markup).toContain('<select');
    expect(markup).toContain('multiple=""');
    expect(markup).toContain('size="3"');
    expect(markup).toContain('data-size="lg"');
    expect(markup).toContain('data-multiple=""');
    expect(markup).toContain('<option value="eu" selected="">');
  });
});
