<script lang="ts">
  import { resolveToastOptions } from '@morfira-dev/core/toast';
  import type { ToastDismissReason } from '@morfira-dev/core/toast';
  import { enhanceToast } from '@morfira-dev/dom/toast';
  import type { ToastController, ToastDomOptions } from '@morfira-dev/dom/toast';
  import type { Action } from 'svelte/action';
  import type { ToastProps } from './types.js';

  let {
    children,
    closeIcon,
    closeLabel,
    duration = 5000,
    element = $bindable(null),
    onDismiss,
    open = $bindable(true),
    title,
    tone = 'neutral',
    ...nativeProps
  }: ToastProps = $props();

  let controller: ToastController | undefined;
  const resolved = $derived(resolveToastOptions({ duration, open, tone }));
  const dismiss = (reason: ToastDismissReason): void => {
    open = false;
    onDismiss?.(reason);
  };
  const options = $derived<ToastDomOptions>({ ...resolved, onDismiss: dismiss });
  const toastAction: Action<HTMLElement, ToastDomOptions> = (node, initial) => {
    const instance = enhanceToast(node, initial);
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

<div
  {...nativeProps}
  bind:this={element}
  use:toastAction={options}
  role={resolved.role}
  aria-live={resolved.live}
  aria-atomic="true"
  hidden={!resolved.open}
  data-morfira-toast=""
  data-state={resolved.open ? 'open' : 'closed'}
  data-tone={resolved.tone}
  data-paused="false"
>
  <div data-morfira-toast-content="">
    {#if title}
      <div data-morfira-toast-title="">{@render title()}</div>
    {/if}
    <div data-morfira-toast-body="">{@render children()}</div>
  </div>
  {#if closeLabel}
    <button
      type="button"
      aria-label={closeLabel}
      data-morfira-toast-close=""
      onclick={() => controller?.requestDismiss('close-button')}
    >
      {#if closeIcon}
        {@render closeIcon()}
      {:else}
        <span aria-hidden="true">×</span>
      {/if}
    </button>
  {/if}
</div>

