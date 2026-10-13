import '@morfira-dev/css/primitives.css';
import '@morfira-dev/css/theme.css';
import '@morfira-dev/css/themes/light.css';
import '@morfira-dev/css/button.css';
import '@morfira-dev/css/dialog.css';
import '@morfira-dev/css/field.css';
import '@morfira-dev/css/input.css';

import { hydrateRoot } from 'react-dom/client';

import { App } from './App.js';

const root = document.querySelector<HTMLElement>('#app');

if (root === null) {
  throw new TypeError('React consumer requires an #app hydration root.');
}

hydrateRoot(root, <App initialOpen />, {
  onRecoverableError(error: unknown): void {
    queueMicrotask((): void => {
      throw error;
    });
  },
});
