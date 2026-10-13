import { describe, expect, it } from 'vitest';
import { enhanceSwitch } from '../src/switch.js';

class FakeInput extends EventTarget {
  attributes = new Map<string, string>();
  checked = false;
  disabled = false;
  required = false;
  type = 'text';
  form: FakeForm | null = null;
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

class FakeForm extends EventTarget {}

describe('enhanceSwitch', () => {
  it('exposes checkbox behavior with switch semantics', () => {
    const input = new FakeInput();
    const controller = enhanceSwitch(input as unknown as HTMLInputElement, {
      checked: true,
      size: 'lg',
    });
    expect(input.type).toBe('checkbox');
    expect(input.getAttribute('role')).toBe('switch');
    expect(input.getAttribute('data-checked')).toBe('');
    expect(input.getAttribute('aria-checked')).toBe('true');
    controller.update({});
    expect(input.getAttribute('data-checked')).toBeNull();
    expect(input.getAttribute('aria-checked')).toBe('false');
  });

  it('synchronizes public state after native user changes', () => {
    const input = new FakeInput();
    const controller = enhanceSwitch(input as unknown as HTMLInputElement);

    input.checked = true;
    input.dispatchEvent(new Event('change'));

    expect(controller.state.checked).toBe(true);
    expect(controller.state.ariaChecked).toBe('true');
    expect(input.getAttribute('data-checked')).toBe('');
    expect(input.getAttribute('aria-checked')).toBe('true');
  });

  it('synchronizes public state after a native form reset', async () => {
    const form = new FakeForm();
    const input = new FakeInput();
    input.form = form;
    const controller = enhanceSwitch(input as unknown as HTMLInputElement, {
      checked: true,
    });

    form.dispatchEvent(new Event('reset'));
    input.checked = false;
    await Promise.resolve();

    expect(controller.state.checked).toBe(false);
    expect(input.getAttribute('data-checked')).toBeNull();
    expect(input.getAttribute('aria-checked')).toBe('false');
  });

  it('stops synchronizing state after destroy', async () => {
    const form = new FakeForm();
    const input = new FakeInput();
    input.form = form;
    const controller = enhanceSwitch(input as unknown as HTMLInputElement);
    controller.destroy();

    input.checked = true;
    input.dispatchEvent(new Event('change'));
    form.dispatchEvent(new Event('reset'));
    await Promise.resolve();

    expect(controller.state.checked).toBe(false);
    expect(input.getAttribute('data-checked')).toBeNull();
    expect(input.getAttribute('aria-checked')).toBeNull();
  });

  it('restores native state and role on destroy', () => {
    const input = new FakeInput();
    input.checked = true;
    input.setAttribute('role', 'consumer');
    input.setAttribute('aria-checked', 'mixed');
    const controller = enhanceSwitch(input as unknown as HTMLInputElement, {});
    controller.destroy();
    controller.destroy();
    expect(input.checked).toBe(true);
    expect(input.getAttribute('role')).toBe('consumer');
    expect(input.getAttribute('aria-checked')).toBe('mixed');
  });
});
