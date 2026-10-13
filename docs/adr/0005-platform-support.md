# ADR-0005: Define the initial platform support matrix

- Status: Accepted
- Date: 2026-10-13
- Owners: Morfira UI maintainers

## Context

Tooling and public adapters need explicit version ranges so implementation and CI do not
accidentally promise legacy support.

## Decision

- Use Node.js `>=24.12.0 <25` for repository development and CI.
- Use the exact pnpm version declared by the root package.
- Target React 19, Vue 3.5, and Svelte 5 as initial peer baselines.
- Support Baseline Widely Available, the latest two stable releases of Chrome, Edge,
  Firefox, and Safari, plus Firefox ESR.
- Do not support Internet Explorer or EdgeHTML.

## Alternatives considered

- Node 22 and 24: rejected initially to keep one reproducible LTS toolchain.
- React 18 or Svelte 4 compatibility: rejected because there are no existing consumers
  and compatibility would constrain the initial API.

## Consequences

CI begins with Node 24. Browser projects and adapter fixtures must encode the matrix
before a component is declared stable.
