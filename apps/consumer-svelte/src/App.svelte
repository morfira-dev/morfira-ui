<script lang="ts">
  import { Button } from '@morfira-dev/svelte/button';
  import { Dialog } from '@morfira-dev/svelte/dialog';
  import type { DialogProps } from '@morfira-dev/svelte/dialog';
  import { Field } from '@morfira-dev/svelte/field';
  import { Input } from '@morfira-dev/svelte/input';

  type DialogDismissReason = Parameters<
    NonNullable<DialogProps['onOpenChange']>
  >[1];

  let open = $state(true);
  let lastDismissReason = $state<DialogDismissReason | 'none'>('none');
  let deploymentName = $state('Morfira edge');
  let submissionCount = $state(0);

  const handleOpenChange = (
    nextOpen: boolean,
    reason: DialogDismissReason,
  ): void => {
    open = nextOpen;
    lastDismissReason = reason;
  };

  const reopen = (): void => {
    lastDismissReason = 'none';
    open = true;
  };

  const submitSimpleControls = (): void => {
    submissionCount += 1;
  };
</script>

{#snippet description()}
  This content is rendered on the server without an open attribute, then promoted to
  the native top layer during hydration.
{/snippet}

{#snippet body()}
  <p>
    The fixture imports the Dialog component and each CSS entrypoint through public
    package subpaths.
  </p>
  <p>
    Escape, the close control, and the cancel action exercise the shared dismissal
    contract.
  </p>
{/snippet}

{#snippet footer()}
  <button
    type="button"
    data-morfira-button=""
    data-variant="secondary"
    data-morfira-dialog-initial-focus=""
    onclick={() => (open = false)}
  >
    Review deployment
  </button>
  <button
    type="button"
    data-morfira-button=""
    data-variant="primary"
    onclick={() => (open = false)}
  >
    Confirm
  </button>
{/snippet}

<main>
  <section class="consumer-card" aria-labelledby="consumer-title">
    <p class="eyebrow">Svelte 5 consumer fixture</p>
    <h1 id="consumer-title">Native Dialog SSR and hydration</h1>
    <p>
      Server output starts with <code>data-state="open"</code> but no native
      <code>open</code> attribute. Hydration calls <code>showModal()</code> through the
      shared DOM enhancer.
    </p>
    <button
      type="button"
      data-morfira-button=""
      data-consumer-dialog-trigger=""
      onclick={reopen}
    >
      Open dialog
    </button>
    <output aria-live="polite" data-consumer-dismiss-reason="">
      Last dismissal: {lastDismissReason}
    </output>

    <section
      class="consumer-controls"
      aria-labelledby="consumer-controls-title"
      data-testid="consumer-svelte-simple-controls"
    >
      <h2 id="consumer-controls-title">Button, Field, and Input hydration</h2>
      <p>
        These controls are rendered on the server, then keep their bindings and event
        handlers after hydration.
      </p>
      <Field
        data-consumer-field=""
        data-testid="consumer-svelte-field"
        ids={{
          inputId: 'consumer-svelte-deployment',
          labelId: 'consumer-svelte-deployment-label',
          descriptionId: 'consumer-svelte-deployment-description',
        }}
        label="Deployment name"
        description="Enter the deployment captured by the hydrated action."
        required
      >
        <Input
          bind:value={deploymentName}
          data-consumer-input=""
          data-testid="consumer-svelte-input"
          name="deployment"
        />
      </Field>
      <Button
        data-consumer-button=""
        data-testid="consumer-svelte-submit"
        type="button"
        variant="secondary"
        onclick={submitSimpleControls}
      >
        Capture deployment
      </Button>
      <output
        aria-live="polite"
        data-consumer-button-count=""
        data-testid="consumer-svelte-button-count"
      >
        Activations: {submissionCount}
      </output>
      <output
        aria-live="polite"
        data-consumer-input-value=""
        data-testid="consumer-svelte-input-value"
      >
        Current value: {deploymentName}
      </output>
    </section>
  </section>

  <Dialog
    bind:open
    ids={{
      titleId: 'consumer-dialog-title',
      descriptionId: 'consumer-dialog-description',
    }}
    data-consumer-dialog="svelte"
    title="Hydrated deployment review"
    closeLabel="Close confirmation"
    size="md"
    closeOnBackdrop
    onOpenChange={handleOpenChange}
    {description}
    children={body}
    {footer}
  />
</main>
