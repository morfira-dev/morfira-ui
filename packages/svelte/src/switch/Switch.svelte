<script lang="ts">
  import { resolveSwitchOptions } from '@morfira-dev/core/switch';
  import type { SwitchProps } from './types.js';
  let { checked = $bindable(false), disabled, element = $bindable(null), required, size, ...nativeProps }: SwitchProps = $props();
  const options = $derived(resolveSwitchOptions({ checked, disabled, required, size }));

  $effect(() => {
    const input = element;
    const form = input?.form;
    if (!input || !form) return;

    let active = true;
    const handleReset = (event: Event): void => {
      queueMicrotask(() => {
        if (active && !event.defaultPrevented) checked = input.checked;
      });
    };
    form.addEventListener('reset', handleReset);
    return () => {
      active = false;
      form.removeEventListener('reset', handleReset);
    };
  });
</script>
<input {...nativeProps} bind:this={element} bind:checked type="checkbox" role="switch" disabled={options.disabled} required={options.required} aria-checked={options.ariaChecked} data-morfira-switch="" data-size={options.size} data-checked={options.checked ? '' : undefined} />
