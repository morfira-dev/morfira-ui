<script lang="ts">
  import { resolveDialogOptions } from '@morfira-dev/core/dialog';
  import type { DialogDismissReason } from '@morfira-dev/core/dialog';
  import { enhanceDialog } from '@morfira-dev/dom/dialog';
  import type {
    DialogController,
    DialogDomOptions,
  } from '@morfira-dev/dom/dialog';
  import type { Action } from 'svelte/action';
  import type { DialogProps } from './types.js';

  let {
    children,
    closeIcon,
    closeLabel,
    closeOnBackdrop,
    closeOnEscape,
    description,
    element = $bindable(null),
    footer,
    ids,
    initialFocus,
    lockScroll,
    onDismiss,
    onOpenChange,
    open = $bindable(false),
    restoreFocus,
    returnFocus,
    size,
    title,
    ...nativeProps
  }: DialogProps = $props();

  let controller: DialogController | undefined;

  const resolved = $derived.by(() => {
    if ((description === undefined) !== (ids.descriptionId === undefined)) {
      throw new TypeError(
        'Dialog description and ids.descriptionId must be provided together.',
      );
    }

    return resolveDialogOptions({
      closeOnBackdrop,
      closeOnEscape,
      ids,
      lockScroll,
      open,
      restoreFocus,
      size,
    });
  });

  const handleDismiss = (reason: DialogDismissReason): void => {
    open = false;
    onDismiss?.(reason);
    onOpenChange?.(false, reason);
  };

  const dialogOptions = $derived<DialogDomOptions>({
    ...resolved,
    initialFocus,
    onDismiss: handleDismiss,
    returnFocus,
  });

  const dialogAction: Action<HTMLDialogElement, DialogDomOptions> = (
    node,
    options,
  ) => {
    const instance = enhanceDialog(node, options);
    controller = instance;

    return {
      update(nextOptions): void {
        instance.update(nextOptions);
      },
      destroy(): void {
        instance.destroy();
        if (controller === instance) {
          controller = undefined;
        }
      },
    };
  };

  const close = (): void => {
    controller?.requestClose('close-button');
  };
</script>

<dialog
  {...nativeProps}
  bind:this={element}
  use:dialogAction={dialogOptions}
  aria-modal="true"
  aria-labelledby={resolved.ids.titleId}
  aria-describedby={resolved.ids.descriptionId}
  data-morfira-dialog=""
  data-size={resolved.size}
  data-state={resolved.open ? 'open' : 'closed'}
  tabindex="-1"
>
  <header data-morfira-dialog-header="">
    <div>
      <h2 id={resolved.ids.titleId} data-morfira-dialog-title="">{title}</h2>
      {#if description && resolved.ids.descriptionId}
        <div
          id={resolved.ids.descriptionId}
          data-morfira-dialog-description=""
        >
          {@render description()}
        </div>
      {/if}
    </div>
    <button
      type="button"
      aria-label={closeLabel}
      data-morfira-dialog-close=""
      onclick={close}
    >
      {#if closeIcon}
        {@render closeIcon()}
      {:else}
        <span aria-hidden="true">×</span>
      {/if}
    </button>
  </header>

  <div data-morfira-dialog-body="">{@render children()}</div>

  {#if footer}
    <footer data-morfira-dialog-footer="">{@render footer()}</footer>
  {/if}
</dialog>
