import '@morfira-dev/css/theme.css';
import '@morfira-dev/css/button.css';
import '@morfira-dev/css/dialog.css';
import '@morfira-dev/css/field.css';
import '@morfira-dev/css/input.css';
import './styles.css';

import { render as renderComponent } from 'svelte/server';

import App from './App.svelte';

export function render(): string {
  return renderComponent(App).body;
}
