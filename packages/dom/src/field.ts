import {
  resolveFieldOptions,
  type FieldOptions,
  type ResolvedFieldOptions,
} from '@morfira-dev/core/field';

import {
  enhanceInput,
  restoreAttributes,
  setBooleanAttribute,
  type InputController,
} from './input.js';

const ROOT_ATTRIBUTES: readonly string[] = [
  'data-morfira-field',
  'data-size',
  'data-validation',
  'data-disabled',
  'data-readonly',
  'data-required',
];
const INPUT_ASSOCIATION_ATTRIBUTES: readonly string[] = [
  'id',
  'aria-labelledby',
  'aria-describedby',
  'aria-errormessage',
];
const LABEL_ATTRIBUTES: readonly string[] = ['id', 'for', 'data-morfira-field-label'];
const DESCRIPTION_ATTRIBUTES: readonly string[] = [
  'id',
  'data-morfira-field-message',
  'data-message-kind',
];
const VALIDATION_MESSAGE_ATTRIBUTES: readonly string[] = [
  'id',
  'data-morfira-field-message',
  'data-message-kind',
];

type AttributeSnapshot = ReadonlyMap<string, string | null>;

export interface FieldElements {
  readonly root: HTMLElement;
  readonly input: HTMLInputElement;
  readonly label: HTMLLabelElement;
  readonly description?: HTMLElement;
  readonly validationMessage?: HTMLElement;
}

export interface FieldController {
  readonly state: ResolvedFieldOptions;
  update(options: FieldOptions): void;
  destroy(): void;
}

function captureAttributes(
  element: HTMLElement,
  names: readonly string[],
): AttributeSnapshot {
  return new Map(
    names.map((name): readonly [string, string | null] => [
      name,
      element.getAttribute(name),
    ]),
  );
}

function setOptionalAttribute(
  element: HTMLElement,
  name: string,
  value: string | undefined,
): void {
  if (value === undefined) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, value);
  }
}

function assertElementIdContract(
  elements: FieldElements,
  state: ResolvedFieldOptions,
): void {
  if (
    (elements.description === undefined) !==
    (state.ids.descriptionId === undefined)
  ) {
    throw new TypeError(
      'Field description element and descriptionId must be provided together.',
    );
  }

  if (
    (elements.validationMessage === undefined) !==
    (state.ids.validationMessageId === undefined)
  ) {
    throw new TypeError(
      'Field validationMessage element and validationMessageId must be provided together.',
    );
  }
}

function applyFieldState(elements: FieldElements, state: ResolvedFieldOptions): void {
  const { root, input, label, description, validationMessage } = elements;

  root.setAttribute('data-morfira-field', '');
  root.setAttribute('data-size', state.size);
  root.setAttribute('data-validation', state.validation);
  setBooleanAttribute(root, 'data-disabled', state.disabled);
  setBooleanAttribute(root, 'data-readonly', state.readOnly);
  setBooleanAttribute(root, 'data-required', state.required);

  input.id = state.ids.inputId;
  input.setAttribute('aria-labelledby', state.ids.labelId);
  setOptionalAttribute(input, 'aria-describedby', state.describedBy);
  setOptionalAttribute(input, 'aria-errormessage', state.errorMessageId);

  label.id = state.ids.labelId;
  label.htmlFor = state.ids.inputId;
  label.setAttribute('data-morfira-field-label', '');

  if (description !== undefined) {
    setOptionalAttribute(description, 'id', state.ids.descriptionId);
    description.setAttribute('data-morfira-field-message', '');
    description.setAttribute('data-message-kind', 'helper');
  }

  if (validationMessage !== undefined) {
    setOptionalAttribute(validationMessage, 'id', state.ids.validationMessageId);
    validationMessage.setAttribute('data-morfira-field-message', '');
    setOptionalAttribute(
      validationMessage,
      'data-message-kind',
      state.validation === 'none' ? undefined : state.validation,
    );
  }
}

/**
 * Connects caller-provided Field elements through explicit IDs. The enhancer owns no
 * generated identity or interaction state and fully restores the attributes it owns.
 */
export function enhanceField(
  elements: FieldElements,
  initialOptions: FieldOptions,
): FieldController {
  const rootSnapshot = captureAttributes(elements.root, ROOT_ATTRIBUTES);
  const inputAssociationSnapshot = captureAttributes(
    elements.input,
    INPUT_ASSOCIATION_ATTRIBUTES,
  );
  const labelSnapshot = captureAttributes(elements.label, LABEL_ATTRIBUTES);
  const descriptionSnapshot =
    elements.description === undefined
      ? undefined
      : captureAttributes(elements.description, DESCRIPTION_ATTRIBUTES);
  const validationMessageSnapshot =
    elements.validationMessage === undefined
      ? undefined
      : captureAttributes(elements.validationMessage, VALIDATION_MESSAGE_ATTRIBUTES);
  let state = resolveFieldOptions(initialOptions);
  assertElementIdContract(elements, state);
  let destroyed = false;
  const inputController: InputController = enhanceInput(elements.input, state);

  applyFieldState(elements, state);

  return {
    get state(): ResolvedFieldOptions {
      return state;
    },
    update(options: FieldOptions): void {
      if (destroyed) {
        return;
      }

      const nextState = resolveFieldOptions(options);
      assertElementIdContract(elements, nextState);
      state = nextState;
      inputController.update(nextState);
      applyFieldState(elements, nextState);
    },
    destroy(): void {
      if (destroyed) {
        return;
      }

      destroyed = true;
      inputController.destroy();
      restoreAttributes(elements.input, inputAssociationSnapshot);
      restoreAttributes(elements.root, rootSnapshot);
      restoreAttributes(elements.label, labelSnapshot);

      if (elements.description !== undefined && descriptionSnapshot !== undefined) {
        restoreAttributes(elements.description, descriptionSnapshot);
      }

      if (
        elements.validationMessage !== undefined &&
        validationMessageSnapshot !== undefined
      ) {
        restoreAttributes(elements.validationMessage, validationMessageSnapshot);
      }
    },
  };
}
