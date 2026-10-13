import {
  resolveTextareaOptions,
  type TextareaOptions,
  type ResolvedTextareaOptions,
} from '@morfira-dev/core/textarea';

const ATTRIBUTES = [
  'disabled',
  'readonly',
  'required',
  'aria-invalid',
  'data-morfira-textarea',
  'data-size',
  'data-validation',
  'data-resize',
] as const;

export interface TextareaController {
  readonly state: ResolvedTextareaOptions;
  update(options: TextareaOptions): void;
  destroy(): void;
}

export function enhanceTextarea(
  textarea: HTMLTextAreaElement,
  initialOptions: TextareaOptions = {},
): TextareaController {
  const attributes = new Map(
    ATTRIBUTES.map((name) => [name, textarea.getAttribute(name)] as const),
  );
  let state = resolveTextareaOptions(initialOptions);
  let destroyed = false;

  const apply = (): void => {
    textarea.disabled = state.disabled;
    textarea.readOnly = state.readOnly;
    textarea.required = state.required;
    textarea.setAttribute('data-morfira-textarea', '');
    textarea.setAttribute('data-size', state.size);
    textarea.setAttribute('data-validation', state.validation);
    textarea.setAttribute('data-resize', state.resize);
    if (state.ariaInvalid) textarea.setAttribute('aria-invalid', state.ariaInvalid);
    else textarea.removeAttribute('aria-invalid');
  };

  apply();
  return {
    get state() {
      return state;
    },
    update(options) {
      if (!destroyed) {
        state = resolveTextareaOptions(options);
        apply();
      }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      for (const [name, value] of attributes) {
        if (value === null) textarea.removeAttribute(name);
        else textarea.setAttribute(name, value);
      }
    },
  };
}
