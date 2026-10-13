<script lang="ts">
  import { createAsyncRequestGate, moveComboboxActiveId, resolveComboboxState } from '@morfira-dev/core/combobox';
  import type { ComboboxOption } from '@morfira-dev/core/combobox';
  import { onDestroy } from 'svelte';
  import type { ComboboxProps } from './types.js';

  let { defaultOpen = false, defaultQuery = '', defaultSelectedValue, disabled = false, element = $bindable(null), empty, inputId, inputProps, invalid = false, listboxId, loadOptions, loading: controlledLoading = false, loadingContent, onLoadError, onOpenChange, onQueryChange, onSelectedValueChange, open = $bindable(defaultOpen), option: optionSnippet, options, query = $bindable(defaultQuery), readOnly = false, selectedValue = $bindable(defaultSelectedValue), ...nativeProps }: ComboboxProps = $props();
  let activeId = $state<string>();
  let loadedOptions = $state<readonly ComboboxOption[]>();
  let asyncLoading = $state(false);
  let root: HTMLDivElement;
  const gate = createAsyncRequestGate();
  onDestroy(() => gate.invalidate());
  $effect(() => { if (disabled) { gate.invalidate(); asyncLoading = false; } });
  const sourceOptions = $derived(loadedOptions ?? options);
  const state = $derived(resolveComboboxState({ inputId, listboxId, options: sourceOptions, query, selectedValue, activeId, open, filter: loadOptions === undefined }));
  const busy = $derived(controlledLoading || asyncLoading);
  const requestOpen = (next: boolean): void => { if (next !== open) { open = next; onOpenChange?.(next); } if (!next) activeId = undefined; };
  const requestQuery = (next: string): void => { if (next !== query) { query = next; onQueryChange?.(next); } };
  const runLoader = (next: string): void => {
    if (!loadOptions) return;
    const token = gate.next(); asyncLoading = true;
    void Promise.resolve().then(() => loadOptions(next)).then((result) => { if (!gate.isCurrent(token)) return; loadedOptions = result; asyncLoading = false; }, (error: unknown) => { if (!gate.isCurrent(token)) return; asyncLoading = false; onLoadError?.(error); });
  };
  const select = (item: ComboboxOption): void => { if (item.disabled) return; if (item.value !== selectedValue) { selectedValue = item.value; onSelectedValueChange?.(item.value); } requestQuery(item.label); requestOpen(false); };
  const move = (direction: -1 | 1 | 'first' | 'last'): void => { activeId = moveComboboxActiveId(state.visibleOptions, open ? state.activeId : undefined, direction); requestOpen(true); };
  const keydown = (event: KeyboardEvent): void => {
    inputProps?.onkeydown?.(event); if (event.defaultPrevented || disabled || readOnly) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); move(event.key === 'ArrowDown' ? 1 : -1); }
    else if (state.open && (event.key === 'Home' || event.key === 'End')) { event.preventDefault(); move(event.key === 'Home' ? 'first' : 'last'); }
    else if (state.open && event.key === 'Enter') { const item = sourceOptions.find(({ id }) => id === state.activeId); if (item && !item.disabled) { event.preventDefault(); select(item); } }
    else if (state.open && event.key === 'Escape') { event.preventDefault(); requestOpen(false); }
    else if (state.open && event.key === 'Tab') requestOpen(false);
  };
</script>

<div {...nativeProps} bind:this={root} data-morfira-combobox="" data-state={state.open ? 'open' : 'closed'} data-disabled={disabled || undefined} data-invalid={invalid || undefined} data-loading={busy || undefined}>
  <input {...inputProps} bind:this={element} id={state.inputId} role="combobox" aria-autocomplete="list" aria-controls={state.listboxId} aria-expanded={state.open} aria-activedescendant={state.open ? state.activeId : undefined} aria-invalid={invalid || undefined} {disabled} readonly={readOnly} value={state.query} data-morfira-combobox-input="" oninput={(event) => { const next = event.currentTarget.value; requestQuery(next); activeId = undefined; requestOpen(true); runLoader(next); }} onblur={(event) => { inputProps?.onblur?.(event); if (!root.contains(event.relatedTarget as Node | null)) requestOpen(false); }} onkeydown={keydown} />
  <div id={state.listboxId} role="listbox" hidden={!state.open} data-morfira-combobox-listbox="">
    {#if busy}
      <div role="status">{#if loadingContent}{@render loadingContent()}{:else}Loading…{/if}</div>
    {:else if state.visibleOptions.length === 0}
      <div role="status">{#if empty}{@render empty()}{:else}No results{/if}</div>
    {/if}
    {#each state.visibleOptions as item (item.id)}
      <div id={item.id} role="option" tabindex="-1" aria-selected={item.value === state.selectedValue} aria-disabled={item.disabled || undefined} data-morfira-combobox-option="" data-active={item.id === state.activeId || undefined} data-selected={item.value === state.selectedValue || undefined} data-disabled={item.disabled || undefined} onpointerdown={(event) => { if (event.button === 0 && event.isPrimary) event.preventDefault(); }} onclick={() => select(item)} onkeydown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(item); } }}>{#if optionSnippet}{@render optionSnippet(item)}{:else}{item.label}{/if}</div>
    {/each}
  </div>
</div>
