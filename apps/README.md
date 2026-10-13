# Applications

This directory contains proof applications that exercise packages through their public
exports:

- `playground-dom` renders tokens, themes, Button, Field, Input, and Dialog without a
  framework;
- `consumer-react`, `consumer-vue`, and `consumer-svelte` are production Vite SSR and
  hydration fixtures for Button, Field, Input, and Dialog public subpath imports.

The consumer fixtures render Button, Field, and Input contracts on the server and drive
one shared cross-adapter interaction and accessibility matrix after hydration. They also
start with an open server-rendered Dialog without the native `open` attribute; client
entries hydrate the same markup and promote the surface to the native top layer. All
fixtures are served together by `scripts/serve-consumer-fixtures.mjs` for the Playwright
matrix. They are verification applications, not documentation-site templates or packages
intended for publication.

Each framework fixture also owns four isolated library-mode entrypoints. The consumer
gate builds Button, Field, Input, and Dialog separately through their public package and
CSS subpaths, rejects package root barrels and unrelated component sources or selectors,
and applies component-specific gzip budgets from
`tooling/isolated-consumer-size-budgets.json`.
