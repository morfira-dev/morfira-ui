<script lang="ts">
  import { resolveFieldOptions } from '@morfira-dev/core/field';
  import { setContext } from 'svelte';
  import { fieldContextKey } from './context.js';
  import type { FieldContext } from './context.js';
  import type { FieldProps } from './types.js';

  let {
    children,
    description,
    disabled,
    ids,
    label,
    prefix,
    readOnly,
    required,
    size,
    suffix,
    validation,
    validationMessage,
    ...nativeProps
  }: FieldProps = $props();

  const options = $derived(
    resolveFieldOptions({ disabled, ids, readOnly, required, size, validation }),
  );

  setContext<FieldContext>(fieldContextKey, () => options);
</script>

<div
  {...nativeProps}
  data-morfira-field=""
  data-size={options.size}
  data-validation={options.validation}
  data-disabled={options.disabled ? '' : undefined}
  data-readonly={options.readOnly ? '' : undefined}
  data-required={options.required ? '' : undefined}
>
  <label
    id={options.ids.labelId}
    for={options.ids.inputId}
    data-morfira-field-label=""
  >
    {label}
    {#if options.required}
      <span aria-hidden="true" data-morfira-field-required="">*</span>
    {/if}
  </label>
  <div data-morfira-field-control="">
    {#if prefix}
      <span data-morfira-field-prefix="">{@render prefix()}</span>
    {/if}
    {@render children()}
    {#if suffix}
      <span data-morfira-field-suffix="">{@render suffix()}</span>
    {/if}
  </div>
  {#if description !== undefined && options.ids.descriptionId !== undefined}
    <div
      id={options.ids.descriptionId}
      data-morfira-field-message=""
      data-message-kind="helper"
    >
      {description}
    </div>
  {/if}
  {#if validationMessage !== undefined && options.validation !== 'none' && options.ids.validationMessageId !== undefined}
    <div
      id={options.ids.validationMessageId}
      data-morfira-field-message=""
      data-message-kind={options.validation}
    >
      {validationMessage}
    </div>
  {/if}
</div>
