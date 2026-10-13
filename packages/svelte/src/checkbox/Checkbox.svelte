<script lang="ts">
  import { resolveCheckboxOptions } from '@morfira-dev/core/checkbox';
  import type { CheckboxProps } from './types.js';

  let { checked = $bindable(false), disabled, element = $bindable(null), indeterminate, required, size, ...nativeProps }: CheckboxProps = $props();
  const options = $derived(resolveCheckboxOptions({ checked, disabled, indeterminate, required, size }));
  $effect(() => { if (element) element.indeterminate = options.indeterminate; });
</script>

<input {...nativeProps} bind:this={element} bind:checked type="checkbox" disabled={options.disabled} required={options.required} aria-checked={options.ariaChecked} data-morfira-checkbox="" data-size={options.size} data-indeterminate={options.indeterminate ? '' : undefined} />
