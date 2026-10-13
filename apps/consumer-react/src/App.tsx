import { Accordion } from '@morfira-dev/react/accordion';
import { Autocomplete } from '@morfira-dev/react/autocomplete';
import { Button } from '@morfira-dev/react/button';
import { Checkbox } from '@morfira-dev/react/checkbox';
import { Combobox } from '@morfira-dev/react/combobox';
import { Dialog } from '@morfira-dev/react/dialog';
import type { DialogProps } from '@morfira-dev/react/dialog';
import { Drawer } from '@morfira-dev/react/drawer';
import { Dropdown } from '@morfira-dev/react/dropdown';
import { Field } from '@morfira-dev/react/field';
import { Input } from '@morfira-dev/react/input';
import { Menu } from '@morfira-dev/react/menu';
import { Popover } from '@morfira-dev/react/popover';
import { Radio } from '@morfira-dev/react/radio';
import { Select } from '@morfira-dev/react/select';
import { Switch } from '@morfira-dev/react/switch';
import { Table } from '@morfira-dev/react/table';
import { Tabs } from '@morfira-dev/react/tabs';
import { Textarea } from '@morfira-dev/react/textarea';
import { Toast } from '@morfira-dev/react/toast';
import { Tooltip } from '@morfira-dev/react/tooltip';
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
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('stable');
  const [switchChecked, setSwitchChecked] = useState(false);
  const [notes, setNotes] = useState('Ready for review.');
  const [region, setRegion] = useState('eu');
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview-tab');
  const [expandedAccordionIds, setExpandedAccordionIds] = useState<readonly string[]>([
    'requirements-trigger',
  ]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState('none');
  const [environmentQuery, setEnvironmentQuery] = useState('Development');
  const [environment, setEnvironment] = useState('development');
  const [owner, setOwner] = useState('');
  const [toastOpen, setToastOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const initialFocus = useRef<HTMLButtonElement | null>(null);
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const drawerReturnFocus = useRef<HTMLButtonElement | null>(null);

  const menuItems = [
    { id: 'react-action-review', label: 'Review release', textValue: 'Review release' },
    {
      id: 'react-action-approve',
      label: 'Approve release',
      textValue: 'Approve release',
    },
    {
      id: 'react-action-delete',
      label: 'Delete release',
      textValue: 'Delete release',
      disabled: true,
    },
  ] as const;
  const dropdownItems = [
    {
      id: 'react-dropdown-review',
      label: 'Review release',
      textValue: 'Review release',
    },
    {
      id: 'react-dropdown-approve',
      label: 'Approve release',
      textValue: 'Approve release',
    },
    {
      id: 'react-dropdown-delete',
      label: 'Delete release',
      textValue: 'Delete release',
      disabled: true,
    },
  ] as const;
  const environmentOptions = [
    { id: 'react-environment-development', value: 'development', label: 'Development' },
    { id: 'react-environment-staging', value: 'staging', label: 'Staging' },
    { id: 'react-environment-production', value: 'production', label: 'Production' },
  ] as const;

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

      <section aria-labelledby="consumer-react-phase2-title" data-consumer-phase2="">
        <h2 id="consumer-react-phase2-title">Phase 2 controls</h2>

        <fieldset>
          <legend>Native choices</legend>
          <label>
            <Checkbox
              name="approval"
              value="approved"
              checked={checkboxChecked}
              data-consumer-checkbox=""
              onChange={(event): void => {
                setCheckboxChecked(event.currentTarget.checked);
              }}
            />
            Approved
          </label>
          <output data-consumer-checkbox-state="">
            {checkboxChecked ? 'checked' : 'unchecked'}
          </output>

          <label>
            <Radio
              name="releaseChannel"
              value="stable"
              checked={radioValue === 'stable'}
              data-consumer-radio-stable=""
              onChange={(event): void => {
                if (event.currentTarget.checked) setRadioValue('stable');
              }}
            />
            Stable
          </label>
          <label>
            <Radio
              name="releaseChannel"
              value="preview"
              checked={radioValue === 'preview'}
              data-consumer-radio-preview=""
              onChange={(event): void => {
                if (event.currentTarget.checked) setRadioValue('preview');
              }}
            />
            Preview
          </label>
          <output data-consumer-radio-state="">{radioValue}</output>

          <label>
            <Switch
              name="notifications"
              value="enabled"
              checked={switchChecked}
              data-consumer-switch=""
              onChange={(event): void => {
                setSwitchChecked(event.currentTarget.checked);
              }}
            />
            Deployment notifications
          </label>
          <output data-consumer-switch-state="">{switchChecked ? 'on' : 'off'}</output>
        </fieldset>

        <Field
          ids={{
            inputId: 'consumer-react-notes',
            labelId: 'consumer-react-notes-label',
            descriptionId: 'consumer-react-notes-description',
          }}
          label="Release notes"
          description="Summarize the release for reviewers."
        >
          <Textarea
            name="notes"
            value={notes}
            data-consumer-textarea=""
            onChange={(event): void => {
              setNotes(event.currentTarget.value);
            }}
          />
        </Field>
        <output data-consumer-textarea-value="">{notes}</output>

        <Field
          ids={{
            inputId: 'consumer-react-region',
            labelId: 'consumer-react-region-label',
          }}
          label="Release region"
        >
          <Select
            name="region"
            value={region}
            data-consumer-select=""
            onChange={(event): void => {
              setRegion(event.currentTarget.value);
            }}
          >
            <option value="eu">Europe</option>
            <option value="us">United States</option>
          </Select>
        </Field>
        <output data-consumer-select-value="">{region}</output>

        <Tooltip
          contentId="consumer-react-tooltip"
          content={
            <span data-consumer-tooltip-content="">Deployment help is available.</span>
          }
          open={tooltipOpen}
          onOpenChange={(nextOpen): void => {
            setTooltipOpen(nextOpen);
          }}
        >
          <button type="button" data-consumer-tooltip-trigger="">
            Deployment help
          </button>
        </Tooltip>
        <output data-consumer-tooltip-state="">
          {tooltipOpen ? 'open' : 'closed'}
        </output>

        <Popover
          contentId="consumer-react-popover"
          ariaLabel="Deployment actions"
          content={
            <div data-consumer-popover-content="">
              <button type="button">Schedule deployment</button>
            </div>
          }
          open={popoverOpen}
          onOpenChange={(nextOpen): void => {
            setPopoverOpen(nextOpen);
          }}
        >
          <button type="button" data-consumer-popover-trigger="">
            Deployment actions
          </button>
        </Popover>
        <output data-consumer-popover-state="">
          {popoverOpen ? 'open' : 'closed'}
        </output>

        <Tabs
          data-consumer-tabs=""
          selectedId={selectedTab}
          onSelectedChange={setSelectedTab}
          items={[
            {
              tabId: 'overview-tab',
              panelId: 'overview-panel',
              label: 'Overview',
              content: 'Deployment overview.',
            },
            {
              tabId: 'activity-tab',
              panelId: 'activity-panel',
              label: 'Activity',
              content: 'Recent deployment activity.',
            },
          ]}
        />
        <output data-consumer-tabs-state="">{selectedTab}</output>

        <Accordion
          data-consumer-accordion=""
          expandedIds={expandedAccordionIds}
          onExpandedChange={setExpandedAccordionIds}
          items={[
            {
              triggerId: 'requirements-trigger',
              panelId: 'requirements-panel',
              title: 'Requirements',
              content: 'All automated gates must pass.',
            },
            {
              triggerId: 'rollback-trigger',
              panelId: 'rollback-panel',
              title: 'Rollback',
              content: 'The previous release remains available.',
            },
          ]}
        />
        <output data-consumer-accordion-state="">
          {expandedAccordionIds.join(',') || 'none'}
        </output>
      </section>

      <section aria-labelledby="consumer-react-phase3-title" data-consumer-phase3="">
        <h2 id="consumer-react-phase3-title">Phase 3 workflows</h2>

        <Menu
          ariaLabel="Release shortcuts"
          items={menuItems}
          data-consumer-menu=""
          onSelect={setSelectedAction}
        />
        <Dropdown
          contentId="consumer-react-actions"
          ariaLabel="Release actions"
          items={dropdownItems}
          open={dropdownOpen}
          onOpenChange={(nextOpen): void => {
            setDropdownOpen(nextOpen);
          }}
          onSelect={setSelectedAction}
        >
          <button
            type="button"
            data-morfira-button=""
            data-variant="secondary"
            data-size="sm"
            data-consumer-dropdown-trigger=""
          >
            More actions
          </button>
        </Dropdown>
        <output data-consumer-menu-value="">Action: {selectedAction}</output>

        <label htmlFor="consumer-react-environment">Environment</label>
        <Combobox
          inputId="consumer-react-environment"
          listboxId="consumer-react-environment-options"
          options={environmentOptions}
          query={environmentQuery}
          selectedValue={environment}
          onQueryChange={setEnvironmentQuery}
          onSelectedValueChange={setEnvironment}
          data-consumer-combobox=""
        />
        <output data-consumer-combobox-value="">Environment: {environment}</output>

        <label htmlFor="consumer-react-owner">Owner</label>
        <Autocomplete
          inputId="consumer-react-owner"
          listboxId="consumer-react-owner-options"
          options={[
            { id: 'react-owner-platform', value: 'platform', label: 'Platform team' },
            { id: 'react-owner-runtime', value: 'runtime', label: 'Runtime team' },
          ]}
          value={owner}
          onValueChange={setOwner}
          data-consumer-autocomplete=""
        />
        <output data-consumer-autocomplete-value="">Owner: {owner || 'none'}</output>

        <Toast
          open={toastOpen}
          title="Release ready"
          tone="success"
          duration={null}
          closeLabel="Dismiss release notification"
          data-consumer-toast=""
          onDismiss={(): void => {
            setToastOpen(false);
          }}
        >
          All automated checks passed.
        </Toast>
        {!toastOpen ? (
          <button
            type="button"
            data-morfira-button=""
            data-variant="secondary"
            data-size="sm"
            onClick={(): void => {
              setToastOpen(true);
            }}
          >
            Show notification
          </button>
        ) : null}

        <button
          ref={drawerReturnFocus}
          type="button"
          data-morfira-button=""
          data-variant="secondary"
          data-size="sm"
          data-consumer-drawer-trigger=""
          onClick={(): void => {
            setDrawerOpen(true);
          }}
        >
          Open release details
        </button>
        <Drawer
          open={drawerOpen}
          ids={{
            titleId: 'consumer-react-drawer-title',
            descriptionId: 'consumer-react-drawer-description',
          }}
          title="Release details"
          description="Inspect the selected release without leaving the current workflow."
          closeLabel="Close release details"
          returnFocus={drawerReturnFocus}
          data-consumer-drawer=""
          onDismiss={(): void => {
            setDrawerOpen(false);
          }}
        >
          <p>Release 24 targets the production environment.</p>
        </Drawer>

        <Table density="compact" striped hoverable data-consumer-table="">
          <caption>Recent releases</caption>
          <thead>
            <tr>
              <th scope="col">Release</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">24</th>
              <td>Ready</td>
            </tr>
            <tr>
              <th scope="row">23</th>
              <td>Deployed</td>
            </tr>
          </tbody>
        </Table>
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
