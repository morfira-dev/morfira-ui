import { describe, expect, it } from 'vitest';

import { enhanceTable } from '../src/table.js';

class FakeTable {
  attributes = new Map<string, string>();
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
    return Boolean(force);
  }
}

describe('enhanceTable', () => {
  it('applies and updates visual hooks without replacing semantics', () => {
    const table = new FakeTable();
    const controller = enhanceTable(table as unknown as HTMLTableElement, {
      density: 'compact',
      striped: true,
      stickyHeader: true,
    });

    expect(table.getAttribute('data-density')).toBe('compact');
    expect(table.getAttribute('data-striped')).toBe('');
    expect(table.getAttribute('data-sticky-header')).toBe('');

    controller.update({ hoverable: true });
    expect(table.getAttribute('data-density')).toBe('comfortable');
    expect(table.getAttribute('data-striped')).toBeNull();
    expect(table.getAttribute('data-hoverable')).toBe('');
  });

  it('restores owned attributes idempotently', () => {
    const table = new FakeTable();
    table.setAttribute('data-density', 'consumer');
    const controller = enhanceTable(table as unknown as HTMLTableElement, {});
    controller.destroy();
    controller.destroy();
    controller.update({ striped: true });

    expect(table.getAttribute('data-density')).toBe('consumer');
    expect(table.getAttribute('data-morfira-table')).toBeNull();
  });
});
