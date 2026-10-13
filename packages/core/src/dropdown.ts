export const DROPDOWN_PLACEMENTS = [
  'block-start',
  'block-end',
  'inline-start',
  'inline-end',
] as const;

export type DropdownPlacement = (typeof DROPDOWN_PLACEMENTS)[number];

export interface DropdownOptions {
  readonly contentId: string;
  readonly open?: boolean;
  readonly disabled?: boolean;
  readonly placement?: DropdownPlacement;
  readonly closeOnEscape?: boolean;
  readonly closeOnOutsidePointer?: boolean;
  readonly restoreFocus?: boolean;
}

export interface ResolvedDropdownOptions {
  readonly contentId: string;
  readonly open: boolean;
  readonly disabled: boolean;
  readonly placement: DropdownPlacement;
  readonly closeOnEscape: boolean;
  readonly closeOnOutsidePointer: boolean;
  readonly restoreFocus: boolean;
}

export function resolveDropdownOptions(
  options: DropdownOptions,
): ResolvedDropdownOptions {
  if (options.contentId.trim().length === 0 || /[\t\n\f\r ]/u.test(options.contentId)) {
    throw new TypeError(
      'Dropdown contentId must be a non-empty ID without ASCII whitespace.',
    );
  }
  const placement = options.placement ?? 'block-end';
  if (!DROPDOWN_PLACEMENTS.includes(placement)) {
    throw new TypeError('Dropdown placement is not supported.');
  }
  return {
    contentId: options.contentId,
    open: options.open ?? false,
    disabled: options.disabled ?? false,
    placement,
    closeOnEscape: options.closeOnEscape ?? true,
    closeOnOutsidePointer: options.closeOnOutsidePointer ?? true,
    restoreFocus: options.restoreFocus ?? true,
  };
}
