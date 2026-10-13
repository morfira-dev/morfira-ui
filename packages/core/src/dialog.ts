export const DIALOG_SIZES: readonly ['sm', 'md', 'lg'] = ['sm', 'md', 'lg'];

export const DIALOG_DISMISS_REASONS: readonly [
  'escape',
  'backdrop',
  'close-button',
  'native-close',
] = ['escape', 'backdrop', 'close-button', 'native-close'];

export type DialogSize = (typeof DIALOG_SIZES)[number];

export type DialogDismissReason = (typeof DIALOG_DISMISS_REASONS)[number];

export interface DialogIds {
  readonly titleId: string;
  readonly descriptionId?: string;
}

export interface DialogOptions {
  readonly ids: DialogIds;
  readonly open?: boolean;
  readonly size?: DialogSize;
  readonly closeOnEscape?: boolean;
  readonly closeOnBackdrop?: boolean;
  readonly lockScroll?: boolean;
  readonly restoreFocus?: boolean;
}

export interface ResolvedDialogOptions {
  readonly ids: DialogIds;
  readonly open: boolean;
  readonly size: DialogSize;
  readonly closeOnEscape: boolean;
  readonly closeOnBackdrop: boolean;
  readonly lockScroll: boolean;
  readonly restoreFocus: boolean;
}

function requireExplicitId(value: string, name: string): string {
  if (value.trim().length === 0) {
    throw new TypeError(`Dialog ${name} must be a non-empty explicit ID.`);
  }

  if (/[\t\n\f\r ]/u.test(value)) {
    throw new TypeError(`Dialog ${name} must not contain ASCII whitespace.`);
  }

  return value;
}

function resolveIds(ids: DialogIds): DialogIds {
  const titleId = requireExplicitId(ids.titleId, 'titleId');
  const descriptionId =
    ids.descriptionId === undefined
      ? undefined
      : requireExplicitId(ids.descriptionId, 'descriptionId');

  if (descriptionId === titleId) {
    throw new TypeError('Dialog IDs must be unique within a dialog.');
  }

  return {
    titleId,
    ...(descriptionId === undefined ? {} : { descriptionId }),
  };
}

/**
 * Resolves the framework-independent modal Dialog contract. Browser focus, top-layer,
 * dismissal, and scroll effects remain owned by the DOM layer.
 */
export function resolveDialogOptions(options: DialogOptions): ResolvedDialogOptions {
  return {
    ids: resolveIds(options.ids),
    open: options.open ?? false,
    size: options.size ?? 'md',
    closeOnEscape: options.closeOnEscape ?? true,
    closeOnBackdrop: options.closeOnBackdrop ?? false,
    lockScroll: options.lockScroll ?? true,
    restoreFocus: options.restoreFocus ?? true,
  };
}
