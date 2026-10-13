import { Button } from '@morfira-dev/react/button';
import { Dialog } from '@morfira-dev/react/dialog';
import type { DialogProps } from '@morfira-dev/react/dialog';
import { Field } from '@morfira-dev/react/field';
import { Input } from '@morfira-dev/react/input';
import { useRef, useState, type ReactElement } from 'react';

type DialogDismissReason = Parameters<NonNullable<DialogProps['onDismiss']>>[0];

export interface AppProps {
  readonly initialOpen: boolean;
}

export function App({ initialOpen }: AppProps): ReactElement {
  const [open, setOpen] = useState(initialOpen);
  const [dismissReason, setDismissReason] = useState<DialogDismissReason | undefined>();
  const [projectName, setProjectName] = useState('morfira-ui');
  const [buttonPressCount, setButtonPressCount] = useState(0);
  const initialFocus = useRef<HTMLButtonElement | null>(null);
  const returnFocus = useRef<HTMLButtonElement | null>(null);

  const handleDismiss = (reason: DialogDismissReason): void => {
    setDismissReason(reason);
    setOpen(false);
  };

  return (
    <main>
      <h1>React component consumer</h1>
      <section aria-labelledby="consumer-react-form-title">
        <h2 id="consumer-react-form-title">Project settings</h2>
        <Field
          ids={{
            inputId: 'consumer-react-project-name',
            labelId: 'consumer-react-project-name-label',
            descriptionId: 'consumer-react-project-name-description',
          }}
          label="Project name"
          description="Used to verify deterministic server markup and hydrated input."
          required
          suffix=".morfira.dev"
          data-consumer-field=""
          data-testid="consumer-field"
        >
          <Input
            name="projectName"
            value={projectName}
            onChange={(event): void => {
              setProjectName(event.currentTarget.value);
            }}
            data-consumer-input=""
            data-testid="consumer-input"
          />
        </Field>
        <output data-consumer-input-value="" data-testid="consumer-input-value">
          {projectName}
        </output>
        <Button
          variant="secondary"
          data-consumer-button=""
          data-testid="consumer-button"
          onClick={(): void => {
            setButtonPressCount((count) => count + 1);
          }}
        >
          Save project
        </Button>
        <Button
          loading
          data-consumer-button-loading=""
          onClick={(): void => {
            setButtonPressCount((count) => count + 1);
          }}
        >
          Saving project
        </Button>
        <Button
          disabled
          data-consumer-button-disabled=""
          onClick={(): void => {
            setButtonPressCount((count) => count + 1);
          }}
        >
          Save unavailable
        </Button>
        <output data-consumer-button-count="" data-testid="consumer-button-count">
          {buttonPressCount}
        </output>
        <Field
          ids={{
            inputId: 'consumer-react-project-slug',
            labelId: 'consumer-react-project-slug-label',
            descriptionId: 'consumer-react-project-slug-description',
            validationMessageId: 'consumer-react-project-slug-error',
          }}
          label="Project slug"
          description="Lowercase letters and hyphens only."
          validation="error"
          validationMessage="This slug is already in use."
          readOnly
          data-consumer-field-error=""
        >
          <Input
            name="projectSlug"
            value="morfira-ui"
            onChange={(): void => undefined}
            data-consumer-input-error=""
          />
        </Field>
      </section>

      <button
        ref={returnFocus}
        type="button"
        autoFocus
        data-consumer-dialog-trigger=""
        onClick={(): void => {
          setOpen(true);
        }}
      >
        Open dialog
      </button>
      <output data-consumer-dismiss-reason="">{dismissReason ?? 'none'}</output>

      <Dialog
        open={open}
        ids={{
          titleId: 'consumer-react-dialog-title',
          descriptionId: 'consumer-react-dialog-description',
        }}
        title="Confirm production change"
        description="Review the deployment before continuing."
        closeLabel="Close confirmation"
        initialFocus={initialFocus}
        returnFocus={returnFocus}
        onDismiss={handleDismiss}
        footer={<span>All fields are required.</span>}
        data-consumer-dialog="react"
      >
        <button ref={initialFocus} type="button">
          Review deployment
        </button>
      </Dialog>
    </main>
  );
}
