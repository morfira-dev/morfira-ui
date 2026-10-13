import { describe, expect, it, vi } from 'vitest';

import { enhanceDrawer } from '../src/drawer.js';

class FakeDocument extends EventTarget {
  readonly documentElement = { style: { overflow: 'clip' } };
  activeElement: FakeElement | null = null;
}

class FakeElement extends EventTarget {
  readonly attributes = new Map<string, string>();
  readonly ownerDocument: FakeDocument;
  isConnected = true;
  focused = 0;

  constructor(ownerDocument: FakeDocument) {
    super();
    this.ownerDocument = ownerDocument;
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
  matches(selector: string): boolean {
    return selector === ':disabled,[hidden]'
      ? this.attributes.has('disabled') || this.attributes.has('hidden')
      : false;
  }
  closest(): FakeElement | null {
    return this.attributes.has('inert') ? this : null;
  }
  focus(): void {
    this.focused += 1;
    this.ownerDocument.activeElement = this;
  }
}

class FakeDialog extends FakeElement {
  open = false;
  showCalls = 0;
  showModalCalls = 0;
  closeCalls = 0;
  readonly candidates: FakeElement[] = [];

  show(): void {
    this.showCalls += 1;
    this.open = true;
    this.setAttribute('open', '');
  }
  showModal(): void {
    this.showModalCalls += 1;
    this.open = true;
    this.setAttribute('open', '');
  }
  close(): void {
    this.closeCalls += 1;
    this.open = false;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  }
  contains(target: Node | null): boolean {
    return this.candidates.includes(target as unknown as FakeElement);
  }
  querySelectorAll<T extends Element = Element>(selector: string): NodeListOf<T> {
    const candidates = this.candidates.filter((candidate) => {
      if (selector === '[data-morfira-drawer-initial-focus]') {
        return candidate.attributes.has('data-morfira-drawer-initial-focus');
      }
      if (selector === '[autofocus]') return candidate.attributes.has('autofocus');
      return true;
    });
    return candidates as unknown as NodeListOf<T>;
  }
}

class FakeKeyboardEvent extends Event {
  readonly key: string;
  constructor(key: string) {
    super('keydown', { cancelable: true });
    this.key = key;
  }
}

class FakePointerEvent extends Event {
  readonly button: number;
  readonly isPrimary: boolean;
  constructor(type: string, button = 0, isPrimary = true) {
    super(type);
    this.button = button;
    this.isPrimary = isPrimary;
  }
}

const asDrawer = (drawer: FakeDialog) => drawer as unknown as HTMLDialogElement;
const asElement = (element: FakeElement) => element as unknown as HTMLElement;
const ids = { titleId: 'drawer-title', descriptionId: 'drawer-description' };

describe('enhanceDrawer', () => {
  it('opens modal, focuses content, locks scroll, and restores focus', () => {
    const document = new FakeDocument();
    const opener = new FakeElement(document);
    const initial = new FakeElement(document);
    const drawer = new FakeDialog(document);
    drawer.candidates.push(initial);
    document.activeElement = opener;
    const controller = enhanceDrawer(asDrawer(drawer), {
      ids,
      open: true,
      initialFocus: asElement(initial),
    });

    expect(drawer.showModalCalls).toBe(1);
    expect(drawer.showCalls).toBe(0);
    expect(initial.focused).toBe(1);
    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(drawer.getAttribute('aria-modal')).toBe('true');
    controller.update({ ids, open: false });
    expect(opener.focused).toBe(1);
    expect(document.documentElement.style.overflow).toBe('clip');
  });

  it('keeps non-modal documents operable and handles Escape itself', () => {
    const document = new FakeDocument();
    const drawer = new FakeDialog(document);
    const onDismiss = vi.fn();
    enhanceDrawer(asDrawer(drawer), {
      ids,
      open: true,
      modal: false,
      onDismiss,
    });

    expect(drawer.showCalls).toBe(1);
    expect(drawer.getAttribute('aria-modal')).toBeNull();
    expect(document.documentElement.style.overflow).toBe('clip');
    document.dispatchEvent(new FakeKeyboardEvent('Escape'));
    expect(onDismiss).toHaveBeenCalledWith('escape');
    expect(drawer.open).toBe(true);
  });

  it('reopens the native dialog when switching mode without restoring focus', () => {
    const document = new FakeDocument();
    const opener = new FakeElement(document);
    const drawer = new FakeDialog(document);
    document.activeElement = opener;
    const controller = enhanceDrawer(asDrawer(drawer), {
      ids,
      open: true,
      modal: false,
    });
    controller.update({ ids, open: true, modal: true });

    expect(drawer.closeCalls).toBe(1);
    expect(drawer.showCalls).toBe(1);
    expect(drawer.showModalCalls).toBe(1);
    expect(opener.focused).toBe(0);
    expect(document.documentElement.style.overflow).toBe('hidden');
  });

  it('requests conservative backdrop and close-button dismissal', () => {
    const document = new FakeDocument();
    const drawer = new FakeDialog(document);
    const onDismiss = vi.fn();
    const controller = enhanceDrawer(asDrawer(drawer), {
      ids,
      open: true,
      closeOnBackdrop: true,
      onDismiss,
    });
    drawer.dispatchEvent(new FakePointerEvent('pointerdown'));
    drawer.dispatchEvent(new FakePointerEvent('pointerup'));
    controller.requestClose('close-button');
    expect(onDismiss.mock.calls).toEqual([['backdrop'], ['close-button']]);
  });

  it('tears down idempotently and restores managed attributes', () => {
    const document = new FakeDocument();
    const drawer = new FakeDialog(document);
    const onDismiss = vi.fn();
    drawer.setAttribute('data-size', 'consumer');
    const controller = enhanceDrawer(asDrawer(drawer), {
      ids,
      open: true,
      onDismiss,
    });
    controller.destroy();
    controller.destroy();
    document.dispatchEvent(new FakeKeyboardEvent('Escape'));
    expect(onDismiss).not.toHaveBeenCalled();
    expect(drawer.getAttribute('data-size')).toBe('consumer');
    expect(drawer.getAttribute('data-morfira-drawer')).toBeNull();
    expect(document.documentElement.style.overflow).toBe('clip');
  });

  it('lets only the topmost non-modal drawer consume Escape', () => {
    const document = new FakeDocument();
    const lower = new FakeDialog(document);
    const upper = new FakeDialog(document);
    const lowerDismiss = vi.fn();
    const upperDismiss = vi.fn();
    enhanceDrawer(asDrawer(lower), {
      ids: { titleId: 'lower-title' },
      open: true,
      modal: false,
      onDismiss: lowerDismiss,
    });
    const upperController = enhanceDrawer(asDrawer(upper), {
      ids: { titleId: 'upper-title' },
      open: true,
      modal: false,
      onDismiss: upperDismiss,
    });

    document.dispatchEvent(new FakeKeyboardEvent('Escape'));
    expect(lowerDismiss).not.toHaveBeenCalled();
    expect(upperDismiss).toHaveBeenCalledWith('escape');

    upperController.update({
      ids: { titleId: 'upper-title' },
      open: false,
      modal: false,
    });
    document.dispatchEvent(new FakeKeyboardEvent('Escape'));
    expect(lowerDismiss).toHaveBeenCalledWith('escape');
  });
});
