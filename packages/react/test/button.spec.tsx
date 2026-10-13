import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Button } from '../src/button/index.js';

describe('React Button', () => {
  it('renders native-safe defaults and public state attributes', () => {
    const markup = renderToStaticMarkup(<Button name="confirm">Confirm</Button>);

    expect(markup).toContain('type="button"');
    expect(markup).toContain('name="confirm"');
    expect(markup).toContain('data-morfira-button=""');
    expect(markup).toContain('data-variant="primary"');
    expect(markup).toContain('data-size="md"');
    expect(markup).not.toContain('data-loading');
    expect(markup).not.toContain('aria-busy');
  });

  it('maps loading to native disabled and busy state', () => {
    const markup = renderToStaticMarkup(
      <Button loading variant="danger">
        Delete
      </Button>,
    );

    expect(markup).toContain('disabled=""');
    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain('data-loading=""');
    expect(markup).toContain('data-variant="danger"');
  });
});
