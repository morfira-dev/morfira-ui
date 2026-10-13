<script lang="ts">
  import { resolvePopoverOptions } from '@morfira-dev/core/popover';
  import { enhancePopover } from '@morfira-dev/dom/popover';
  import type { PopoverDomOptions } from '@morfira-dev/dom/popover';
  import type { Action } from 'svelte/action';
  import type { PopoverProps } from './types.js';

  let { ariaLabel, children, closeOnEscape, closeOnOutsidePointer, content, contentElement = $bindable(null), contentId, disabled, open = $bindable(false), onOpenChange, placement, restoreFocus, triggerElement = $bindable(null), ...nativeProps }: PopoverProps = $props();
  const resolved = $derived(resolvePopoverOptions({ closeOnEscape, closeOnOutsidePointer, contentId, disabled, open, placement, restoreFocus }));
  const request: NonNullable<PopoverDomOptions['onOpenChange']> = (next, reason) => { open = next; onOpenChange?.(next, reason); };
  const options = $derived<PopoverDomOptions>({ ...resolved, onOpenChange: request });
  const contentAction: Action<HTMLElement, PopoverDomOptions> = (node, initial) => {
    if (!triggerElement) throw new TypeError('Popover trigger must be mounted before its content.');
    const controller = enhancePopover(triggerElement, node, initial);
    return { update(next) { controller.update(next); }, destroy() { controller.destroy(); } };
  };
</script>

<button {...nativeProps} bind:this={triggerElement} type={nativeProps.type ?? 'button'} aria-controls={resolved.contentId} aria-expanded={resolved.open} aria-haspopup="dialog" data-morfira-popover-trigger="" data-state={resolved.open ? 'open' : 'closed'}>{@render children()}</button>
<div bind:this={contentElement} use:contentAction={options} id={resolved.contentId} role="dialog" aria-label={ariaLabel} popover="manual" hidden={!resolved.open} data-morfira-popover="" data-placement={resolved.placement} data-state={resolved.open ? 'open' : 'closed'}>{@render content()}</div>
