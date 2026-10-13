import '@morfira-dev/css/primitives.css';
import '@morfira-dev/css/theme.css';
import '@morfira-dev/css/themes/light.css';
import '@morfira-dev/css/button.css';
import '@morfira-dev/css/dialog.css';
import '@morfira-dev/css/field.css';
import '@morfira-dev/css/input.css';
import '@morfira-dev/css/checkbox.css';
import '@morfira-dev/css/radio.css';
import '@morfira-dev/css/switch.css';
import '@morfira-dev/css/textarea.css';
import '@morfira-dev/css/select.css';
import '@morfira-dev/css/tooltip.css';
import '@morfira-dev/css/popover.css';
import '@morfira-dev/css/tabs.css';
import '@morfira-dev/css/accordion.css';
import '@morfira-dev/css/menu.css';
import '@morfira-dev/css/dropdown.css';
import '@morfira-dev/css/combobox.css';
import '@morfira-dev/css/autocomplete.css';
import '@morfira-dev/css/toast.css';
import '@morfira-dev/css/drawer.css';
import '@morfira-dev/css/table.css';

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
