import { describe, expect, it, vi } from 'vitest';

import { enhanceDialog } from '../src/dialog.js';

class FakeDocument {
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
    if (selector === ':disabled,[hidden]') {
      return this.attributes.has('disabled') || this.attributes.has('hidden');
    }

    return false;
  }

  closest(selector: string): FakeElement | null {
    return selector === '[inert]' && this.attributes.has('inert') ? this : null;
  }

  focus(): void {
    this.focused += 1;
    this.ownerDocument.activeElement = this;
  }
}

class FakeDialog extends FakeElement {
  open = false;
  showModalCalls = 0;
  closeCalls = 0;
  readonly candidates: FakeElement[] = [];

  showModal(): void {
    this.showModalCalls += 1;
    this.open = true;
  }

  close(): void {
    this.closeCalls += 1;
    this.open = false;
    this.dispatchEvent(new Event('close'));
  }

  contains(target: Node | null): boolean {
    return (
      target === (this as unknown as Node) ||
      this.candidates.includes(target as unknown as FakeElement)
    );
  }

  querySelectorAll<T extends Element = Element>(selector: string): NodeListOf<T> {
    const matches = this.candidates.filter((candidate) => {
      if (selector === '[data-morfira-dialog-initial-focus]') {
        return candidate.attributes.has('data-morfira-dialog-initial-focus');
      }
      if (selector === '[autofocus]') {
        return candidate.attributes.has('autofocus');
      }

      return true;
    });

    return matches as unknown as NodeListOf<T>;
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

const asElement = (element: FakeElement): HTMLElement =>
  element as unknown as HTMLElement;
const asDialog = (dialog: FakeDialog): HTMLDialogElement =>
  dialog as unknown as HTMLDialogElement;

const ids = { titleId: 'dialog-title', descriptionId: 'dialog-description' } as const;

describe('enhanceDialog', () => {
  it('applies the public modal contract and opens only once across repeated updates', () => {
    const document = new FakeDocument();
    const dialog = new FakeDialog(document);
    const initialFocus = new FakeElement(document);
    dialog.candidates.push(initialFocus);

    const controller = enhanceDialog(asDialog(dialog), {
      ids,
      open: true,
      size: 'lg',
      initialFocus: asElement(initialFocus),
    });

    controller.update({
      ids,
      open: true,
      size: 'sm',
      initialFocus: asElement(initialFocus),
    });

    expect(dialog.showModalCalls).toBe(1);
    expect(initialFocus.focused).toBe(1);
    expect(dialog.getAttribute('data-morfira-dialog')).toBe('');
    expect(dialog.getAttribute('data-state')).toBe('open');
    expect(dialog.getAttribute('data-size')).toBe('sm');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBe('dialog-title');
    expect(dialog.getAttribute('aria-describedby')).toBe('dialog-description');
    expect(dialog.getAttribute('tabindex')).toBe('-1');
    expect(document.documentElement.style.overflow).toBe('hidden');
  });

  it('requests controlled dismissal for escape, backdrop, and close button', () => {
    const document = new FakeDocument();
    const dialog = new FakeDialog(document);
    const onDismiss = vi.fn();
    const controller = enhanceDialog(asDialog(dialog), {
      ids,
      open: true,
      closeOnBackdrop: true,
      onDismiss,
    });

    const cancel = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel);
    dialog.dispatchEvent(new FakePointerEvent('pointerdown'));
    dialog.dispatchEvent(new FakePointerEvent('pointerup'));
    controller.requestClose('close-button');

    expect(cancel.defaultPrevented).toBe(true);
    expect(onDismiss.mock.calls).toEqual([['escape'], ['backdrop'], ['close-button']]);
    expect(dialog.open).toBe(true);
  });

  it('keeps conservative dismissal disabled and requires a primary backdrop gesture', () => {
    const document = new FakeDocument();
    const dialog = new FakeDialog(document);
    const onDismiss = vi.fn();
    enhanceDialog(asDialog(dialog), {
      ids,
      open: true,
      closeOnEscape: false,
      closeOnBackdrop: true,
      onDismiss,
    });

    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    dialog.dispatchEvent(new FakePointerEvent('pointerdown', 1));
    dialog.dispatchEvent(new FakePointerEvent('pointerup'));

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('uses focus fallbacks and restores an explicit return target on close', () => {
    const document = new FakeDocument();
    const dialog = new FakeDialog(document);
    const opener = new FakeElement(document);
    const invalidInitial = new FakeElement(document);
    const fallback = new FakeElement(document);
    const returnFocus = new FakeElement(document);
    invalidInitial.setAttribute('disabled', '');
    fallback.setAttribute('data-morfira-dialog-initial-focus', '');
    dialog.candidates.push(invalidInitial, fallback);
    document.activeElement = opener;

    const controller = enhanceDialog(asDialog(dialog), {
      ids,
      open: true,
      initialFocus: asElement(invalidInitial),
      returnFocus: asElement(returnFocus),
    });

    expect(fallback.focused).toBe(1);

    controller.update({
      ids,
      open: false,
      returnFocus: asElement(returnFocus),
    });

    expect(returnFocus.focused).toBe(1);
    expect(opener.focused).toBe(0);
    expect(dialog.getAttribute('data-state')).toBe('closed');
    expect(document.documentElement.style.overflow).toBe('clip');
  });

  it('reference-counts scroll locks for nested dialogs', () => {
    const document = new FakeDocument();
    const outer = new FakeDialog(document);
    const inner = new FakeDialog(document);
    const outerController = enhanceDialog(asDialog(outer), { ids, open: true });
    const innerController = enhanceDialog(asDialog(inner), {
      ids: { titleId: 'inner-title' },
      open: true,
    });

    expect(document.documentElement.style.overflow).toBe('hidden');

    innerController.update({ ids: { titleId: 'inner-title' }, open: false });
    expect(document.documentElement.style.overflow).toBe('hidden');

    outerController.update({ ids, open: false });
    expect(document.documentElement.style.overflow).toBe('clip');
  });

  it('keeps the shared scroll lock when nested dialogs tear down out of order', () => {
    const document = new FakeDocument();
    const outer = new FakeDialog(document);
    const inner = new FakeDialog(document);
    const outerController = enhanceDialog(asDialog(outer), { ids, open: true });
    const innerController = enhanceDialog(asDialog(inner), {
      ids: { titleId: 'inner-title' },
      open: true,
    });

    outerController.destroy();
    outerController.destroy();

    expect(outer.open).toBe(false);
    expect(inner.open).toBe(true);
    expect(document.documentElement.style.overflow).toBe('hidden');

    innerController.destroy();

    expect(document.documentElement.style.overflow).toBe('clip');
  });

  it('reconciles rapid close and reopen updates without duplicating lifecycle effects', () => {
    const document = new FakeDocument();
    const dialog = new FakeDialog(document);
    const opener = new FakeElement(document);
    const dialogControl = new FakeElement(document);
    dialog.candidates.push(dialogControl);
    document.activeElement = opener;
    const controller = enhanceDialog(asDialog(dialog), { ids, open: true });

    controller.update({ ids, open: false });
    controller.update({ ids, open: true });
    controller.update({ ids, open: true, size: 'lg' });
    controller.update({ ids, open: false });

    expect(dialog.showModalCalls).toBe(2);
    expect(dialog.closeCalls).toBe(2);
    expect(opener.focused).toBe(2);
    expect(dialogControl.focused).toBe(2);
    expect(dialog.getAttribute('data-state')).toBe('closed');
    expect(document.documentElement.style.overflow).toBe('clip');
  });

  it('uses the latest callbacks and policies after an interrupted open lifecycle', () => {
    const document = new FakeDocument();
    const dialog = new FakeDialog(document);
    const previousDismiss = vi.fn();
    const currentDismiss = vi.fn();
    const controller = enhanceDialog(asDialog(dialog), {
      ids,
      open: true,
      closeOnEscape: false,
      onDismiss: previousDismiss,
    });

    controller.update({
      ids,
      open: true,
      closeOnEscape: true,
      onDismiss: currentDismiss,
    });
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    controller.update({ ids, open: false, onDismiss: currentDismiss });
    dialog.dispatchEvent(new Event('close'));

    expect(previousDismiss).not.toHaveBeenCalled();
    expect(currentDismiss.mock.calls).toEqual([['escape']]);
    expect(document.documentElement.style.overflow).toBe('clip');
  });

  it('reconciles an unexpected native close and cleans its lifecycle', () => {
    const document = new FakeDocument();
    const dialog = new FakeDialog(document);
    const opener = new FakeElement(document);
    const onDismiss = vi.fn();
    document.activeElement = opener;
    const controller = enhanceDialog(asDialog(dialog), {
      ids,
      open: true,
      onDismiss,
    });

    dialog.close();

    expect(controller.state.open).toBe(false);
    expect(onDismiss).toHaveBeenCalledWith('native-close');
    expect(opener.focused).toBe(1);
    expect(document.documentElement.style.overflow).toBe('clip');
  });

  it('restores managed attributes and listeners on idempotent destroy', () => {
    const document = new FakeDocument();
    const dialog = new FakeDialog(document);
    const onDismiss = vi.fn();
    dialog.setAttribute('data-size', 'consumer-size');
    dialog.setAttribute('aria-describedby', 'consumer-description');
    const controller = enhanceDialog(asDialog(dialog), {
      ids,
      open: true,
      onDismiss,
    });

    controller.destroy();
    controller.destroy();
    controller.update({ ids, open: true });
    controller.requestClose('close-button');
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));

    expect(dialog.closeCalls).toBe(1);
    expect(dialog.getAttribute('data-morfira-dialog')).toBeNull();
    expect(dialog.getAttribute('data-state')).toBeNull();
    expect(dialog.getAttribute('data-size')).toBe('consumer-size');
    expect(dialog.getAttribute('aria-describedby')).toBe('consumer-description');
    expect(dialog.getAttribute('aria-modal')).toBeNull();
    expect(document.documentElement.style.overflow).toBe('clip');
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('cleans an open lifecycle after the dialog disconnects', () => {
    const document = new FakeDocument();
    const dialog = new FakeDialog(document);
    const opener = new FakeElement(document);
    const onDismiss = vi.fn();
    document.activeElement = opener;
    const controller = enhanceDialog(asDialog(dialog), {
      ids,
      open: true,
      onDismiss,
    });

    dialog.isConnected = false;
    controller.destroy();
    controller.destroy();
    dialog.dispatchEvent(new Event('close'));
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));

    expect(dialog.open).toBe(false);
    expect(dialog.closeCalls).toBe(1);
    expect(opener.focused).toBe(1);
    expect(document.documentElement.style.overflow).toBe('clip');
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('rejects a dialog that is already open outside the controller', () => {
    const document = new FakeDocument();
    const dialog = new FakeDialog(document);
    dialog.open = true;

    expect(() => enhanceDialog(asDialog(dialog), { ids })).toThrow(/must be closed/);
  });
});
