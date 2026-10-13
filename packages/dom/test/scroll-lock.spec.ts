import { describe, expect, it } from 'vitest';

import {
  acquireDocumentScrollLock,
  releaseDocumentScrollLock,
} from '../src/internal/scroll-lock.js';

function fakeDocument(overflow = ''): Document {
  return {
    documentElement: { style: { overflow } },
  } as unknown as Document;
}

describe('document scroll lock', () => {
  it('restores the consumer value only after every modal owner releases', () => {
    const document = fakeDocument('clip');

    acquireDocumentScrollLock(document);
    acquireDocumentScrollLock(document);
    expect(document.documentElement.style.overflow).toBe('hidden');

    releaseDocumentScrollLock(document);
    expect(document.documentElement.style.overflow).toBe('hidden');

    releaseDocumentScrollLock(document);
    expect(document.documentElement.style.overflow).toBe('clip');
  });

  it('ignores redundant releases and supports a new ownership cycle', () => {
    const document = fakeDocument('auto');

    releaseDocumentScrollLock(document);
    acquireDocumentScrollLock(document);
    releaseDocumentScrollLock(document);
    releaseDocumentScrollLock(document);

    expect(document.documentElement.style.overflow).toBe('auto');
  });
});
