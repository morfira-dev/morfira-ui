import { createRenderer, nextTick } from 'vue';
import { describe, expect, it } from 'vitest';

import { Switch } from '../src/switch/index.js';
import { Tabs } from '../src/tabs/index.js';

class FakeForm extends EventTarget {}

interface FakeNode {
  parent: FakeElement | null;
}

interface FakeText extends FakeNode {
  text: string;
}

interface FakeElement extends FakeNode {
  type: string;
  props: Record<string, unknown>;
  children: FakeNode[];
  text: string;
  focused: boolean;
  checked: boolean;
  form: FakeForm | null;
  attributes: Map<string, string>;
  focus(): void;
  closest(): null;
  setAttribute(name: string, value: string): void;
  toggleAttribute(name: string, force?: boolean): boolean;
}

const element = (type: string): FakeElement => ({
  type,
  props: {},
  children: [],
  text: '',
  parent: null,
  focused: false,
  checked: false,
  form: type === 'input' ? new FakeForm() : null,
  attributes: new Map(),
  focus() {
    this.focused = true;
  },
  closest: () => null,
  setAttribute(name, value) {
    this.attributes.set(name, value);
  },
  toggleAttribute(name, force) {
    if (force) this.attributes.set(name, '');
    else this.attributes.delete(name);
    return Boolean(force);
  },
});

const renderer = createRenderer<FakeNode, FakeElement>({
  patchProp(target, key, _previous, next) {
    if (next === null || next === undefined) Reflect.deleteProperty(target.props, key);
    else target.props[key] = next;
  },
  insert(child, parent, anchor) {
    child.parent = parent;
    const index = anchor == null ? -1 : parent.children.indexOf(anchor);
    if (index < 0) parent.children.push(child);
    else parent.children.splice(index, 0, child);
  },
  remove(child) {
    const parent = child.parent;
    if (parent !== null)
      parent.children = parent.children.filter((item) => item !== child);
    child.parent = null;
  },
  createElement: (type) => element(type),
  createText: (text): FakeText => ({ text, parent: null }),
  createComment: (text): FakeText => ({ text, parent: null }),
  setText(node, text) {
    (node as FakeText).text = text;
  },
  setElementText(target, text) {
    target.text = text;
    target.children = [];
  },
  parentNode: (node) => node.parent,
  nextSibling(node) {
    const parent = node.parent;
    if (parent === null) return null;
    const index = parent.children.indexOf(node);
    return parent.children[index + 1] ?? null;
  },
  setScopeId: () => undefined,
  insertStaticContent(content, parent, anchor) {
    const node: FakeText = { text: content, parent: null };
    this.insert(node, parent, anchor);
    return [node, node];
  },
});

const descendants = (root: FakeElement): FakeElement[] => {
  const result: FakeElement[] = [];
  const isElement = (node: FakeNode): node is FakeElement =>
    'type' in node && 'children' in node;
  const visit = (node: FakeNode): void => {
    if (isElement(node)) {
      result.push(node);
      node.children.forEach(visit);
    }
  };
  root.children.forEach(visit);
  return result;
};

describe('Vue Phase 2 runtime behavior', () => {
  it('synchronizes Switch model and public state after native form reset', async () => {
    const updates: boolean[] = [];
    const container = element('root');
    renderer
      .createApp(Switch, {
        modelValue: true,
        'onUpdate:modelValue': (value: boolean): void => {
          updates.push(value);
        },
      })
      .mount(container);

    const input = descendants(container).find((node) => node.type === 'input');
    expect(input).toBeDefined();
    if (input === undefined || input.form === null) return;

    input.checked = false;
    input.form.dispatchEvent(new Event('reset'));
    await Promise.resolve();

    expect(updates).toEqual([false]);
    expect(input.attributes.has('data-checked')).toBe(false);
    expect(input.attributes.get('aria-checked')).toBe('false');
  });

  it('moves manual Tabs roving tabindex without changing selection', async () => {
    const container = element('root');
    renderer
      .createApp(Tabs, {
        activationMode: 'manual',
        modelValue: 'first-tab',
        items: [
          {
            tabId: 'first-tab',
            panelId: 'first-panel',
            label: 'First',
            content: 'One',
          },
          {
            tabId: 'second-tab',
            panelId: 'second-panel',
            label: 'Second',
            content: 'Two',
          },
        ],
      })
      .mount(container);

    const buttons = descendants(container).filter((node) => node.type === 'button');
    expect(buttons.map((button) => button.props['tabindex'])).toEqual([0, -1]);
    expect(buttons.map((button) => button.props['aria-selected'])).toEqual([
      true,
      false,
    ]);

    const event = {
      key: 'ArrowRight',
      currentTarget: buttons[0],
      preventDefault: (): void => undefined,
    } as unknown as KeyboardEvent;
    (buttons[0]?.props['onKeydown'] as (event: KeyboardEvent) => void)(event);
    await nextTick();

    expect(buttons.map((button) => button.props['tabindex'])).toEqual([-1, 0]);
    expect(buttons.map((button) => button.props['aria-selected'])).toEqual([
      true,
      false,
    ]);
    expect(buttons[1]?.focused).toBe(true);
  });
});
