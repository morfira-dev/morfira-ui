# ADR-0003: Use CSS custom properties as the runtime theme contract

- Status: Accepted
- Date: 2026-10-13
- Owners: Morfira UI maintainers

## Context

Consumers need runtime theming without rebuilding Morfira UI, while component styles
must remain independently importable and easy to override.

## Decision

Maintain primitive, semantic, and narrowly scoped component tokens. Generate typed
TypeScript exports and CSS custom properties. Use explicit cascade layers, low
specificity, logical properties, and public `data-*` states. Ship light and dark themes
and support consumer-defined themes.

RTL, reduced motion, forced colors, and meaningful fallbacks for unsupported modern
color features are part of the styling contract.

## Alternatives considered

- Build-time-only tokens: rejected because consumers could not switch themes at runtime.
- CSS-in-JS runtime: rejected because it adds runtime cost and framework coupling.
- Global monolithic CSS: rejected because it breaks isolated component imports.

## Consequences

CSS files are explicit package side effects. Visual and browser verification is required
in addition to static token tests.
