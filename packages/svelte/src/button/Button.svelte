<script lang="ts">
  import { resolveButtonOptions } from '@morfira-dev/core/button';
  import type { ButtonProps } from './types.js';
  import type { MouseEventHandler } from 'svelte/elements';

  let {
    children,
    disabled,
    loading,
    onclick,
    size,
    type,
    variant,
    ...nativeProps
  }: ButtonProps = $props();

  const options = $derived(
    resolveButtonOptions({ disabled, loading, size, type, variant }),
  );

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event): void => {
    if (!options.interactive) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    onclick?.(event);
  };
</script>

<button
  {...nativeProps}
  type={options.type}
  disabled={options.nativeDisabled}
  aria-busy={options.loading || undefined}
  data-morfira-button=""
  data-variant={options.variant}
  data-size={options.size}
  data-loading={options.loading ? '' : undefined}
  onclick={handleClick}
>
  {#if children}
    {@render children()}
  {/if}
</button>
