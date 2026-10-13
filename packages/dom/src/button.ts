import {
  resolveButtonOptions,
  type ButtonOptions,
  type ResolvedButtonOptions,
} from '@morfira-dev/core/button';

const MANAGED_ATTRIBUTES: readonly string[] = [
  'type',
  'disabled',
  'aria-busy',
  'data-morfira-button',
  'data-variant',
  'data-size',
  'data-loading',
];

const ACTIVATION_LISTENER_OPTIONS: AddEventListenerOptions = { capture: true };

export interface ButtonController {
  readonly state: ResolvedButtonOptions;
  update(options: ButtonOptions): void;
  destroy(): void;
}

type AttributeSnapshot = ReadonlyMap<string, string | null>;

function captureAttributes(button: HTMLButtonElement): AttributeSnapshot {
  return new Map(
    MANAGED_ATTRIBUTES.map((name): readonly [string, string | null] => [
      name,
      button.getAttribute(name),
    ]),
  );
}

function setBooleanDataAttribute(
  button: HTMLButtonElement,
  name: string,
  enabled: boolean,
): void {
  if (enabled) {
    button.setAttribute(name, '');
  } else {
    button.removeAttribute(name);
  }
}

function applyButtonState(
  button: HTMLButtonElement,
  state: ResolvedButtonOptions,
): void {
  button.type = state.type;
  button.disabled = state.nativeDisabled;
  button.setAttribute('data-morfira-button', '');
  button.setAttribute('data-variant', state.variant);
  button.setAttribute('data-size', state.size);
  setBooleanDataAttribute(button, 'data-loading', state.loading);

  if (state.loading) {
    button.setAttribute('aria-busy', 'true');
  } else {
    button.removeAttribute('aria-busy');
  }
}

function restoreAttributes(
  button: HTMLButtonElement,
  snapshot: AttributeSnapshot,
): void {
  for (const [name, value] of snapshot) {
    if (value === null) {
      button.removeAttribute(name);
    } else {
      button.setAttribute(name, value);
    }
  }
}

/**
 * Enhances a native button while retaining native keyboard and form semantics.
 * Destroy is idempotent and restores every attribute owned by this controller.
 */
export function enhanceButton(
  button: HTMLButtonElement,
  initialOptions: ButtonOptions = {},
): ButtonController {
  const snapshot = captureAttributes(button);
  let state = resolveButtonOptions(initialOptions);
  let destroyed = false;

  const blockUnavailableActivation = (event: Event): void => {
    if (!state.interactive) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  button.addEventListener(
    'click',
    blockUnavailableActivation,
    ACTIVATION_LISTENER_OPTIONS,
  );
  applyButtonState(button, state);

  return {
    get state(): ResolvedButtonOptions {
      return state;
    },
    update(options: ButtonOptions): void {
      if (destroyed) {
        return;
      }

      state = resolveButtonOptions(options);
      applyButtonState(button, state);
    },
    destroy(): void {
      if (destroyed) {
        return;
      }

      destroyed = true;
      button.removeEventListener(
        'click',
        blockUnavailableActivation,
        ACTIVATION_LISTENER_OPTIONS,
      );
      restoreAttributes(button, snapshot);
    },
  };
}
