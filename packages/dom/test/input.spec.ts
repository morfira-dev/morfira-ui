import { describe, expect, it } from 'vitest';

import { enhanceInput } from '../src/input.js';

class FakeInput extends EventTarget {
  readonly attributes = new Map<string, string>();

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

const asNativeInput = (input: FakeInput): HTMLInputElement =>
  input as unknown as HTMLInputElement;

describe('enhanceInput', () => {
  it('applies public hooks while preserving native semantics', () => {
    const input = new FakeInput();
    const controller = enhanceInput(asNativeInput(input), {
      size: 'lg',
      validation: 'warning',
      readOnly: true,
      required: true,
    });

    expect(controller.state.focusable).toBe(true);
    expect(controller.state.editable).toBe(false);
    expect(input.getAttribute('data-morfira-input')).toBe('');
    expect(input.getAttribute('data-size')).toBe('lg');
    expect(input.getAttribute('data-validation')).toBe('warning');
    expect(input.getAttribute('readonly')).toBe('');
    expect(input.getAttribute('required')).toBe('');
    expect(input.getAttribute('disabled')).toBeNull();
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('sets aria-invalid only for error and clears it on update', () => {
    const input = new FakeInput();
    const controller = enhanceInput(asNativeInput(input), {
      validation: 'error',
    });

    expect(input.getAttribute('aria-invalid')).toBe('true');

    controller.update({ validation: 'success' });

    expect(input.getAttribute('aria-invalid')).toBeNull();
    expect(input.getAttribute('data-validation')).toBe('success');
  });

  it('restores owned attributes on idempotent destroy', () => {
    const input = new FakeInput();
    input.setAttribute('readonly', '');
    input.setAttribute('data-size', 'consumer-size');
    const controller = enhanceInput(asNativeInput(input), { disabled: true });

    controller.destroy();
    controller.destroy();
    controller.update({ validation: 'error' });

    expect(input.getAttribute('readonly')).toBe('');
    expect(input.getAttribute('disabled')).toBeNull();
    expect(input.getAttribute('data-size')).toBe('consumer-size');
    expect(input.getAttribute('data-morfira-input')).toBeNull();
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });
});
