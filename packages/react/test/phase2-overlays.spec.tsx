import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Popover } from '../src/popover/index.js';
import { Tooltip } from '../src/tooltip/index.js';

describe('React Phase 2 overlays', () => {
  it('renders deterministic Tooltip relationships for SSR', () => {
    const markup = renderToStaticMarkup(
      <Tooltip contentId="save-tip" content="Save changes" defaultOpen>
        <button type="button" aria-describedby="shortcut-tip">
          Save
        </button>
      </Tooltip>,
    );

    expect(markup).toContain('aria-describedby="shortcut-tip save-tip"');
    expect(markup).toContain('data-morfira-tooltip-trigger=""');
    expect(markup).toContain('id="save-tip"');
    expect(markup).toContain('role="tooltip"');
    expect(markup).not.toContain('hidden=""');
  });

  it('renders an accessible controlled Popover without modal semantics', () => {
    const markup = renderToStaticMarkup(
      <Popover
        contentId="filters"
        ariaLabel="Filters"
        open
        content={<button>Apply</button>}
      >
        <button type="button">Filters</button>
      </Popover>,
    );

    expect(markup).toContain('aria-controls="filters"');
    expect(markup).toContain('aria-expanded="true"');
    expect(markup).toContain('aria-haspopup="dialog"');
    expect(markup).toContain('id="filters"');
    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('aria-label="Filters"');
    expect(markup).not.toContain('aria-modal');
  });
});
