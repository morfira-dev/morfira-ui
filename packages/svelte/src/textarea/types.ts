import type { TextareaOptions } from '@morfira-dev/core/textarea';
import type { HTMLTextareaAttributes } from 'svelte/elements';
type NativeTextareaProps = Omit<
  HTMLTextareaAttributes,
  keyof TextareaOptions | 'aria-invalid' | 'size' | 'value'
>;
export interface TextareaProps extends NativeTextareaProps, TextareaOptions {
  value?: string;
  element?: HTMLTextAreaElement | null;
}
