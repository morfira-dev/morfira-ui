import { describe, expect, it } from 'vitest';
import { enhanceRadio } from '../src/radio.js';

class FakeInput extends EventTarget {
  attributes = new Map<string, string>();
  checked = false;
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
}

describe('enhanceRadio', () => {
  it('applies native radio state and public hooks', () => {
    const input = new FakeInput();
    const controller = enhanceRadio(input as unknown as HTMLInputElement, {
      checked: true,
      disabled: true,
      required: true,
      size: 'sm',
    });
    expect(input).toMatchObject({
      type: 'radio',
      checked: true,
      disabled: true,
      required: true,
    });
    expect(input.getAttribute('data-morfira-radio')).toBe('');
    controller.update({ checked: false });
    expect(input.checked).toBe(false);
  });

  it('restores checked and owned attributes', () => {
    const input = new FakeInput();
    input.checked = true;
    input.setAttribute('type', 'consumer');
    const controller = enhanceRadio(input as unknown as HTMLInputElement, {});
    controller.destroy();
    controller.destroy();
    expect(input.checked).toBe(true);
    expect(input.getAttribute('type')).toBe('consumer');
  });
});
