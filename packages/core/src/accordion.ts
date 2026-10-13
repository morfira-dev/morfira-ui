export interface AccordionItem {
  readonly triggerId: string;
  readonly panelId: string;
  readonly disabled?: boolean;
}

export interface AccordionOptions {
  readonly items: readonly AccordionItem[];
  readonly expandedIds?: readonly string[];
  readonly multiple?: boolean;
  readonly collapsible?: boolean;
}

export interface ResolvedAccordionItem {
  readonly triggerId: string;
  readonly panelId: string;
  readonly disabled: boolean;
}

export interface ResolvedAccordionOptions {
  readonly items: readonly ResolvedAccordionItem[];
  readonly expandedIds: readonly string[];
  readonly multiple: boolean;
  readonly collapsible: boolean;
}

function requireId(value: string, name: string): string {
  if (value.trim().length === 0 || /[\t\n\f\r ]/u.test(value)) {
    throw new TypeError(
      `Accordion ${name} must be a non-empty ID without ASCII whitespace.`,
    );
  }
  return value;
}

export function resolveAccordionOptions(
  options: AccordionOptions,
): ResolvedAccordionOptions {
  const seen = new Set<string>();
  const items = options.items.map((item) => {
    const triggerId = requireId(item.triggerId, 'triggerId');
    const panelId = requireId(item.panelId, 'panelId');
    if (seen.has(triggerId) || seen.has(panelId) || triggerId === panelId) {
      throw new TypeError('Accordion triggerId and panelId values must be unique.');
    }
    seen.add(triggerId);
    seen.add(panelId);
    return { triggerId, panelId, disabled: item.disabled ?? false };
  });
  const multiple = options.multiple ?? false;
  const requested = [...new Set(options.expandedIds ?? [])];
  if (requested.some((id) => !items.some((item) => item.triggerId === id))) {
    throw new TypeError('Accordion expandedIds must reference item triggerIds.');
  }
  const enabledExpanded = requested.filter(
    (id) => !items.find((item) => item.triggerId === id)?.disabled,
  );
  const normalizedExpanded = multiple ? enabledExpanded : enabledExpanded.slice(0, 1);
  const expandedIds =
    normalizedExpanded.length === 0 && !(options.collapsible ?? true)
      ? items
          .filter((item) => !item.disabled)
          .slice(0, 1)
          .map((item) => item.triggerId)
      : normalizedExpanded;
  return {
    items,
    expandedIds,
    multiple,
    collapsible: options.collapsible ?? true,
  };
}
