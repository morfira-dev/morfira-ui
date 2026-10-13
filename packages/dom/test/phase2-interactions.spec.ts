import { describe, expect, it, vi } from 'vitest';
import { enhanceAccordion, type AccordionElements } from '../src/accordion.js';
import { enhancePopover } from '../src/popover.js';
import { enhanceTabs, type TabsElements } from '../src/tabs.js';
import { enhanceTooltip } from '../src/tooltip.js';

class FakeDocument extends EventTarget {}

class FakeElement extends EventTarget {
  readonly attributes = new Map<string, string>();
  readonly ownerDocument: FakeDocument;
  isConnected = true;
  focused = false;
  shown = false;
  open = false;
  dir = '';
  readonly style = { setProperty: vi.fn() };
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
  get disabled() {
    return this.attributes.has('disabled');
  }
  set disabled(value: boolean) {
    if (value) this.setAttribute('disabled', '');
    else this.removeAttribute('disabled');
  }
  get type() {
    return this.getAttribute('type') ?? '';
  }
  set type(value: string) {
    this.setAttribute('type', value);
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
  }
  contains(target: unknown) {
    return target === this;
  }
  closest() {
    return null;
  }
  getBoundingClientRect() {
    return { left: 10, right: 30, top: 20, bottom: 40, width: 20, height: 20 };
  }
  showPopover() {
    this.shown = true;
  }
  hidePopover() {
    this.shown = false;
  }
}

const asElement = (element: FakeElement): HTMLElement =>
  element as unknown as HTMLElement;
const key = (value: string): KeyboardEvent => {
  const event = new Event('keydown', { cancelable: true });
  Object.defineProperty(event, 'key', { value });
  return event as KeyboardEvent;
};
const pointer = (button = 0, isPrimary = true): PointerEvent => {
  const event = new Event('pointerdown', { cancelable: true });
  Object.defineProperties(event, {
    button: { value: button },
    isPrimary: { value: isPrimary },
  });
  return event as PointerEvent;
};

describe('Phase 2 DOM controllers', () => {
  it('coordinates delayed Tooltip requests, ARIA, Escape, and teardown', () => {
    vi.useFakeTimers();
    const trigger = new FakeElement();
    const content = new FakeElement(trigger.ownerDocument);
    trigger.setAttribute('aria-describedby', 'existing-description');
    const changes = vi.fn();
    const controller = enhanceTooltip(asElement(trigger), asElement(content), {
      contentId: 'tip',
      onOpenChange: changes,
    });
    expect(content.hidden).toBe(true);
    expect(content.getAttribute('role')).toBe('tooltip');
    trigger.dispatchEvent(new Event('pointerenter'));
    vi.advanceTimersByTime(499);
    expect(changes).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(changes).toHaveBeenCalledWith(true, 'pointer');
    controller.update({ contentId: 'tip', open: true, onOpenChange: changes });
    expect(trigger.getAttribute('aria-describedby')).toBe('existing-description tip');
    expect(content.hidden).toBe(false);
    trigger.ownerDocument.dispatchEvent(key('Escape'));
    vi.runAllTimers();
    expect(changes).toHaveBeenLastCalledWith(false, 'escape');
    trigger.dispatchEvent(new Event('pointerleave'));
    content.dispatchEvent(new Event('pointerenter'));
    vi.runAllTimers();
    expect(changes).toHaveBeenCalledTimes(2);
    controller.destroy();
    expect(trigger.getAttribute('data-morfira-tooltip-trigger')).toBeNull();
    expect(trigger.getAttribute('aria-describedby')).toBe('existing-description');
    vi.useRealTimers();
  });

  it('uses native Popover when available and requests controlled dismissals', () => {
    const document = new FakeDocument();
    const trigger = new FakeElement(document);
    const content = new FakeElement(document);
    const changes = vi.fn();
    const controller = enhancePopover(asElement(trigger), asElement(content), {
      contentId: 'menu',
      onOpenChange: changes,
    });
    trigger.dispatchEvent(new Event('click'));
    expect(changes).toHaveBeenCalledWith(true, 'trigger');
    controller.update({ contentId: 'menu', open: true, onOpenChange: changes });
    expect(content.shown).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    document.dispatchEvent(key('Escape'));
    expect(changes).toHaveBeenLastCalledWith(false, 'escape');
    document.dispatchEvent(pointer());
    expect(changes).toHaveBeenLastCalledWith(false, 'outside-pointer');
    controller.update({ contentId: 'menu', open: false, onOpenChange: changes });
    expect(trigger.focused).toBe(true);
    controller.destroy();
    expect(content.getAttribute('popover')).toBeNull();
  });

  it('dismisses only the top Popover and ignores non-primary outside pointers', () => {
    const document = new FakeDocument();
    const outerTrigger = new FakeElement(document);
    const outerContent = new FakeElement(document);
    const innerTrigger = new FakeElement(document);
    const innerContent = new FakeElement(document);
    const outerChanges = vi.fn();
    const innerChanges = vi.fn();
    const outer = enhancePopover(asElement(outerTrigger), asElement(outerContent), {
      contentId: 'outer',
      open: true,
      onOpenChange: outerChanges,
    });
    const inner = enhancePopover(asElement(innerTrigger), asElement(innerContent), {
      contentId: 'inner',
      open: true,
      onOpenChange: innerChanges,
    });

    document.dispatchEvent(key('Escape'));
    expect(innerChanges).toHaveBeenCalledWith(false, 'escape');
    expect(outerChanges).not.toHaveBeenCalled();

    inner.update({ contentId: 'inner', open: false, onOpenChange: innerChanges });
    document.dispatchEvent(pointer(2, true));
    document.dispatchEvent(pointer(0, false));
    expect(outerChanges).not.toHaveBeenCalled();
    document.dispatchEvent(key('Escape'));
    expect(outerChanges).toHaveBeenCalledWith(false, 'escape');

    inner.destroy();
    outer.destroy();
  });

  it('applies roving focus and controlled automatic Tabs selection', () => {
    const document = new FakeDocument();
    const root = new FakeElement(document);
    const firstTab = new FakeElement(document);
    const secondTab = new FakeElement(document);
    const thirdTab = new FakeElement(document);
    const tabs = [firstTab, secondTab, thirdTab];
    const firstPanel = new FakeElement(document);
    const secondPanel = new FakeElement(document);
    const thirdPanel = new FakeElement(document);
    const panels = [firstPanel, secondPanel, thirdPanel];
    const selected = vi.fn();
    const elements = {
      root: asElement(root),
      tabs: tabs.map(asElement),
      panels: panels.map(asElement),
    } satisfies TabsElements;
    const controller = enhanceTabs(elements, {
      items: [
        { tabId: 'a-tab', panelId: 'a-panel' },
        { tabId: 'b-tab', panelId: 'b-panel', disabled: true },
        { tabId: 'c-tab', panelId: 'c-panel' },
      ],
      onSelectedChange: selected,
    });
    expect(firstTab.getAttribute('aria-selected')).toBe('true');
    expect(secondPanel.hidden).toBe(true);
    firstTab.dispatchEvent(key('ArrowRight'));
    expect(thirdTab.focused).toBe(true);
    expect(selected).toHaveBeenCalledWith('c-tab');
    root.dir = 'rtl';
    thirdTab.focused = false;
    firstTab.dispatchEvent(key('ArrowLeft'));
    expect(thirdTab.focused).toBe(true);
    controller.destroy();
    expect(root.getAttribute('role')).toBeNull();
  });

  it('coordinates Accordion expansion requests and skips disabled triggers', () => {
    const document = new FakeDocument();
    const root = new FakeElement(document);
    const firstWrapper = new FakeElement(document);
    const secondWrapper = new FakeElement(document);
    const firstTrigger = new FakeElement(document);
    const secondTrigger = new FakeElement(document);
    const firstPanel = new FakeElement(document);
    const secondPanel = new FakeElement(document);
    const expanded = vi.fn();
    const controller = enhanceAccordion(
      {
        root: asElement(root),
        items: [
          firstWrapper,
          secondWrapper,
        ] as unknown as readonly HTMLDetailsElement[],
        triggers: [asElement(firstTrigger), asElement(secondTrigger)],
        panels: [asElement(firstPanel), asElement(secondPanel)],
      } satisfies AccordionElements,
      {
        items: [
          { triggerId: 'a-trigger', panelId: 'a-panel' },
          { triggerId: 'b-trigger', panelId: 'b-panel', disabled: true },
        ],
        expandedIds: ['a-trigger'],
        collapsible: false,
        onExpandedChange: expanded,
      },
    );
    firstTrigger.dispatchEvent(new Event('click', { cancelable: true }));
    secondTrigger.dispatchEvent(new Event('click', { cancelable: true }));
    expect(expanded).not.toHaveBeenCalled();
    expect(firstTrigger.getAttribute('aria-expanded')).toBe('true');
    expect(secondPanel.hidden).toBe(true);
    controller.destroy();
    expect(root.getAttribute('data-morfira-accordion')).toBeNull();
  });
});
