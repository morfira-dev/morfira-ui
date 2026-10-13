<script lang="ts">
  import { findMenuMatch, resolveMenuOptions } from '@morfira-dev/core/menu';
  import type { MenuProps } from './types.js';

  let { ariaLabel, items, loop, onDismiss, onSelect, typeaheadTimeout, ...nativeProps }: MenuProps = $props();
  const state = $derived(resolveMenuOptions({ items, loop, typeaheadTimeout }));
  let activeIndex = $state(0);
  let itemElements: (HTMLButtonElement | null)[] = [];
  let query = '';
  let timer: ReturnType<typeof setTimeout> | undefined;
  const enabled = $derived(state.items.map((item, index) => item.disabled ? -1 : index).filter((index) => index >= 0));
  $effect(() => { if (state.items[activeIndex]?.disabled !== false) activeIndex = enabled[0] ?? -1; });
  const focus = (index: number): void => { if (state.items[index]?.disabled) return; activeIndex = index; itemElements[index]?.focus({ preventScroll: true }); };
  const keydown = (event: KeyboardEvent): void => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); const position = Math.max(0, enabled.indexOf(activeIndex)); const delta = event.key === 'ArrowDown' ? 1 : -1; const candidate = position + delta;
      const next = state.loop ? ((candidate % enabled.length) + enabled.length) % enabled.length : Math.max(0, Math.min(enabled.length - 1, candidate)); const index = enabled[next]; if (index !== undefined) focus(index);
    } else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); const index = event.key === 'Home' ? enabled[0] : enabled.at(-1); if (index !== undefined) focus(index); }
    else if (event.key === 'Escape') { event.preventDefault(); onDismiss?.('escape'); }
    else if (event.key === 'Tab') onDismiss?.('tab');
    else if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault(); const repeated = query.length > 0 && Array.from(query).every((value) => value === event.key); query = repeated ? event.key : `${query}${event.key}`;
      const index = findMenuMatch(state.items, query, activeIndex); if (index >= 0) focus(index); if (timer !== undefined) clearTimeout(timer); timer = setTimeout(() => { query = ''; }, state.typeaheadTimeout);
    }
  };
</script>

<div {...nativeProps} role="menu" aria-label={ariaLabel} data-morfira-menu="" data-orientation="vertical" onkeydown={keydown}>
  {#each state.items as item, index (item.id)}
    <button bind:this={itemElements[index]} id={item.id} type="button" role="menuitem" aria-disabled={item.disabled || undefined} tabindex={!item.disabled && index === activeIndex ? 0 : -1} data-morfira-menu-item="" data-state={item.disabled ? 'disabled' : 'enabled'} onfocus={() => { if (!item.disabled) activeIndex = index; }} onclick={() => { if (item.disabled) return; onSelect?.(item.id); onDismiss?.('select'); }}>{@render items[index].label()}</button>
  {/each}
</div>
