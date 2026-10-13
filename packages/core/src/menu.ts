export interface MenuItem {
  readonly id: string;
  readonly textValue: string;
  readonly disabled?: boolean;
}

export interface MenuOptions {
  readonly items: readonly MenuItem[];
  readonly loop?: boolean;
  readonly typeaheadTimeout?: number;
}

export interface ResolvedMenuItem {
  readonly id: string;
  readonly textValue: string;
  readonly disabled: boolean;
}

export interface ResolvedMenuOptions {
  readonly items: readonly ResolvedMenuItem[];
  readonly loop: boolean;
  readonly typeaheadTimeout: number;
}

function requireToken(value: string, name: string): string {
  if (value.trim().length === 0 || /[\t\n\f\r ]/u.test(value)) {
    throw new TypeError(`Menu ${name} must be a non-empty token without whitespace.`);
  }
  return value;
}

export function resolveMenuOptions(options: MenuOptions): ResolvedMenuOptions {
  const ids = new Set<string>();
  const items = options.items.map((item) => {
    const id = requireToken(item.id, 'item id');
    const textValue = item.textValue.trim();
    if (textValue.length === 0) {
      throw new TypeError('Menu textValue must not be empty.');
    }
    if (ids.has(id)) throw new TypeError('Menu item IDs must be unique.');
    ids.add(id);
    return { id, textValue, disabled: item.disabled ?? false };
  });
  const typeaheadTimeout = options.typeaheadTimeout ?? 700;
  if (!Number.isFinite(typeaheadTimeout) || typeaheadTimeout < 0) {
    throw new RangeError('Menu typeaheadTimeout must be a non-negative finite number.');
  }
  return { items, loop: options.loop ?? true, typeaheadTimeout };
}

export function findMenuMatch(
  items: readonly ResolvedMenuItem[],
  query: string,
  afterIndex = -1,
): number {
  const normalized = query.trim().toLocaleLowerCase();
  if (normalized.length === 0 || items.length === 0) return -1;
  for (let offset = 1; offset <= items.length; offset += 1) {
    const index = (afterIndex + offset + items.length) % items.length;
    const item = items[index];
    if (
      item !== undefined &&
      !item.disabled &&
      item.textValue.toLocaleLowerCase().startsWith(normalized)
    ) {
      return index;
    }
  }
  return -1;
}
