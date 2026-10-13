<script lang="ts">
  import Combobox from '../combobox/Combobox.svelte';
  import type { AutocompleteProps } from './types.js';
  let { defaultValue = '', onOptionSelect, onValueChange, options, value = $bindable(defaultValue), ...props }: AutocompleteProps = $props();
  let selectedValue = $state('');
  $effect(() => { const item = options.find((option) => option.value === selectedValue); if (item) onOptionSelect?.(item); });
</script>
<Combobox {...props} {options} bind:query={value} bind:selectedValue onQueryChange={onValueChange} />
