<script lang="ts">
  import { resolveDropdownOptions } from '@morfira-dev/core/dropdown';
  import { tick } from 'svelte';
  import Menu from '../menu/Menu.svelte';
  import type { DropdownOpenReason, DropdownProps } from './types.js';

  let { ariaLabel, children, closeOnEscape, closeOnOutsidePointer, contentId, disabled, items, onOpenChange, onSelect, open = $bindable(false), placement, restoreFocus, ...nativeProps }: DropdownProps = $props();
  let triggerElement: HTMLButtonElement;
  let contentElement: HTMLDivElement;
  const state = $derived(resolveDropdownOptions({ closeOnEscape, closeOnOutsidePointer, contentId, disabled, open, placement, restoreFocus }));
  const request = (next: boolean, reason: DropdownOpenReason): void => { if (state.disabled || next === state.open) return; open = next; onOpenChange?.(next, reason); };
  const close = (reason: 'escape' | 'tab' | 'select'): void => { if (reason !== 'escape' || state.closeOnEscape) request(false, reason); if (reason !== 'tab' && state.restoreFocus) triggerElement.focus({ preventScroll: true }); };
  const triggerKeydown = async (event: KeyboardEvent): Promise<void> => { if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return; event.preventDefault(); const last = event.key === 'ArrowUp'; request(true, last ? 'arrow-last' : 'arrow-first'); await tick(); const available = contentElement.querySelectorAll<HTMLElement>('[data-morfira-menu-item]:not([aria-disabled="true"])'); available[last ? available.length - 1 : 0]?.focus({ preventScroll: true }); };
  $effect(() => {
    if (!state.open) return;
    const pointer = (event: PointerEvent): void => { const target = event.target as Node | null; if (state.closeOnOutsidePointer && event.button === 0 && event.isPrimary && target && !triggerElement.contains(target) && !contentElement.contains(target)) request(false, 'outside-pointer'); };
    document.addEventListener('pointerdown', pointer); return () => document.removeEventListener('pointerdown', pointer);
  });
</script>

<button {...nativeProps} bind:this={triggerElement} type={nativeProps.type ?? 'button'} {disabled} aria-controls={state.contentId} aria-expanded={state.open} aria-haspopup="menu" data-morfira-dropdown-trigger="" data-state={state.open ? 'open' : 'closed'} onclick={() => request(!state.open, 'trigger')} onkeydown={triggerKeydown}>{@render children()}</button>
<div bind:this={contentElement} id={state.contentId} hidden={!state.open} data-morfira-dropdown="" data-placement={state.placement} data-state={state.open ? 'open' : 'closed'}>
  <Menu {ariaLabel} {items} {onSelect} onDismiss={close} />
</div>
