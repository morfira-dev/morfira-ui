import { renderToString } from 'react-dom/server';

import { App } from './App.js';

/** Returns the deterministic inner HTML injected at the index `<!--app-html-->` marker. */
export function render(): string {
  return renderToString(<App initialOpen />);
}
