<script lang="ts">
  import { resolveTooltipOptions } from '@morfira-dev/core/tooltip';
  import { enhanceTooltip } from '@morfira-dev/dom/tooltip';
  import type { TooltipDomOptions } from '@morfira-dev/dom/tooltip';
  import type { Action } from 'svelte/action';
  import type { TooltipProps } from './types.js';

  let { children, closeDelay, content, contentElement = $bindable(null), contentId, disabled, open = $bindable(false), openDelay, onOpenChange, placement, triggerElement = $bindable(null), 'aria-describedby': ariaDescribedby, ...nativeProps }: TooltipProps = $props();
  const resolved = $derived(resolveTooltipOptions({ closeDelay, contentId, disabled, open, openDelay, placement }));
  const request: NonNullable<TooltipDomOptions['onOpenChange']> = (next, reason) => { open = next; onOpenChange?.(next, reason); };
  const options = $derived<TooltipDomOptions>({ ...resolved, onOpenChange: request });
  const contentAction: Action<HTMLElement, TooltipDomOptions> = (node, initial) => {
    if (!triggerElement) throw new TypeError('Tooltip trigger must be mounted before its content.');
    const controller = enhanceTooltip(triggerElement, node, initial);
    return { update(next) { controller.update(next); }, destroy() { controller.destroy(); } };
  };
</script>

<button {...nativeProps} bind:this={triggerElement} type={nativeProps.type ?? 'button'} aria-describedby={resolved.open ? [ariaDescribedby, resolved.contentId].filter(Boolean).join(' ') : ariaDescribedby} data-morfira-tooltip-trigger="" data-state={resolved.open ? 'open' : 'closed'}>{@render children()}</button>
<div bind:this={contentElement} use:contentAction={options} id={resolved.contentId} role="tooltip" hidden={!resolved.open} data-morfira-tooltip="" data-placement={resolved.placement} data-state={resolved.open ? 'open' : 'closed'}>{@render content()}</div>
