import '@morfira-dev/css/theme.css';
import '@morfira-dev/css/button.css';
import '@morfira-dev/css/dialog.css';
import '@morfira-dev/css/field.css';
import '@morfira-dev/css/input.css';
import './styles.css';

import { createSSRApp } from 'vue';
import type { Component } from 'vue';

import App from './App.vue';

const target = document.querySelector<HTMLElement>('#app');

if (target === null) {
  throw new TypeError('Vue consumer requires an #app hydration target.');
}

createSSRApp(App as Component).mount(target);
