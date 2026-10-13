<script lang="ts">
  import { resolveSelectOptions } from '@morfira-dev/core/select';
  import { getContext } from 'svelte';
  import { fieldContextKey } from '../field/context.js';
  import type { FieldContext } from '../field/context.js';
  import type { SelectProps } from './types.js';
  let { children, disabled, element = $bindable(null), multiple, onchange, required, size, validation, value = $bindable(), visibleRows, ...nativeProps }: SelectProps = $props();
  const field = getContext<FieldContext | undefined>(fieldContextKey);
  const own = $derived(resolveSelectOptions({ disabled, multiple, required, size, validation, visibleRows }));
  const options = $derived(field?.() ? { ...own, ...field?.() } : own);
</script>
<select {...nativeProps} bind:this={element} {value} id={field?.().ids.inputId ?? nativeProps.id} disabled={options.disabled} required={options.required} multiple={own.multiple} size={own.visibleRows} aria-invalid={options.ariaInvalid} aria-labelledby={field?.().ids.labelId} aria-describedby={field?.().describedBy} aria-errormessage={field?.().errorMessageId} data-morfira-select="" data-size={options.size} data-validation={options.validation} data-multiple={own.multiple ? '' : undefined} onchange={(event) => { value = own.multiple ? Array.from(event.currentTarget.selectedOptions, (option) => option.value) : event.currentTarget.value; onchange?.(event); }}>{#if children}{@render children()}{/if}</select>
