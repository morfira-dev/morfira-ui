export const TABS_ORIENTATIONS = ['horizontal', 'vertical'] as const;
export const TABS_ACTIVATION_MODES = ['automatic', 'manual'] as const;

export type TabsOrientation = (typeof TABS_ORIENTATIONS)[number];
export type TabsActivationMode = (typeof TABS_ACTIVATION_MODES)[number];

export interface TabItem {
  readonly tabId: string;
  readonly panelId: string;
  readonly disabled?: boolean;
}

export interface TabsOptions {
  readonly items: readonly TabItem[];
  readonly selectedId?: string;
  readonly orientation?: TabsOrientation;
  readonly activationMode?: TabsActivationMode;
  readonly loop?: boolean;
}

export interface ResolvedTabItem {
  readonly tabId: string;
  readonly panelId: string;
  readonly disabled: boolean;
}

export interface ResolvedTabsOptions {
  readonly items: readonly ResolvedTabItem[];
  readonly selectedId: string | undefined;
  readonly orientation: TabsOrientation;
  readonly activationMode: TabsActivationMode;
  readonly loop: boolean;
}

function requireId(value: string, name: string): string {
  if (value.trim().length === 0 || /[\t\n\f\r ]/u.test(value)) {
    throw new TypeError(
      `Tabs ${name} must be a non-empty ID without ASCII whitespace.`,
    );
  }
  return value;
}

export function resolveTabsOptions(options: TabsOptions): ResolvedTabsOptions {
  const seen = new Set<string>();
  const items = options.items.map((item) => {
    const tabId = requireId(item.tabId, 'tabId');
    const panelId = requireId(item.panelId, 'panelId');
    if (seen.has(tabId) || seen.has(panelId) || tabId === panelId) {
      throw new TypeError('Tabs tabId and panelId values must be unique.');
    }
    seen.add(tabId);
    seen.add(panelId);
    return { tabId, panelId, disabled: item.disabled ?? false };
  });
  const enabled = items.filter((item) => !item.disabled);
  const requested = options.selectedId;
  if (requested !== undefined && !items.some((item) => item.tabId === requested)) {
    throw new TypeError('Tabs selectedId must reference an item tabId.');
  }
  const selected = items.find((item) => item.tabId === requested && !item.disabled);
  return {
    items,
    selectedId: selected?.tabId ?? enabled[0]?.tabId,
    orientation: options.orientation ?? 'horizontal',
    activationMode: options.activationMode ?? 'automatic',
    loop: options.loop ?? true,
  };
}
