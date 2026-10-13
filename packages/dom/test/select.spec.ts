import { describe, expect, it } from 'vitest';
import { enhanceSelect } from '../src/select.js';

class FakeSelect extends EventTarget {
  attributes = new Map<string, string>();
  disabled = false;
  required = false;
  multiple = false;
  size = 0;
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

describe('enhanceSelect', () => {
  it('applies multiple, required, disabled, size, and validation state', () => {
    const select = new FakeSelect();
    const controller = enhanceSelect(select as unknown as HTMLSelectElement, {
      multiple: true,
      required: true,
      disabled: true,
      size: 'lg',
      visibleRows: 4,
      validation: 'error',
    });
    expect(select).toMatchObject({
      multiple: true,
      required: true,
      disabled: true,
      size: 4,
    });
    expect(select.getAttribute('aria-invalid')).toBe('true');
    expect(select.getAttribute('data-multiple')).toBe('');
    controller.update({});
    expect(select.multiple).toBe(false);
    expect(select.getAttribute('aria-invalid')).toBeNull();
  });

  it('restores owned attributes idempotently', () => {
    const select = new FakeSelect();
    select.setAttribute('multiple', 'consumer');
    const controller = enhanceSelect(select as unknown as HTMLSelectElement, {});
    controller.destroy();
    controller.destroy();
    controller.update({ validation: 'error' });
    expect(select.getAttribute('multiple')).toBe('consumer');
    expect(select.getAttribute('data-morfira-select')).toBeNull();
  });
});
