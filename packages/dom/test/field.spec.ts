import { describe, expect, it } from 'vitest';

import { enhanceField, type FieldElements } from '../src/field.js';

class FakeElement extends EventTarget {
  readonly attributes = new Map<string, string>();

  get id(): string {
    return this.getAttribute('id') ?? '';
  }

  set id(value: string) {
    this.setAttribute('id', value);
  }

  get htmlFor(): string {
    return this.getAttribute('for') ?? '';
  }

  set htmlFor(value: string) {
    this.setAttribute('for', value);
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name);
  }
}

function createElements(): {
  readonly fake: {
    readonly root: FakeElement;
    readonly input: FakeElement;
    readonly label: FakeElement;
    readonly description: FakeElement;
    readonly validationMessage: FakeElement;
  };
  readonly native: FieldElements;
} {
  const fake = {
    root: new FakeElement(),
    input: new FakeElement(),
    label: new FakeElement(),
    description: new FakeElement(),
    validationMessage: new FakeElement(),
  };

  return {
    fake,
    native: fake as unknown as FieldElements,
  };
}

const fieldIds = {
  inputId: 'server-name',
  labelId: 'server-name-label',
  descriptionId: 'server-name-description',
  validationMessageId: 'server-name-validation',
} as const;

describe('enhanceField', () => {
  it('requires elements and their explicit IDs together', () => {
    const { native } = createElements();

    expect(() =>
      enhanceField(native, {
        ids: { inputId: 'input', labelId: 'label' },
      }),
    ).toThrow(/description element and descriptionId/);
  });

  it('creates deterministic native and ARIA associations', () => {
    const { fake, native } = createElements();
    enhanceField(native, { ids: fieldIds, validation: 'error' });

    expect(fake.root.getAttribute('data-morfira-field')).toBe('');
    expect(fake.root.getAttribute('data-size')).toBe('md');
    expect(fake.root.getAttribute('data-validation')).toBe('error');
    expect(fake.input.id).toBe('server-name');
    expect(fake.input.getAttribute('aria-labelledby')).toBe('server-name-label');
    expect(fake.input.getAttribute('aria-describedby')).toBe(
      'server-name-description server-name-validation',
    );
    expect(fake.input.getAttribute('aria-errormessage')).toBe('server-name-validation');
    expect(fake.input.getAttribute('aria-invalid')).toBe('true');
    expect(fake.label.id).toBe('server-name-label');
    expect(fake.label.htmlFor).toBe('server-name');
    expect(fake.description.id).toBe('server-name-description');
    expect(fake.description.getAttribute('data-morfira-field-message')).toBe('');
    expect(fake.description.getAttribute('data-message-kind')).toBe('helper');
    expect(fake.validationMessage.id).toBe('server-name-validation');
    expect(fake.validationMessage.getAttribute('data-morfira-field-message')).toBe('');
    expect(fake.validationMessage.getAttribute('data-message-kind')).toBe('error');
  });

  it('updates distinct disabled and read-only states without stale errors', () => {
    const { fake, native } = createElements();
    const controller = enhanceField(native, {
      ids: fieldIds,
      disabled: true,
      validation: 'error',
    });

    expect(fake.root.getAttribute('data-disabled')).toBe('');
    expect(fake.root.getAttribute('data-readonly')).toBeNull();

    controller.update({
      ids: fieldIds,
      readOnly: true,
      validation: 'warning',
    });

    expect(fake.root.getAttribute('data-disabled')).toBeNull();
    expect(fake.root.getAttribute('data-readonly')).toBe('');
    expect(fake.input.getAttribute('disabled')).toBeNull();
    expect(fake.input.getAttribute('readonly')).toBe('');
    expect(fake.input.getAttribute('aria-invalid')).toBeNull();
    expect(fake.input.getAttribute('aria-errormessage')).toBeNull();
    expect(fake.input.getAttribute('aria-describedby')).toBe(
      'server-name-description server-name-validation',
    );
    expect(fake.validationMessage.getAttribute('data-message-kind')).toBe('warning');
  });

  it('restores every owned attribute on idempotent destroy', () => {
    const { fake, native } = createElements();
    fake.root.setAttribute('data-size', 'consumer-size');
    fake.input.setAttribute('id', 'consumer-input');
    fake.label.setAttribute('for', 'consumer-input');
    fake.description.setAttribute('id', 'consumer-description');
    const controller = enhanceField(native, {
      ids: fieldIds,
      validation: 'success',
    });

    controller.destroy();
    controller.destroy();
    controller.update({ ids: fieldIds, validation: 'error' });

    expect(fake.root.getAttribute('data-morfira-field')).toBeNull();
    expect(fake.root.getAttribute('data-size')).toBe('consumer-size');
    expect(fake.input.id).toBe('consumer-input');
    expect(fake.input.getAttribute('data-morfira-input')).toBeNull();
    expect(fake.input.getAttribute('aria-labelledby')).toBeNull();
    expect(fake.label.htmlFor).toBe('consumer-input');
    expect(fake.description.id).toBe('consumer-description');
    expect(fake.description.getAttribute('data-morfira-field-message')).toBeNull();
    expect(fake.validationMessage.getAttribute('id')).toBeNull();
    expect(
      fake.validationMessage.getAttribute('data-morfira-field-message'),
    ).toBeNull();
    expect(fake.validationMessage.getAttribute('data-message-kind')).toBeNull();
  });
});
