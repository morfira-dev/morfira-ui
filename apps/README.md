# Applications

This directory contains proof applications that exercise packages through their public
exports:

- `playground-dom` renders tokens, themes, Button, Field, Input, and Dialog without a
  framework;
- `consumer-react`, `consumer-vue`, and `consumer-svelte` are production Vite SSR and
  hydration fixtures for Button, Field, Input, and Dialog public subpath imports.

The consumer fixtures render Button, Field, and Input contracts on the server and verify
their bindings after hydration. They also start with an open server-rendered Dialog
without the native `open` attribute; client entries hydrate the same markup and promote
the surface to the native top layer. All fixtures are served together by
`scripts/serve-consumer-fixtures.mjs` for the Playwright matrix. They are verification
applications, not documentation-site templates or packages intended for publication.
