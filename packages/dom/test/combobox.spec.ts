import { describe, expect, it, vi } from 'vitest';
import { enhanceCombobox, type ComboboxElements } from '../src/combobox.js';

class FakeElement extends EventTarget {
  readonly attributes = new Map<string, string>();
  readonly children = new Set<unknown>();
  value = '';
  disabled = false;
  readOnly = false;
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
  contains(target: unknown) {
    return target === this || this.children.has(target);
  }
}

const asElement = (element: FakeElement): HTMLElement =>
  element as unknown as HTMLElement;
const asInput = (element: FakeElement): HTMLInputElement =>
  element as unknown as HTMLInputElement;
const key = (value: string): KeyboardEvent => {
  const event = new Event('keydown', { cancelable: true });
  Object.defineProperty(event, 'key', { value });
  return event as KeyboardEvent;
};

const setup = () => {
  const root = new FakeElement();
  const input = new FakeElement();
  const listbox = new FakeElement();
  const first = new FakeElement();
  const disabled = new FakeElement();
  const last = new FakeElement();
  root.children.add(input);
  root.children.add(listbox);
  return {
    root,
    input,
    listbox,
    first,
    disabled,
    last,
    elements: {
      root: asElement(root),
      input: asInput(input),
      listbox: asElement(listbox),
      options: [asElement(first), asElement(disabled), asElement(last)],
    } satisfies ComboboxElements,
    options: [
      { id: 'one-option', value: 'one', label: 'One' },
      { id: 'two-option', value: 'two', label: 'Two', disabled: true },
      { id: 'three-option', value: 'three', label: 'Three' },
    ] as const,
  };
};

describe('enhanceCombobox', () => {
  it('owns the ARIA relationship while keeping DOM focus on the input', () => {
    const fixture = setup();
    const active = vi.fn();
    const opened = vi.fn();
    const controller = enhanceCombobox(fixture.elements, {
      inputId: 'search',
      listboxId: 'search-results',
      options: fixture.options,
      onActiveChange: active,
      onOpenChange: opened,
    });
    expect(fixture.input.getAttribute('role')).toBe('combobox');
    expect(fixture.input.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.listbox.hidden).toBe(true);

    fixture.input.dispatchEvent(key('ArrowDown'));
    expect(opened).toHaveBeenCalledWith(true, 'keyboard');
    expect(active).toHaveBeenCalledWith('one-option');
    controller.update({
      inputId: 'search',
      listboxId: 'search-results',
      options: fixture.options,
      open: true,
      activeId: 'one-option',
      onActiveChange: active,
      onOpenChange: opened,
    });
    expect(fixture.input.getAttribute('aria-activedescendant')).toBe('one-option');
    fixture.input.dispatchEvent(key('ArrowDown'));
    expect(active).toHaveBeenLastCalledWith('three-option');
    controller.destroy();
    expect(fixture.input.getAttribute('role')).toBeNull();
  });

  it('filters hidden options and commits keyboard and pointer selections once', () => {
    const fixture = setup();
    const values = vi.fn();
    const queries = vi.fn();
    const controller = enhanceCombobox(fixture.elements, {
      inputId: 'search',
      listboxId: 'search-results',
      options: fixture.options,
      query: 'thr',
      open: true,
      activeId: 'three-option',
      onValueChange: values,
      onQueryChange: queries,
    });
    expect(fixture.first.hidden).toBe(true);
    expect(fixture.last.hidden).toBe(false);
    const enter = key('Enter');
    fixture.input.dispatchEvent(enter);
    expect(enter.defaultPrevented).toBe(true);
    expect(values).toHaveBeenCalledWith('three', 'keyboard');
    expect(queries).toHaveBeenCalledWith('Three', 'selection');
    fixture.last.dispatchEvent(new Event('click'));
    expect(values).toHaveBeenLastCalledWith('three', 'pointer');
    controller.destroy();
  });

  it('requests query changes and lets Tab continue document navigation', () => {
    const fixture = setup();
    const queries = vi.fn();
    const opened = vi.fn();
    const controller = enhanceCombobox(fixture.elements, {
      inputId: 'search',
      listboxId: 'search-results',
      options: fixture.options,
      open: true,
      onQueryChange: queries,
      onOpenChange: opened,
    });
    fixture.input.value = 'new';
    fixture.input.dispatchEvent(new Event('input'));
    expect(queries).toHaveBeenCalledWith('new', 'input');
    const tab = key('Tab');
    fixture.input.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(false);
    expect(opened).toHaveBeenCalledWith(false, 'tab');
    controller.destroy();
  });
});
