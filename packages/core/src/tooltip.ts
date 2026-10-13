export const TOOLTIP_PLACEMENTS = [
  'block-start',
  'block-end',
  'inline-start',
  'inline-end',
] as const;

export type TooltipPlacement = (typeof TOOLTIP_PLACEMENTS)[number];

export interface TooltipOptions {
  readonly contentId: string;
  readonly open?: boolean;
  readonly disabled?: boolean;
  readonly placement?: TooltipPlacement;
  readonly openDelay?: number;
  readonly closeDelay?: number;
}

export interface ResolvedTooltipOptions {
  readonly contentId: string;
  readonly open: boolean;
  readonly disabled: boolean;
  readonly placement: TooltipPlacement;
  readonly openDelay: number;
  readonly closeDelay: number;
}

function requireId(value: string): string {
  if (value.trim().length === 0 || /[\t\n\f\r ]/u.test(value)) {
    throw new TypeError(
      'Tooltip contentId must be a non-empty ID without ASCII whitespace.',
    );
  }
  return value;
}

function requireDelay(
  value: number | undefined,
  fallback: number,
  name: string,
): number {
  const resolved = value ?? fallback;
  if (!Number.isFinite(resolved) || resolved < 0) {
    throw new TypeError(`Tooltip ${name} must be a finite non-negative number.`);
  }
  return resolved;
}

export function resolveTooltipOptions(options: TooltipOptions): ResolvedTooltipOptions {
  const disabled = options.disabled ?? false;
  return {
    contentId: requireId(options.contentId),
    open: disabled ? false : (options.open ?? false),
    disabled,
    placement: options.placement ?? 'block-start',
    openDelay: requireDelay(options.openDelay, 500, 'openDelay'),
    closeDelay: requireDelay(options.closeDelay, 100, 'closeDelay'),
  };
}
