import '@morfira-dev/css/theme.css';
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
import './styles.css';

import { hydrate } from 'svelte';

import App from './App.svelte';

const target = document.querySelector<HTMLElement>('#app');

if (target === null) {
  throw new TypeError('Svelte consumer requires an #app hydration target.');
}

hydrate(App, { target });
