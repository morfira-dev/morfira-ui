<script lang="ts">
  import { resolveTableOptions } from '@morfira-dev/core/table';
  import type { TableProps } from './types.js';

  let { children, density, element = $bindable(null), hoverable, stickyHeader, striped, ...nativeProps }: TableProps = $props();
  const options = $derived(resolveTableOptions({ density, hoverable, stickyHeader, striped }));
</script>

<table
  {...nativeProps}
  bind:this={element}
  data-morfira-table=""
  data-density={options.density}
  data-striped={options.striped ? '' : undefined}
  data-hoverable={options.hoverable ? '' : undefined}
  data-sticky-header={options.stickyHeader ? '' : undefined}
>
  {#if children}{@render children()}{/if}
</table>
