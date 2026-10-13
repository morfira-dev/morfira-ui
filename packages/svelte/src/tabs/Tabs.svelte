<script lang="ts">
  import { resolveTabsOptions } from '@morfira-dev/core/tabs';
  import type { TabsProps } from './types.js';
  let { activationMode, defaultSelectedId, items, loop, onSelectedChange, orientation, selectedId = $bindable(), ...nativeProps }: TabsProps = $props();
  let tabElements: (HTMLButtonElement | null)[] = [];
  let focusedId = $state<string>();
  const state = $derived(resolveTabsOptions({ activationMode, items, loop, orientation, ...((selectedId ?? defaultSelectedId) === undefined ? {} : { selectedId: selectedId ?? defaultSelectedId }) }));
  const enabled = $derived(state.items.map((item, index) => item.disabled ? -1 : index).filter((index) => index >= 0));
  $effect(() => { focusedId = state.selectedId; });
  const select = (id: string): void => { focusedId = id; if (id !== state.selectedId) { selectedId = id; onSelectedChange?.(id); } };
  const keydown = (event: KeyboardEvent, index: number): void => {
    const position = enabled.indexOf(index); let target: number | undefined;
    const rtl = (event.currentTarget as HTMLElement).closest<HTMLElement>('[dir]')?.dir === 'rtl';
    const previous = state.orientation === 'vertical' ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
    const next = state.orientation === 'vertical' ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
    if (event.key === previous) target = position - 1; else if (event.key === next) target = position + 1;
    else if (event.key === 'Home') target = 0; else if (event.key === 'End') target = enabled.length - 1;
    else if (state.activationMode === 'manual' && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); const item = state.items[index]; if (item && !item.disabled) select(item.tabId); return; } else return;
    event.preventDefault(); if (enabled.length === 0) return;
    const bounded = state.loop ? ((target % enabled.length) + enabled.length) % enabled.length : Math.max(0, Math.min(enabled.length - 1, target));
    const targetIndex = enabled[bounded]; const item = targetIndex === undefined ? undefined : state.items[targetIndex];
    if (targetIndex === undefined || !item) return; focusedId = item.tabId; tabElements[targetIndex]?.focus({ preventScroll: true }); if (state.activationMode === 'automatic') select(item.tabId);
  };
</script>

<div {...nativeProps} data-morfira-tabs-root="">
  <div role="tablist" aria-orientation={state.orientation} data-morfira-tabs="" data-orientation={state.orientation}>
    {#each state.items as item, index (item.tabId)}
      {@const selected = item.tabId === state.selectedId}
      <button bind:this={tabElements[index]} id={item.tabId} type="button" role="tab" disabled={item.disabled} aria-disabled={item.disabled || undefined} aria-controls={item.panelId} aria-selected={selected} tabindex={!item.disabled && item.tabId === (focusedId ?? state.selectedId) ? 0 : -1} data-morfira-tab="" data-state={selected ? 'active' : 'inactive'} onclick={() => select(item.tabId)} onkeydown={(event) => keydown(event, index)}>{@render items[index].label()}</button>
    {/each}
  </div>
  {#each state.items as item, index (item.panelId)}
    {@const selected = item.tabId === state.selectedId}
    <div id={item.panelId} role="tabpanel" aria-labelledby={item.tabId} hidden={!selected} tabindex={selected ? 0 : undefined} data-morfira-tab-panel="" data-state={selected ? 'active' : 'inactive'}>{@render items[index].content()}</div>
  {/each}
</div>
