import {
  resolveInputOptions,
  type InputOptions,
  type ResolvedInputOptions,
} from '@morfira-dev/core/input';

const MANAGED_ATTRIBUTES: readonly string[] = [
  'disabled',
  'readonly',
  'required',
  'aria-invalid',
  'data-morfira-input',
  'data-size',
  'data-validation',
];

type AttributeSnapshot = ReadonlyMap<string, string | null>;

export interface InputController {
  readonly state: ResolvedInputOptions;
  update(options: InputOptions): void;
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

export function restoreAttributes(
  element: HTMLElement,
  snapshot: AttributeSnapshot,
): void {
  for (const [name, value] of snapshot) {
    if (value === null) {
      element.removeAttribute(name);
    } else {
      element.setAttribute(name, value);
    }
  }
}

export function setBooleanAttribute(
  element: HTMLElement,
  name: string,
  enabled: boolean,
): void {
  if (enabled) {
    element.setAttribute(name, '');
  } else {
    element.removeAttribute(name);
  }
}

function applyInputState(input: HTMLInputElement, state: ResolvedInputOptions): void {
  input.setAttribute('data-morfira-input', '');
  input.setAttribute('data-size', state.size);
  input.setAttribute('data-validation', state.validation);
  setBooleanAttribute(input, 'disabled', state.disabled);
  setBooleanAttribute(input, 'readonly', state.readOnly);
  setBooleanAttribute(input, 'required', state.required);

  if (state.ariaInvalid === undefined) {
    input.removeAttribute('aria-invalid');
  } else {
    input.setAttribute('aria-invalid', state.ariaInvalid);
  }
}

/**
 * Adds Morfira state hooks to a native input without replacing native editing,
 * keyboard, focus, or form behavior.
 */
export function enhanceInput(
  input: HTMLInputElement,
  initialOptions: InputOptions = {},
): InputController {
  const snapshot = captureAttributes(input, MANAGED_ATTRIBUTES);
  let state = resolveInputOptions(initialOptions);
  let destroyed = false;

  applyInputState(input, state);

  return {
    get state(): ResolvedInputOptions {
      return state;
    },
    update(options: InputOptions): void {
      if (destroyed) {
        return;
      }

      state = resolveInputOptions(options);
      applyInputState(input, state);
    },
    destroy(): void {
      if (destroyed) {
        return;
      }

      destroyed = true;
      restoreAttributes(input, snapshot);
    },
  };
}
