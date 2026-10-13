<script lang="ts">
  import { resolveInputOptions } from '@morfira-dev/core/input';
  import { getContext } from 'svelte';
  import { fieldContextKey } from '../field/context.js';
  import type { FieldContext } from '../field/context.js';
  import type { InputProps } from './types.js';

  let {
    disabled,
    element = $bindable(null),
    readOnly,
    required,
    size,
    validation,
    value = $bindable(),
    ...nativeProps
  }: InputProps = $props();

  const field = getContext<FieldContext | undefined>(fieldContextKey);
  const options = $derived(
    field?.() ??
      resolveInputOptions({ disabled, readOnly, required, size, validation }),
  );
</script>

<input
  {...nativeProps}
  bind:this={element}
  bind:value
  id={field?.().ids.inputId ?? nativeProps.id}
  disabled={options.disabled}
  readonly={options.readOnly}
  required={options.required}
  aria-invalid={options.ariaInvalid}
  aria-labelledby={field?.().ids.labelId}
  aria-describedby={field?.().describedBy}
  aria-errormessage={field?.().errorMessageId}
  data-morfira-input=""
  data-size={options.size}
  data-validation={options.validation}
/>
