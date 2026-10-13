export const POPOVER_PLACEMENTS = [
  'block-start',
  'block-end',
  'inline-start',
  'inline-end',
] as const;

export type PopoverPlacement = (typeof POPOVER_PLACEMENTS)[number];

export interface PopoverOptions {
  readonly contentId: string;
  readonly open?: boolean;
  readonly disabled?: boolean;
  readonly placement?: PopoverPlacement;
  readonly closeOnEscape?: boolean;
  readonly closeOnOutsidePointer?: boolean;
  readonly restoreFocus?: boolean;
}

export interface ResolvedPopoverOptions {
  readonly contentId: string;
  readonly open: boolean;
  readonly disabled: boolean;
  readonly placement: PopoverPlacement;
  readonly closeOnEscape: boolean;
  readonly closeOnOutsidePointer: boolean;
  readonly restoreFocus: boolean;
}

function requireId(value: string): string {
  if (value.trim().length === 0 || /[\t\n\f\r ]/u.test(value)) {
    throw new TypeError(
      'Popover contentId must be a non-empty ID without ASCII whitespace.',
    );
  }
  return value;
}

export function resolvePopoverOptions(options: PopoverOptions): ResolvedPopoverOptions {
  const disabled = options.disabled ?? false;
  return {
    contentId: requireId(options.contentId),
    open: disabled ? false : (options.open ?? false),
    disabled,
    placement: options.placement ?? 'block-end',
    closeOnEscape: options.closeOnEscape ?? true,
    closeOnOutsidePointer: options.closeOnOutsidePointer ?? true,
    restoreFocus: options.restoreFocus ?? true,
  };
}
