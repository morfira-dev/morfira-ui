import '@morfira-dev/css/theme.css';
import '@morfira-dev/css/button.css';
import '@morfira-dev/css/dialog.css';
import '@morfira-dev/css/field.css';
import '@morfira-dev/css/input.css';
import './styles.css';

import { hydrate } from 'svelte';

import App from './App.svelte';

const target = document.querySelector<HTMLElement>('#app');

if (target === null) {
  throw new TypeError('Svelte consumer requires an #app hydration target.');
}

hydrate(App, { target });
