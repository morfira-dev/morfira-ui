import { describe, expect, it } from 'vitest';
import { enhanceCheckbox } from '../src/checkbox.js';

class FakeInput extends EventTarget {
  attributes = new Map<string, string>();
  checked = false;
  indeterminate = false;
  disabled = false;
  required = false;
  type = 'text';
  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }
  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
  removeAttribute(name: string) {
    this.attributes.delete(name);
  }
  toggleAttribute(name: string, force?: boolean) {
    if (force) this.setAttribute(name, '');
    else this.removeAttribute(name);
    return !!force;
  }
}

describe('enhanceCheckbox', () => {
  it('applies checked, mixed, required, and size state', () => {
    const input = new FakeInput();
    const controller = enhanceCheckbox(input as unknown as HTMLInputElement, {
      checked: true,
      indeterminate: true,
      required: true,
      size: 'lg',
    });
    expect(input).toMatchObject({
      type: 'checkbox',
      checked: true,
      indeterminate: true,
      required: true,
    });
    expect(input.getAttribute('aria-checked')).toBe('mixed');
    expect(input.getAttribute('data-size')).toBe('lg');
    controller.update({});
    expect(input.indeterminate).toBe(false);
    expect(input.getAttribute('aria-checked')).toBeNull();
  });

  it('restores attributes and properties once', () => {
    const input = new FakeInput();
    input.checked = true;
    input.setAttribute('data-size', 'consumer');
    const controller = enhanceCheckbox(input as unknown as HTMLInputElement, {});
    controller.destroy();
    controller.destroy();
    controller.update({ checked: false });
    expect(input.checked).toBe(true);
    expect(input.getAttribute('data-size')).toBe('consumer');
  });
});
