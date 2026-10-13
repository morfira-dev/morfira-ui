# Competitive scope: PatternFly

Status: active product benchmark, researched 2026-10-13.

## Decision

Morfira UI is built as an independent competitor to PatternFly for product and
enterprise interfaces. PatternFly is not a foundation that Morfira extends or wraps.
Competitive research may identify user problems, capability gaps, documentation
expectations, and accessibility scenarios; it must not supply Morfira source code,
tokens, naming, markup, APIs, or visual identity.

The benchmark is intentionally outcome-based. Morfira does not need a component with the
same name or anatomy when a clearer original contract solves the same product need.

## Current benchmark model

PatternFly's public documentation currently presents four useful capability layers:

1. foundations and styles, including design tokens, layout, motion, theming, typography,
   and accessibility;
2. reusable components with lifecycle and component-specific usage guidance;
3. patterns for recurring enterprise workflows such as dashboards, filtering, bulk
   selection, primary-detail, actions, and status/severity;
4. specialist packages or extensions for capabilities such as charts and code editing.

Morfira will evaluate all four layers while retaining its own architecture:

| Product need           | Morfira owner                  | Competitive requirement                                           |
| ---------------------- | ------------------------------ | ----------------------------------------------------------------- |
| Visual foundations     | `tokens`, `css`                | Original themes, accessible semantics, documented customization   |
| Behavior contracts     | `core`                         | Framework-independent state and interaction invariants            |
| Browser lifecycle      | `dom`                          | Native semantics, progressive enhancement, deterministic teardown |
| Framework delivery     | `react`, `vue`, `svelte`       | Idiomatic APIs with shared conformance, not React-only parity     |
| Enterprise composition | docs and later pattern modules | Tested application shells and workflows, not screenshots alone    |
| Specialist features    | optional integrations          | Keep heavy dependencies outside the base system                   |

## Differentiation

Morfira's intended advantages are:

- native DOM, React, Vue, and Svelte as first-class delivery targets;
- explicit, independently importable ESM and CSS entrypoints;
- a compact public theming contract that applications can override without rebuilding;
- readable implementations and strict behavior conformance across adapters;
- WCAG 2.2 AA, forced colors, reduced motion, RTL, SSR, and teardown treated as public
  contracts;
- an original neutral visual language with a restrained violet-indigo accent.

Visual differentiation must be evaluated at the whole-system level: typography, spacing
rhythm, density, radii, color, elevation, motion, iconography, and component
composition. Merely changing a brand color is not sufficient.

## Coverage workflow

For each benchmark area:

1. identify the enterprise user problem and representative workflows;
2. inspect current public guidance and accessibility expectations;
3. write an independent Morfira interaction and anatomy contract;
4. implement the smallest vertical slice across the claimed delivery layers;
5. prove behavior, packaging, accessibility, SSR, and visual distinctness;
6. record intentional omissions and integration boundaries.

Do not bulk-port a catalog. Prioritize capabilities demonstrated by real product
scenarios, and only extract shared primitives after repetition is visible in Morfira's
own implementations.

## Primary public references

- PatternFly components overview: <https://www.patternfly.org/components/overview/>
- PatternFly foundations and styles:
  <https://www.patternfly.org/foundations-and-styles/overview/>
- PatternFly design tokens overview:
  <https://www.patternfly.org/foundations-and-styles/design-tokens/overview/>
- PatternFly patterns overview: <https://www.patternfly.org/patterns/overview/>
- PatternFly development overview: <https://www.patternfly.org/get-started/develop/>

These references are time-sensitive research inputs. Recheck them before making a
catalog, compatibility, or migration claim.
