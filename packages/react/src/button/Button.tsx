import { resolveButtonOptions } from '@morfira-dev/core/button';
import type { ButtonOptions } from '@morfira-dev/core/button';
import type {
  ComponentPropsWithoutRef,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';

type NativeButtonProps = Omit<
  ComponentPropsWithoutRef<'button'>,
  keyof ButtonOptions | 'aria-busy' | 'children'
>;

export interface ButtonProps extends NativeButtonProps, ButtonOptions {
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLButtonElement>;
}

export function Button({
  children,
  disabled,
  loading,
  onClick,
  ref,
  size,
  type,
  variant,
  ...nativeProps
}: ButtonProps): ReactElement {
  const options = resolveButtonOptions({
    disabled: disabled ?? false,
    loading: loading ?? false,
    size: size ?? 'md',
    type: type ?? 'button',
    variant: variant ?? 'primary',
  });

  const handleClick = (event: ReactMouseEvent<HTMLButtonElement>): void => {
    if (!options.interactive) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    onClick?.(event);
  };

  return (
    <button
      {...nativeProps}
      ref={ref}
      type={options.type}
      disabled={options.nativeDisabled}
      aria-busy={options.loading || undefined}
      data-morfira-button=""
      data-variant={options.variant}
      data-size={options.size}
      data-loading={options.loading ? '' : undefined}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
