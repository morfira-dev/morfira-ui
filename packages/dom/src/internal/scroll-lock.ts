interface ScrollLockRecord {
  count: number;
  readonly overflow: string;
}

const scrollLocks = new WeakMap<Document, ScrollLockRecord>();

/** Shares document scroll ownership across every modal surface. */
export function acquireDocumentScrollLock(document: Document): void {
  const record = scrollLocks.get(document);
  if (record !== undefined) {
    record.count += 1;
    return;
  }

  scrollLocks.set(document, {
    count: 1,
    overflow: document.documentElement.style.overflow,
  });
  document.documentElement.style.overflow = 'hidden';
}

/** Releases one owner and restores the consumer value after the final owner closes. */
export function releaseDocumentScrollLock(document: Document): void {
  const record = scrollLocks.get(document);
  if (record === undefined) return;

  record.count -= 1;
  if (record.count > 0) return;

  document.documentElement.style.overflow = record.overflow;
  scrollLocks.delete(document);
}
