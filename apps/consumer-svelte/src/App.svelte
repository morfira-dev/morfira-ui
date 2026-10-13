<script lang="ts">
  import { Button } from '@morfira-dev/svelte/button';
  import { Checkbox } from '@morfira-dev/svelte/checkbox';
  import { Dialog } from '@morfira-dev/svelte/dialog';
  import type { DialogProps } from '@morfira-dev/svelte/dialog';
  import { Field } from '@morfira-dev/svelte/field';
  import { Input } from '@morfira-dev/svelte/input';
  import { Radio } from '@morfira-dev/svelte/radio';
  import { Switch } from '@morfira-dev/svelte/switch';
  import { Textarea } from '@morfira-dev/svelte/textarea';
  import { Select } from '@morfira-dev/svelte/select';
  import { Tooltip } from '@morfira-dev/svelte/tooltip';
  import { Popover } from '@morfira-dev/svelte/popover';
  import { Tabs } from '@morfira-dev/svelte/tabs';
  import { Accordion } from '@morfira-dev/svelte/accordion';

  type DialogDismissReason = Parameters<
    NonNullable<DialogProps['onOpenChange']>
  >[1];

  let open = $state(true);
  let lastDismissReason = $state<DialogDismissReason | 'none'>('none');
  let deploymentName = $state('Morfira edge');
  let submissionCount = $state(0);
  let notificationsEnabled = $state(false);
  let deploymentChannel = $state<'stable' | 'preview'>('stable');
  let automaticRollback = $state(true);
  let releaseNotes = $state('Ready for production.');
  let region = $state('eu-central');
  let tooltipOpen = $state(false);
  let popoverOpen = $state(false);
  let selectedTab = $state('consumer-tab-overview');
  let expandedSections = $state<readonly string[]>([
    'consumer-accordion-runtime-trigger',
  ]);

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

{#snippet selectOptions()}
  <option value="eu-central">EU Central</option>
  <option value="us-east">US East</option>
{/snippet}

{#snippet tooltipTrigger()}
  Deployment health
{/snippet}

{#snippet tooltipContent()}
  <span data-consumer-tooltip-content="">All production checks passed.</span>
{/snippet}

{#snippet popoverTrigger()}
  Deployment details
{/snippet}

{#snippet popoverContent()}
  <div data-consumer-popover-content="">
    <p>Release 24 is ready for the selected region.</p>
    <button type="button" onclick={() => (popoverOpen = false)}>Close details</button>
  </div>
{/snippet}

{#snippet overviewLabel()}
  Overview
{/snippet}

{#snippet overviewContent()}
  <p data-consumer-tab-panel="overview">Production overview is active.</p>
{/snippet}

{#snippet historyLabel()}
  History
{/snippet}

{#snippet historyContent()}
  <p data-consumer-tab-panel="history">Deployment history is active.</p>
{/snippet}

{#snippet runtimeTitle()}
  Runtime
{/snippet}

{#snippet runtimeContent()}
  <p data-consumer-accordion-panel="runtime">Node 24 LTS</p>
{/snippet}

{#snippet supportTitle()}
  Support window
{/snippet}

{#snippet supportContent()}
  <p data-consumer-accordion-panel="support">Twenty-four months</p>
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
      <Button
        data-consumer-button-loading=""
        type="button"
        loading
        onclick={submitSimpleControls}
      >
        Capturing deployment
      </Button>
      <Button
        data-consumer-button-disabled=""
        type="button"
        disabled
        onclick={submitSimpleControls}
      >
        Capture unavailable
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
      <Field
        data-consumer-field-error=""
        ids={{
          inputId: 'consumer-svelte-deployment-slug',
          labelId: 'consumer-svelte-deployment-slug-label',
          descriptionId: 'consumer-svelte-deployment-slug-description',
          validationMessageId: 'consumer-svelte-deployment-slug-error',
        }}
        label="Deployment slug"
        description="Lowercase letters and hyphens only."
        validation="error"
        validationMessage="This deployment slug is already in use."
        readOnly
      >
        <Input
          value="morfira-edge"
          data-consumer-input-error=""
          name="deploymentSlug"
        />
      </Field>
    </section>

    <section
      class="consumer-controls"
      aria-labelledby="consumer-phase-two-title"
      data-consumer-phase-two=""
    >
      <h2 id="consumer-phase-two-title">Phase 2 SSR and hydration</h2>
      <p>
        Native form controls and composite interactions render through public Svelte
        package subpaths and remain interactive after hydration.
      </p>

      <label class="consumer-choice">
        <Checkbox
          bind:checked={notificationsEnabled}
          data-consumer-checkbox=""
          name="notifications"
        />
        Deployment notifications
      </label>
      <output data-consumer-checkbox-state="">
        Notifications: {notificationsEnabled ? 'on' : 'off'}
      </output>

      <fieldset data-consumer-radio-group="">
        <legend>Deployment channel</legend>
        <label class="consumer-choice">
          <Radio
            bind:group={deploymentChannel}
            data-consumer-radio="stable"
            name="deployment-channel"
            value="stable"
          />
          Stable
        </label>
        <label class="consumer-choice">
          <Radio
            bind:group={deploymentChannel}
            data-consumer-radio="preview"
            name="deployment-channel"
            value="preview"
          />
          Preview
        </label>
      </fieldset>
      <output data-consumer-radio-state="">Channel: {deploymentChannel}</output>

      <label class="consumer-choice">
        <Switch
          bind:checked={automaticRollback}
          data-consumer-switch=""
          name="automaticRollback"
        />
        Automatic rollback
      </label>
      <output data-consumer-switch-state="">
        Rollback: {automaticRollback ? 'enabled' : 'disabled'}
      </output>

      <label for="consumer-release-notes">Release notes</label>
      <Textarea
        bind:value={releaseNotes}
        data-consumer-textarea=""
        id="consumer-release-notes"
        name="releaseNotes"
        rows={3}
      />
      <output data-consumer-textarea-state="">Notes: {releaseNotes}</output>

      <label for="consumer-region">Region</label>
      <Select
        bind:value={region}
        data-consumer-select=""
        id="consumer-region"
        name="region"
        children={selectOptions}
      />
      <output data-consumer-select-state="">Region: {region}</output>

      <div class="consumer-composites">
        <Tooltip
          bind:open={tooltipOpen}
          data-consumer-tooltip-trigger=""
          contentId="consumer-tooltip-content"
          children={tooltipTrigger}
          content={tooltipContent}
        />
        <output data-consumer-tooltip-state="">
          Tooltip: {tooltipOpen ? 'open' : 'closed'}
        </output>

        <Popover
          bind:open={popoverOpen}
          data-consumer-popover-trigger=""
          ariaLabel="Deployment details"
          contentId="consumer-popover-content"
          children={popoverTrigger}
          content={popoverContent}
        />
        <output data-consumer-popover-state="">
          Popover: {popoverOpen ? 'open' : 'closed'}
        </output>
      </div>

      <Tabs
        bind:selectedId={selectedTab}
        data-consumer-tabs=""
        items={[
          {
            tabId: 'consumer-tab-overview',
            panelId: 'consumer-panel-overview',
            label: overviewLabel,
            content: overviewContent,
          },
          {
            tabId: 'consumer-tab-history',
            panelId: 'consumer-panel-history',
            label: historyLabel,
            content: historyContent,
          },
        ]}
      />
      <output data-consumer-tabs-state="">Selected tab: {selectedTab}</output>

      <Accordion
        bind:expandedIds={expandedSections}
        data-consumer-accordion=""
        multiple
        items={[
          {
            triggerId: 'consumer-accordion-runtime-trigger',
            panelId: 'consumer-accordion-runtime-panel',
            title: runtimeTitle,
            content: runtimeContent,
          },
          {
            triggerId: 'consumer-accordion-support-trigger',
            panelId: 'consumer-accordion-support-panel',
            title: supportTitle,
            content: supportContent,
          },
        ]}
      />
      <output data-consumer-accordion-state="">
        Expanded sections: {expandedSections.join(',') || 'none'}
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
