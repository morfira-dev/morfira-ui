<script lang="ts">
  import { resolveRadioOptions } from '@morfira-dev/core/radio';
  import type { RadioProps } from './types.js';
  let { disabled, element = $bindable(null), group = $bindable(), onchange, required, size, value, ...nativeProps }: RadioProps = $props();
  const options = $derived(resolveRadioOptions({ checked: Object.is(group, value), disabled, required, size }));
</script>
<input {...nativeProps} bind:this={element} bind:group type="radio" {value} disabled={options.disabled} required={options.required} data-morfira-radio="" data-size={options.size} {onchange} />
