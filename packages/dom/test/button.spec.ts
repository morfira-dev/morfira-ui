import { describe, expect, it, vi } from 'vitest';

import { enhanceButton } from '../src/button.js';

class FakeButton extends EventTarget {
  readonly attributes = new Map<string, string>();

  get type(): string {
    return this.getAttribute('type') ?? 'submit';
  }

  set type(value: string) {
    this.setAttribute('type', value);
  }

  get disabled(): boolean {
    return this.attributes.has('disabled');
  }

  set disabled(value: boolean) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
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

const asNativeButton = (button: FakeButton): HTMLButtonElement =>
  button as unknown as HTMLButtonElement;

describe('enhanceButton', () => {
  it('applies safe defaults and public state attributes', () => {
    const button = new FakeButton();

    const controller = enhanceButton(asNativeButton(button));

    expect(controller.state.interactive).toBe(true);
    expect(button.type).toBe('button');
    expect(button.disabled).toBe(false);
    expect(button.getAttribute('data-morfira-button')).toBe('');
    expect(button.getAttribute('data-variant')).toBe('primary');
    expect(button.getAttribute('data-size')).toBe('md');
    expect(button.getAttribute('data-loading')).toBeNull();
    expect(button.getAttribute('aria-busy')).toBeNull();
  });

  it('blocks repeated activation while loading and resumes after update', () => {
    const button = new FakeButton();
    const controller = enhanceButton(asNativeButton(button), { loading: true });
    const activate = vi.fn();
    button.addEventListener('click', activate);

    const blocked = button.dispatchEvent(new Event('click', { cancelable: true }));

    expect(blocked).toBe(false);
    expect(activate).not.toHaveBeenCalled();
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('data-loading')).toBe('');
    expect(button.getAttribute('aria-busy')).toBe('true');

    controller.update({ variant: 'danger', size: 'lg' });
    const accepted = button.dispatchEvent(new Event('click', { cancelable: true }));

    expect(accepted).toBe(true);
    expect(activate).toHaveBeenCalledOnce();
    expect(button.disabled).toBe(false);
    expect(button.getAttribute('data-variant')).toBe('danger');
    expect(button.getAttribute('data-size')).toBe('lg');
    expect(button.getAttribute('aria-busy')).toBeNull();
  });

  it('restores owned attributes and removes its listener on idempotent destroy', () => {
    const button = new FakeButton();
    button.setAttribute('type', 'submit');
    button.setAttribute('data-variant', 'consumer-value');
    button.setAttribute('aria-busy', 'mixed');
    const controller = enhanceButton(asNativeButton(button), {
      disabled: true,
      variant: 'secondary',
    });
    const activate = vi.fn();
    button.addEventListener('click', activate);

    controller.destroy();
    controller.destroy();
    controller.update({ loading: true });
    const accepted = button.dispatchEvent(new Event('click', { cancelable: true }));

    expect(accepted).toBe(true);
    expect(activate).toHaveBeenCalledOnce();
    expect(button.type).toBe('submit');
    expect(button.disabled).toBe(false);
    expect(button.getAttribute('data-variant')).toBe('consumer-value');
    expect(button.getAttribute('data-morfira-button')).toBeNull();
    expect(button.getAttribute('data-size')).toBeNull();
    expect(button.getAttribute('aria-busy')).toBe('mixed');
    expect(button.getAttribute('data-loading')).toBeNull();
  });
});
