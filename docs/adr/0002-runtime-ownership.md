# ADR-0002: Separate behavior, browser bindings, and framework adapters

- Status: Accepted
- Date: 2026-10-13
- Owners: Morfira UI maintainers

## Context

Shared behavior is valuable only when it does not leak DOM or framework lifecycle
assumptions into every consumer.

## Decision

`core` may own pure models, state machines, and controllers, but cannot access `window`,
`document`, elements, or framework APIs. `dom` owns browser events, focus, layers,
scroll locking, positioning integration, progressive enhancement, and teardown.
Framework packages own idiomatic rendering and lifecycle integration.

Focus management, dismissable layers, keyboard navigation, positioning, and scroll
locking remain separately owned capabilities. Web Components are not a mandatory
substrate for adapters.

## Alternatives considered

- Put all behavior in DOM utilities: rejected because non-DOM state becomes harder to
  test and reuse.
- Build all adapters on Custom Elements: rejected without evidence that the interop and
  SSR costs are justified.
- Adopt an external headless component runtime: rejected by the original-runtime
  requirement.

## Consequences

Cross-framework consistency is proven through conformance tests. Shared code is
extracted only when its lifecycle boundary is clear.
