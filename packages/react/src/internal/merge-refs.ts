import type { Ref } from 'react';

export function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref !== null && ref !== undefined) {
    ref.current = value;
  }
}

export function mergeRefs<T>(
  ...refs: readonly (Ref<T> | undefined)[]
): (value: T | null) => void {
  return (value: T | null): void => {
    for (const ref of refs) {
      assignRef(ref, value);
    }
  };
}
