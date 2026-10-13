<script lang="ts">
  import { resolveTextareaOptions } from '@morfira-dev/core/textarea';
  import { getContext } from 'svelte';
  import { fieldContextKey } from '../field/context.js';
  import type { FieldContext } from '../field/context.js';
  import type { TextareaProps } from './types.js';
  let { disabled, element = $bindable(null), readOnly, required, resize, size, validation, value = $bindable(), ...nativeProps }: TextareaProps = $props();
  const field = getContext<FieldContext | undefined>(fieldContextKey);
  const own = $derived(resolveTextareaOptions({ disabled, readOnly, required, resize, size, validation }));
  const options = $derived(field?.() ? { ...own, ...field?.() } : own);
</script>
<textarea {...nativeProps} bind:this={element} bind:value id={field?.().ids.inputId ?? nativeProps.id} disabled={options.disabled} readonly={options.readOnly} required={options.required} aria-invalid={options.ariaInvalid} aria-labelledby={field?.().ids.labelId} aria-describedby={field?.().describedBy} aria-errormessage={field?.().errorMessageId} data-morfira-textarea="" data-size={options.size} data-validation={options.validation} data-resize={own.resize}></textarea>
