import { describe, expect, it } from 'vitest';
import { enhanceTextarea } from '../src/textarea.js';

class FakeTextarea extends EventTarget {
  attributes = new Map<string, string>();
  disabled = false;
  readOnly = false;
  required = false;
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

describe('enhanceTextarea', () => {
  it('applies editable state and clears invalid state on update', () => {
    const textarea = new FakeTextarea();
    const controller = enhanceTextarea(textarea as unknown as HTMLTextAreaElement, {
      validation: 'error',
      readOnly: true,
      resize: 'none',
    });
    expect(textarea.readOnly).toBe(true);
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
    expect(textarea.getAttribute('data-resize')).toBe('none');
    controller.update({ validation: 'success' });
    expect(textarea.getAttribute('aria-invalid')).toBeNull();
  });

  it('restores owned attributes idempotently', () => {
    const textarea = new FakeTextarea();
    textarea.setAttribute('readonly', 'consumer');
    const controller = enhanceTextarea(textarea as unknown as HTMLTextAreaElement, {
      disabled: true,
    });
    controller.destroy();
    controller.destroy();
    controller.update({ validation: 'error' });
    expect(textarea.getAttribute('readonly')).toBe('consumer');
    expect(textarea.getAttribute('data-morfira-textarea')).toBeNull();
  });
});
