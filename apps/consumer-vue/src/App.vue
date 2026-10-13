<script setup lang="ts">
import { Button } from '@morfira-dev/vue/button';
import { Accordion } from '@morfira-dev/vue/accordion';
import { Checkbox } from '@morfira-dev/vue/checkbox';
import { Dialog } from '@morfira-dev/vue/dialog';
import type { DialogProps } from '@morfira-dev/vue/dialog';
import { Field } from '@morfira-dev/vue/field';
import { Input } from '@morfira-dev/vue/input';
import { Popover } from '@morfira-dev/vue/popover';
import { Radio } from '@morfira-dev/vue/radio';
import { Select } from '@morfira-dev/vue/select';
import { Switch } from '@morfira-dev/vue/switch';
import { Tabs } from '@morfira-dev/vue/tabs';
import { Textarea } from '@morfira-dev/vue/textarea';
import { Tooltip } from '@morfira-dev/vue/tooltip';
import { onMounted, ref } from 'vue';

type DialogDismissReason = Parameters<NonNullable<DialogProps['onDismiss']>>[0];

const open = ref(true);
const lastDismissReason = ref<DialogDismissReason | 'none'>('none');
const initialFocus = ref<HTMLButtonElement | null>(null);
const returnFocus = ref<HTMLButtonElement | null>(null);
const activationCount = ref(0);
const deploymentName = ref('Morfira production');
const deploymentSlug = ref('morfira-production');
const hydrationState = ref<'server' | 'hydrated'>('server');
const approved = ref(false);
const cadence = ref('daily');
const notifications = ref(true);
const notes = ref('Ready for review');
const region = ref('eu');
const tooltipOpen = ref(false);
const popoverOpen = ref(false);
const selectedTab = ref('summary-tab');
const expandedSections = ref<readonly string[]>(['deployment-trigger']);

const tabItems = [
  {
    tabId: 'summary-tab',
    panelId: 'summary-panel',
    label: 'Summary',
    content: 'Deployment summary',
  },
  {
    tabId: 'history-tab',
    panelId: 'history-panel',
    label: 'History',
    content: 'Deployment history',
  },
] as const;

const accordionItems = [
  {
    triggerId: 'deployment-trigger',
    panelId: 'deployment-panel',
    title: 'Deployment',
    content: 'Deployment configuration',
  },
  {
    triggerId: 'security-trigger',
    panelId: 'security-panel',
    title: 'Security',
    content: 'Security configuration',
  },
] as const;

onMounted(() => {
  hydrationState.value = 'hydrated';
});

const resolveInitialFocus = (): HTMLButtonElement | null => initialFocus.value;
const resolveReturnFocus = (): HTMLButtonElement | null => returnFocus.value;

const handleDismiss = (reason: DialogDismissReason): void => {
  lastDismissReason.value = reason;
  open.value = false;
};

const reopen = (): void => {
  lastDismissReason.value = 'none';
  open.value = true;
};
</script>

<template>
  <main>
    <section class="consumer-card" aria-labelledby="consumer-title">
      <p class="eyebrow">Vue 3 consumer fixture</p>
      <h1 id="consumer-title">Native Dialog SSR and hydration</h1>
      <p>
        Server output starts with <code>data-state="open"</code> but no native
        <code>open</code> attribute. Hydration calls <code>showModal()</code> through
        the shared DOM enhancer.
      </p>

      <div class="consumer-controls">
        <Button
          data-consumer-button
          data-testid="consumer-button"
          name="reviewAction"
          variant="secondary"
          @click="activationCount += 1"
        >
          Record review
        </Button>
        <Button
          data-consumer-button-loading
          data-testid="consumer-button-loading"
          loading
          name="loadingAction"
          size="lg"
          variant="danger"
          @click="activationCount += 1"
        >
          Loading review
        </Button>
        <Button
          data-consumer-button-disabled
          data-testid="consumer-button-disabled"
          disabled
          name="disabledAction"
          @click="activationCount += 1"
        >
          Disabled review
        </Button>
        <output
          aria-live="polite"
          data-consumer-button-count
          data-testid="consumer-button-count"
        >
          Button activations: {{ activationCount }}
        </output>

        <Field
          :ids="{
            inputId: 'consumer-vue-deployment-name',
            labelId: 'consumer-vue-deployment-name-label',
            descriptionId: 'consumer-vue-deployment-name-description',
          }"
          data-consumer-field
          data-testid="consumer-field"
          label="Deployment name"
          description="Name shown in the deployment review."
          required
        >
          <Input
            v-model="deploymentName"
            autocomplete="organization"
            data-consumer-input
            data-testid="consumer-input"
            name="deploymentName"
          />
        </Field>
        <output
          aria-live="polite"
          data-consumer-input-value
          data-testid="consumer-input-value"
        >
          Input value: {{ deploymentName }}
        </output>

        <Field
          :ids="{
            inputId: 'consumer-vue-deployment-slug',
            labelId: 'consumer-vue-deployment-slug-label',
            descriptionId: 'consumer-vue-deployment-slug-description',
            validationMessageId: 'consumer-vue-deployment-slug-error',
          }"
          data-consumer-field-error
          data-testid="consumer-field-error"
          label="Deployment slug"
          description="Permanent deployment identifier."
          validation="error"
          validation-message="This slug is already in use."
          read-only
        >
          <Input
            v-model="deploymentSlug"
            autocomplete="off"
            data-consumer-input-error
            data-testid="consumer-input-error"
            name="deploymentSlug"
            placeholder="deployment-slug"
          />
        </Field>
        <output data-consumer-hydration-state data-testid="consumer-hydration-state">
          Hydration state: {{ hydrationState }}
        </output>

        <section class="consumer-phase-two" aria-labelledby="consumer-phase-two-title">
          <h2 id="consumer-phase-two-title">Phase 2 controls</h2>

          <label class="consumer-inline-control">
            <Checkbox v-model="approved" data-consumer-checkbox name="approved" />
            Approved
          </label>
          <output data-consumer-checkbox-value>Checkbox: {{ approved }}</output>

          <fieldset data-consumer-radio-group>
            <legend>Review cadence</legend>
            <label class="consumer-inline-control">
              <Radio
                v-model="cadence"
                data-consumer-radio-daily
                name="cadence"
                value="daily"
              />
              Daily
            </label>
            <label class="consumer-inline-control">
              <Radio
                v-model="cadence"
                data-consumer-radio-weekly
                name="cadence"
                value="weekly"
              />
              Weekly
            </label>
          </fieldset>
          <output data-consumer-radio-value>Radio: {{ cadence }}</output>

          <label class="consumer-inline-control">
            <Switch v-model="notifications" data-consumer-switch name="notifications" />
            Notifications
          </label>
          <output data-consumer-switch-value>Switch: {{ notifications }}</output>

          <Field
            :ids="{
              inputId: 'consumer-vue-notes',
              labelId: 'consumer-vue-notes-label',
              descriptionId: 'consumer-vue-notes-description',
            }"
            label="Review notes"
            description="Notes included with the review."
          >
            <Textarea v-model="notes" data-consumer-textarea name="notes" />
          </Field>
          <output data-consumer-textarea-value>Textarea: {{ notes }}</output>

          <Field
            :ids="{
              inputId: 'consumer-vue-region',
              labelId: 'consumer-vue-region-label',
            }"
            label="Region"
          >
            <Select v-model="region" data-consumer-select name="region">
              <option value="eu">Europe</option>
              <option value="us">United States</option>
            </Select>
          </Field>
          <output data-consumer-select-value>Select: {{ region }}</output>

          <Tooltip
            v-model="tooltipOpen"
            content-id="consumer-vue-tooltip-content"
            content="Tooltip details"
            :open-delay="0"
            :close-delay="0"
          >
            <button type="button" data-consumer-tooltip-trigger>Tooltip trigger</button>
          </Tooltip>
          <output data-consumer-tooltip-value>Tooltip: {{ tooltipOpen }}</output>

          <Popover
            v-model="popoverOpen"
            content-id="consumer-vue-popover-content"
            ariaLabel="Deployment actions"
            content="Popover actions"
          >
            <button type="button" data-consumer-popover-trigger>Popover trigger</button>
          </Popover>
          <output data-consumer-popover-value>Popover: {{ popoverOpen }}</output>

          <Tabs v-model="selectedTab" :items="tabItems" data-consumer-tabs />
          <output data-consumer-tabs-value>Tabs: {{ selectedTab }}</output>

          <Accordion
            v-model="expandedSections"
            :items="accordionItems"
            data-consumer-accordion
          />
          <output data-consumer-accordion-value>
            Accordion: {{ expandedSections.join(',') }}
          </output>
        </section>
      </div>

      <button
        ref="returnFocus"
        type="button"
        data-morfira-button
        data-consumer-dialog-trigger
        @click="reopen"
      >
        Open dialog
      </button>
      <output aria-live="polite" data-consumer-dismiss-reason>
        Last dismissal: {{ lastDismissReason }}
      </output>
    </section>

    <Dialog
      :open="open"
      :ids="{
        titleId: 'consumer-vue-dialog-title',
        descriptionId: 'consumer-vue-dialog-description',
      }"
      data-consumer-dialog="vue"
      title="Hydrated deployment review"
      description="This content is rendered on the server, then promoted to the native top layer during hydration."
      close-label="Close confirmation"
      size="md"
      close-on-backdrop
      :initial-focus="resolveInitialFocus"
      :return-focus="resolveReturnFocus"
      @dismiss="handleDismiss"
    >
      <p>
        The fixture imports the Dialog component and each CSS entrypoint through public
        package subpaths.
      </p>
      <p>
        Escape, the close control, and the review action exercise the shared dismissal
        contract.
      </p>

      <template #footer>
        <button
          ref="initialFocus"
          type="button"
          data-morfira-button
          data-variant="secondary"
          data-morfira-dialog-initial-focus
          @click="open = false"
        >
          Review deployment
        </button>
        <button
          type="button"
          data-morfira-button
          data-variant="primary"
          @click="open = false"
        >
          Confirm
        </button>
      </template>
    </Dialog>
  </main>
</template>
