<script lang="ts">
  import { resolveAccordionOptions } from '@morfira-dev/core/accordion';
  import type { AccordionProps } from './types.js';
  let { collapsible, defaultExpandedIds = [], expandedIds = $bindable(), items, multiple, onExpandedChange, ...nativeProps }: AccordionProps = $props();
  let triggers: (HTMLElement | null)[] = [];
  const state = $derived(resolveAccordionOptions({ collapsible, expandedIds: expandedIds ?? defaultExpandedIds, items, multiple }));
  const enabled = $derived(state.items.map((item, index) => item.disabled ? -1 : index).filter((index) => index >= 0));
  const update = (next: readonly string[]): void => { expandedIds = next; onExpandedChange?.(next); };
  const toggle = (index: number): void => { const item = state.items[index]; if (!item || item.disabled) return; const expanded = state.expandedIds.includes(item.triggerId); if (expanded && !state.collapsible && state.expandedIds.length === 1) return; update(expanded ? state.expandedIds.filter((id) => id !== item.triggerId) : state.multiple ? [...state.expandedIds, item.triggerId] : [item.triggerId]); };
  const keydown = (event: KeyboardEvent, index: number): void => { const position = enabled.indexOf(index); let target: number | undefined; if (event.key === 'ArrowDown') target = position + 1; else if (event.key === 'ArrowUp') target = position - 1; else if (event.key === 'Home') target = 0; else if (event.key === 'End') target = enabled.length - 1; else return; event.preventDefault(); if (enabled.length === 0) return; const targetIndex = enabled[((target % enabled.length) + enabled.length) % enabled.length]; if (targetIndex !== undefined) triggers[targetIndex]?.focus({ preventScroll: true }); };
</script>

<div {...nativeProps} data-morfira-accordion="">
  {#each state.items as item, index (item.triggerId)}
    {@const expanded = state.expandedIds.includes(item.triggerId)}
    <details open={expanded} data-morfira-accordion-item="" data-state={expanded ? 'open' : 'closed'}>
      <summary bind:this={triggers[index]} id={item.triggerId} aria-controls={item.panelId} aria-expanded={expanded} aria-disabled={item.disabled || undefined} tabindex={item.disabled ? -1 : undefined} data-morfira-accordion-trigger="" data-state={expanded ? 'open' : 'closed'} onclick={(event) => { event.preventDefault(); toggle(index); }} onkeydown={(event) => keydown(event, index)}>{@render items[index].title()}</summary>
      <div id={item.panelId} role="region" aria-labelledby={item.triggerId} hidden={!expanded} data-morfira-accordion-panel="" data-state={expanded ? 'open' : 'closed'}>{@render items[index].content()}</div>
    </details>
  {/each}
</div>
