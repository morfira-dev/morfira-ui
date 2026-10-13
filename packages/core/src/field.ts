import {
  resolveInputOptions,
  type InputOptions,
  type ResolvedInputOptions,
} from './input.js';

export interface FieldIds {
  readonly inputId: string;
  readonly labelId: string;
  readonly descriptionId?: string;
  readonly validationMessageId?: string;
}

export interface FieldOptions extends InputOptions {
  readonly ids: FieldIds;
}

export interface ResolvedFieldOptions extends ResolvedInputOptions {
  readonly ids: FieldIds;
  readonly describedBy: string | undefined;
  readonly errorMessageId: string | undefined;
}

function requireExplicitId(value: string, name: string): string {
  if (value.trim().length === 0) {
    throw new TypeError(`Field ${name} must be a non-empty explicit ID.`);
  }

  if (/[\t\n\f\r ]/u.test(value)) {
    throw new TypeError(`Field ${name} must not contain ASCII whitespace.`);
  }

  return value;
}

function resolveIds(ids: FieldIds): FieldIds {
  const resolved = {
    inputId: requireExplicitId(ids.inputId, 'inputId'),
    labelId: requireExplicitId(ids.labelId, 'labelId'),
    ...(ids.descriptionId === undefined
      ? {}
      : {
          descriptionId: requireExplicitId(ids.descriptionId, 'descriptionId'),
        }),
    ...(ids.validationMessageId === undefined
      ? {}
      : {
          validationMessageId: requireExplicitId(
            ids.validationMessageId,
            'validationMessageId',
          ),
        }),
  };

  const values = Object.values(resolved);
  if (new Set(values).size !== values.length) {
    throw new TypeError('Field IDs must be unique within a field.');
  }

  return resolved;
}

/**
 * Resolves explicit Field associations. IDs are caller-owned so server and client
 * renders can agree without global counters or random values.
 */
export function resolveFieldOptions(options: FieldOptions): ResolvedFieldOptions {
  const input = resolveInputOptions(options);
  const ids = resolveIds(options.ids);
  const activeValidationMessageId =
    input.validation === 'none' ? undefined : ids.validationMessageId;
  const describedByParts = [ids.descriptionId, activeValidationMessageId].filter(
    (value): value is string => value !== undefined,
  );

  return {
    ...input,
    ids,
    describedBy: describedByParts.length === 0 ? undefined : describedByParts.join(' '),
    errorMessageId:
      input.validation === 'error' ? activeValidationMessageId : undefined,
  };
}
