<script lang="ts">
  import { resolveDrawerOptions } from '@morfira-dev/core/drawer';
  import type { DrawerDismissReason } from '@morfira-dev/core/drawer';
  import { enhanceDrawer } from '@morfira-dev/dom/drawer';
  import type { DrawerController, DrawerDomOptions } from '@morfira-dev/dom/drawer';
  import type { Action } from 'svelte/action';
  import type { DrawerProps } from './types.js';

  let {
    children,
    closeIcon,
    closeLabel,
    closeOnBackdrop = false,
    closeOnEscape = true,
    description,
    element = $bindable(null),
    footer,
    ids,
    initialFocus,
    lockScroll = true,
    modal = true,
    onDismiss,
    open = $bindable(false),
    restoreFocus = true,
    returnFocus,
    side = 'inline-end',
    size = 'md',
    title,
    ...nativeProps
  }: DrawerProps = $props();

  let controller: DrawerController | undefined;
  const resolved = $derived.by(() => {
    if ((description === undefined) !== (ids.descriptionId === undefined)) {
      throw new TypeError(
        'Drawer description and ids.descriptionId must be provided together.',
      );
    }
    return resolveDrawerOptions({
      closeOnBackdrop,
      closeOnEscape,
      ids,
      lockScroll,
      modal,
      open,
      restoreFocus,
      side,
      size,
    });
  });
  const dismiss = (reason: DrawerDismissReason): void => {
    open = false;
    onDismiss?.(reason);
  };
  const options = $derived<DrawerDomOptions>({
    ...resolved,
    ...(initialFocus === undefined ? {} : { initialFocus }),
    onDismiss: dismiss,
    ...(returnFocus === undefined ? {} : { returnFocus }),
  });
  const drawerAction: Action<HTMLDialogElement, DrawerDomOptions> = (
    node,
    initial,
  ) => {
    const instance = enhanceDrawer(node, initial);
    controller = instance;
    return {
      update(next) { instance.update(next); },
      destroy() {
        instance.destroy();
        if (controller === instance) controller = undefined;
      },
    };
  };
</script>

<dialog
  {...nativeProps}
  bind:this={element}
  use:drawerAction={options}
  aria-modal={resolved.modal ? 'true' : undefined}
  aria-labelledby={resolved.ids.titleId}
  aria-describedby={resolved.ids.descriptionId}
  tabindex="-1"
  data-morfira-drawer=""
  data-state={resolved.open ? 'open' : 'closed'}
  data-modal={String(resolved.modal)}
  data-side={resolved.side}
  data-size={resolved.size}
>
  <header data-morfira-drawer-header="">
    <div>
      <h2 id={resolved.ids.titleId} data-morfira-drawer-title="">{title}</h2>
      {#if description && resolved.ids.descriptionId}
        <div id={resolved.ids.descriptionId} data-morfira-drawer-description="">
          {@render description()}
        </div>
      {/if}
    </div>
    <button
      type="button"
      aria-label={closeLabel}
      data-morfira-drawer-close=""
      onclick={() => controller?.requestClose('close-button')}
    >
      {#if closeIcon}
        {@render closeIcon()}
      {:else}
        <span aria-hidden="true">×</span>
      {/if}
    </button>
  </header>
  <div data-morfira-drawer-body="">{@render children()}</div>
  {#if footer}
    <footer data-morfira-drawer-footer="">{@render footer()}</footer>
  {/if}
</dialog>

