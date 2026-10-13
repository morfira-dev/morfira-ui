import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { enhanceToast } from '../src/toast.js';

class FakeDocument extends EventTarget {
  visibilityState: DocumentVisibilityState = 'visible';
  readonly defaultView = {
    performance: { now: () => Date.now() },
    setTimeout: (callback: () => void, delay?: number) => setTimeout(callback, delay),
    clearTimeout: (timer: number) => {
      clearTimeout(timer);
    },
  };
}

class FakeElement extends EventTarget {
  readonly attributes = new Map<string, string>();
  readonly ownerDocument: FakeDocument;

  constructor(ownerDocument: FakeDocument) {
    super();
    this.ownerDocument = ownerDocument;
  }

  get hidden(): boolean {
    return this.attributes.has('hidden');
  }
  set hidden(value: boolean) {
    if (value) this.attributes.set('hidden', '');
    else this.attributes.delete('hidden');
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
  contains(): boolean {
    return false;
  }
}

const asElement = (element: FakeElement) => element as unknown as HTMLElement;

describe('enhanceToast', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('applies live-region semantics and requests timeout dismissal once', () => {
    const element = new FakeElement(new FakeDocument());
    const onDismiss = vi.fn();
    const controller = enhanceToast(asElement(element), {
      open: true,
      tone: 'danger',
      duration: 1000,
      onDismiss,
    });

    expect(element.getAttribute('role')).toBe('alert');
    expect(element.getAttribute('aria-live')).toBe('assertive');
    expect(element.getAttribute('aria-atomic')).toBe('true');
    expect(element.getAttribute('data-tone')).toBe('danger');
    vi.advanceTimersByTime(1000);
    vi.advanceTimersByTime(5000);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith('timeout');
    expect(controller.state.open).toBe(true);
  });

  it('preserves remaining time while hover and visibility pause overlap', () => {
    const document = new FakeDocument();
    const element = new FakeElement(document);
    const onDismiss = vi.fn();
    enhanceToast(asElement(element), { duration: 1000, onDismiss });

    vi.advanceTimersByTime(400);
    element.dispatchEvent(new Event('pointerenter'));
    document.visibilityState = 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));
    vi.advanceTimersByTime(2000);
    element.dispatchEvent(new Event('pointerleave'));
    expect(element.getAttribute('data-paused')).toBe('true');
    document.visibilityState = 'visible';
    document.dispatchEvent(new Event('visibilitychange'));
    expect(element.getAttribute('data-paused')).toBe('false');
    vi.advanceTimersByTime(599);
    expect(onDismiss).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onDismiss).toHaveBeenCalledWith('timeout');
  });

  it('uses current callbacks and cancels every late effect on teardown', () => {
    const document = new FakeDocument();
    const element = new FakeElement(document);
    const previous = vi.fn();
    const current = vi.fn();
    element.setAttribute('role', 'note');
    const controller = enhanceToast(asElement(element), {
      duration: 1000,
      onDismiss: previous,
    });
    controller.update({ duration: 1000, onDismiss: current });
    controller.requestDismiss('close-button');
    expect(previous).not.toHaveBeenCalled();
    expect(current).toHaveBeenCalledWith('close-button');

    controller.destroy();
    controller.destroy();
    vi.advanceTimersByTime(2000);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(current).toHaveBeenCalledTimes(1);
    expect(element.getAttribute('role')).toBe('note');
    expect(element.getAttribute('data-morfira-toast')).toBeNull();
  });

  it('does not reset elapsed time when a non-timing option updates', () => {
    const element = new FakeElement(new FakeDocument());
    const onDismiss = vi.fn();
    const controller = enhanceToast(asElement(element), {
      duration: 1000,
      tone: 'neutral',
      onDismiss,
    });
    vi.advanceTimersByTime(600);
    controller.update({ duration: 1000, tone: 'info', onDismiss });
    vi.advanceTimersByTime(399);
    expect(onDismiss).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onDismiss).toHaveBeenCalledWith('timeout');
  });
});
