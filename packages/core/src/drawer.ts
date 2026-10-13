export const DRAWER_SIDES = ['inline-start', 'inline-end'] as const;
export const DRAWER_SIZES = ['sm', 'md', 'lg'] as const;
export const DRAWER_DISMISS_REASONS = [
  'escape',
  'backdrop',
  'close-button',
  'native-close',
] as const;

export type DrawerSide = (typeof DRAWER_SIDES)[number];
export type DrawerSize = (typeof DRAWER_SIZES)[number];
export type DrawerDismissReason = (typeof DRAWER_DISMISS_REASONS)[number];

export interface DrawerIds {
  readonly titleId: string;
  readonly descriptionId?: string;
}

export interface DrawerOptions {
  readonly ids: DrawerIds;
  readonly open?: boolean;
  readonly modal?: boolean;
  readonly side?: DrawerSide;
  readonly size?: DrawerSize;
  readonly closeOnEscape?: boolean;
  readonly closeOnBackdrop?: boolean;
  readonly lockScroll?: boolean;
  readonly restoreFocus?: boolean;
}

export interface ResolvedDrawerOptions {
  readonly ids: DrawerIds;
  readonly open: boolean;
  readonly modal: boolean;
  readonly side: DrawerSide;
  readonly size: DrawerSize;
  readonly closeOnEscape: boolean;
  readonly closeOnBackdrop: boolean;
  readonly lockScroll: boolean;
  readonly restoreFocus: boolean;
}

function requireId(value: string, name: string): string {
  if (value.trim().length === 0 || /[\t\n\f\r ]/u.test(value)) {
    throw new TypeError(
      `Drawer ${name} must be a non-empty ID without ASCII whitespace.`,
    );
  }
  return value;
}

export function resolveDrawerOptions(options: DrawerOptions): ResolvedDrawerOptions {
  const titleId = requireId(options.ids.titleId, 'titleId');
  const descriptionId =
    options.ids.descriptionId === undefined
      ? undefined
      : requireId(options.ids.descriptionId, 'descriptionId');
  if (titleId === descriptionId) {
    throw new TypeError('Drawer IDs must be unique within a drawer.');
  }

  return {
    ids: {
      titleId,
      ...(descriptionId === undefined ? {} : { descriptionId }),
    },
    open: options.open ?? false,
    modal: options.modal ?? true,
    side: options.side ?? 'inline-end',
    size: options.size ?? 'md',
    closeOnEscape: options.closeOnEscape ?? true,
    closeOnBackdrop: options.closeOnBackdrop ?? false,
    lockScroll: options.lockScroll ?? true,
    restoreFocus: options.restoreFocus ?? true,
  };
}
