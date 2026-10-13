import { describe, expect, it, vi } from 'vitest';

import { enhanceDropdown } from '../src/dropdown.js';
import { enhanceMenu } from '../src/menu.js';

class FakeDocument extends EventTarget {
  readonly defaultView = undefined;
}

class FakeElement extends EventTarget {
  readonly attributes = new Map<string, string>();
  readonly ownerDocument: FakeDocument;
  readonly style = { setProperty: vi.fn() };
  focused = false;
  isConnected = true;
  constructor(document = new FakeDocument()) {
    super();
    this.ownerDocument = document;
  }
  get id() {
    return this.getAttribute('id') ?? '';
  }
  set id(value: string) {
    this.setAttribute('id', value);
  }
  get hidden() {
    return this.attributes.has('hidden');
  }
  set hidden(value: boolean) {
    if (value) this.setAttribute('hidden', '');
    else this.removeAttribute('hidden');
  }
  get tabIndex() {
    return Number(this.getAttribute('tabindex') ?? '0');
  }
  set tabIndex(value: number) {
    this.setAttribute('tabindex', String(value));
  }
  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }
  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
  removeAttribute(name: string) {
    this.attributes.delete(name);
  }
  focus() {
    this.focused = true;
    this.dispatchEvent(new Event('focus'));
  }
  contains(value: unknown) {
    return value === this;
  }
  getBoundingClientRect() {
    return { left: 10, right: 30, top: 20, bottom: 40, width: 20, height: 20 };
  }
}

const asElement = (element: FakeElement): HTMLElement =>
  element as unknown as HTMLElement;
const key = (value: string): KeyboardEvent => {
  const event = new Event('keydown', { cancelable: true });
  Object.defineProperties(event, {
    key: { value },
    altKey: { value: false },
    ctrlKey: { value: false },
    metaKey: { value: false },
  });
  return event as KeyboardEvent;
};

describe('Menu and Dropdown DOM controllers', () => {
  it('applies roving focus, skips disabled entries, and supports typeahead', () => {
    vi.useFakeTimers();
    const root = new FakeElement();
    const first = new FakeElement(root.ownerDocument);
    const disabled = new FakeElement(root.ownerDocument);
    const third = new FakeElement(root.ownerDocument);
    const selected = vi.fn();
    const menu = enhanceMenu(asElement(root), [first, disabled, third].map(asElement), {
      items: [
        { id: 'archive', textValue: 'Archive' },
        { id: 'delete', textValue: 'Delete', disabled: true },
        { id: 'assign', textValue: 'Assign' },
      ],
      onSelect: selected,
    });
    expect(root.getAttribute('role')).toBe('menu');
    expect(disabled.getAttribute('aria-disabled')).toBe('true');
    root.dispatchEvent(key('ArrowDown'));
    expect(third.focused).toBe(true);
    root.dispatchEvent(key('a'));
    expect(first.focused).toBe(true);
    first.dispatchEvent(new Event('click'));
    expect(selected).toHaveBeenCalledWith('archive');
    menu.destroy();
    expect(root.getAttribute('role')).toBeNull();
    vi.useRealTimers();
  });

  it('connects trigger state, keyboard entry, dismissal, and focus restoration', () => {
    const document = new FakeDocument();
    const trigger = new FakeElement(document);
    const content = new FakeElement(document);
    const root = new FakeElement(document);
    const first = new FakeElement(document);
    const menu = enhanceMenu(asElement(root), [asElement(first)], {
      items: [{ id: 'deploy', textValue: 'Deploy' }],
    });
    const changes = vi.fn();
    const dropdown = enhanceDropdown(asElement(trigger), asElement(content), menu, {
      contentId: 'release-actions',
      onOpenChange: changes,
    });
    trigger.dispatchEvent(key('ArrowDown'));
    expect(changes).toHaveBeenCalledWith(true, 'arrow-first');
    dropdown.update({
      contentId: 'release-actions',
      open: true,
      onOpenChange: changes,
    });
    expect(first.focused).toBe(true);
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    document.dispatchEvent(key('Escape'));
    expect(changes).toHaveBeenLastCalledWith(false, 'escape');
    dropdown.update({
      contentId: 'release-actions',
      open: false,
      onOpenChange: changes,
    });
    expect(trigger.focused).toBe(true);
    dropdown.destroy();
    menu.destroy();
    expect(trigger.getAttribute('aria-controls')).toBeNull();
  });
});
