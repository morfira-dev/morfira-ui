# ADR-0001: Establish first-level package boundaries

- Status: Accepted
- Date: 2026-10-13
- Owners: Morfira UI maintainers

## Context

Morfira UI must provide shared behavior across native DOM, React, Vue, and Svelte
without making a framework or component runtime the hidden foundation of the system.
Packages must remain independently publishable and tree-shakeable.

## Decision

Use independently versioned `@morfira-dev/*` packages:

- `core` for framework- and browser-independent state and behavior;
- `dom` for native browser bindings and lifecycle;
- `tokens` for source tokens and generated contracts;
- `css` for themes and component styles;
- `react`, `vue`, and `svelte` for idiomatic adapters.

Defer `testing` until conformance utilities have a demonstrated public consumer or
cross-adapter owner. Component modules live inside their owning packages.

## Alternatives considered

- One package for all frameworks: rejected because it weakens dependency and
  tree-shaking boundaries.
- One package per component per framework: rejected initially because it adds release
  and discovery overhead before scale requires it.
- A shared miscellaneous package: rejected because ownership would erode.

## Consequences

Every dependency between packages must be explicit. Packages release independently, and
downstream releases propagate when their shipped dependency contract changes.
