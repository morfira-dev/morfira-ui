<script setup lang="ts">
import { Button } from '@morfira-dev/vue/button';
import { Dialog } from '@morfira-dev/vue/dialog';
import type { DialogProps } from '@morfira-dev/vue/dialog';
import { Field } from '@morfira-dev/vue/field';
import { Input } from '@morfira-dev/vue/input';
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
