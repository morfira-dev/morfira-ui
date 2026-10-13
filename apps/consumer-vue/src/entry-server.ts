import '@morfira-dev/css/theme.css';
import '@morfira-dev/css/button.css';
import '@morfira-dev/css/dialog.css';
import '@morfira-dev/css/field.css';
import '@morfira-dev/css/input.css';
import './styles.css';

import { renderToString } from '@vue/server-renderer';
import { createSSRApp } from 'vue';
import type { Component } from 'vue';

import App from './App.vue';

/** Returns the deterministic inner HTML injected at the index `<!--app-html-->` marker. */
export async function render(): Promise<string> {
  const html = await renderToString(createSSRApp(App as Component));

  return html;
}
