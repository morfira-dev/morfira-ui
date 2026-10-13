# Morfira UI: Product and Technical Plan

Status: Phase 0 foundation and Phase 1 implementation complete; Phase 1 release-browser
and manual assistive-technology certification is pending.

This document records the agreed product direction and technical boundaries for Morfira
UI. It is a roadmap, not evidence that the described packages, APIs, or infrastructure
already exist.

## Current repository state

As of 2026-10-13:

- the public GitHub repository exists at `morfira-dev/morfira-ui` and the local default
  branch is `main`;
- the pnpm workspace, strict TypeScript baseline, package skeletons, CI, agent
  governance, ADRs, and validation commands exist;
- Phase 0 is committed locally; publication and push remain separate user-authorized
  operations;
- Phase 1 includes implemented token/theme, Button, Field, Input, and modal Dialog
  vertical slices across core, DOM, React, Vue, and Svelte. Cross-browser SSR/hydration,
  accessibility, rendering-mode, and shared Button/Field/Input adapter conformance are
  automated. Isolated production builds enforce component code, CSS, and gzip boundaries
  for all twelve React, Vue, and Svelte Phase 1 subpath imports. Stable visual
  regression and the extended Dialog lifecycle matrix are automated. Released
  Safari/Firefox ESR and VoiceOver/NVDA evidence remains the final manual certification
  gate.

The exact GitHub repository slug is not part of the public package contract and does not
block architecture or implementation work. The current `morfira-dev/morfira-ui`
repository may be used as-is unless it is renamed by a separate operational decision.

All public npm packages use the fixed `@morfira-dev/*` naming contract. Domain and
publishing infrastructure described below remain future targets that must be verified
before the first release.

## Product definition

Morfira UI is an independent, modern enterprise design system positioned as a direct
competitor to PatternFly. It targets the same class of demanding product interfaces,
including application shells, navigation, forms, dense data, operational workflows,
status, and administration experiences.

PatternFly is a public benchmark for capability coverage, documentation quality,
accessibility guidance, and enterprise workflow support. It is not Morfira's codebase,
runtime foundation, API specification, token source, markup template, or visual design.
Do not copy PatternFly source, token values, names, component structure, or appearance.
Morfira UI owns its design, architecture, contracts, and implementations.

## Competitive strategy

PatternFly currently organizes its system into foundations and styles, reusable
components, higher-level patterns, and optional extensions. Morfira should cover the
same product-building layers with its own taxonomy where that improves clarity:

- **Foundations:** tokens, typography, icon strategy, layout primitives, motion,
  theming, accessibility, and utilities.
- **Components:** independently importable controls and structures with native DOM,
  React, Vue, and Svelte delivery.
- **Enterprise patterns:** application shell, navigation, dashboards, filtering, bulk
  selection and actions, primary-detail flows, forms, status/severity, notifications,
  and multi-step work.
- **Specialist integrations:** charts, code editors, virtualization, and similar heavy
  capabilities stay optional unless there is a demonstrated reason to own them.

Morfira differentiates through first-class multi-framework support, a native DOM layer,
small explicit packages, consumer-owned theming, readable source, strict conformance,
and an original visual language. Success is measured by whether teams can build and
maintain real enterprise products, not by matching another catalog name-for-name.

## Brand and publication targets

- Public name: **Morfira UI**.
- GitHub organization: `morfira-dev`.
- Current repository: `github.com/morfira-dev/morfira-ui`; its exact slug is not a
  package or architecture constraint.
- Public npm package namespace: `@morfira-dev/*`.
- Organization description: “Open-source UI, CMS, and developer tools for building
  modern, accessible web products.”
- Future domain: `morfira.dev`.
- Future UI documentation domain: `ui.morfira.dev`.
- Technical identifiers must use ASCII only: `morfira`, with no Cyrillic homoglyphs.

## Package boundaries

The intended first-level packages are:

- `@morfira-dev/core`: framework-independent TypeScript models, states, and behavior;
- `@morfira-dev/dom`: native DOM implementation in TypeScript;
- `@morfira-dev/tokens`: source design tokens and generated contracts;
- `@morfira-dev/css`: base CSS and themes;
- `@morfira-dev/react`: idiomatic React adapters;
- `@morfira-dev/vue`: idiomatic Vue adapters;
- `@morfira-dev/svelte`: idiomatic Svelte adapters;
- `@morfira-dev/testing`: shared contract and conformance utilities, only if adapters or
  consumers demonstrably need a public testing package.

Packages have independent npm versions. The monorepo does not have a single shared
release version.

## Non-negotiable constraints

- Do not add Radix UI, Reka UI, or similar component runtimes as dependencies.
- Keep runtime dependencies minimal and add utilities only after demonstrating their
  need.
- Keep TypeScript source readable and unminified. Each component owns a module or
  directory; do not collect unrelated controls in a single file.
- Framework adapters must be thin but idiomatic. Preserve the native concepts of each
  framework for props, events, slots or children, refs, bindings, portals, and SSR.
- Design package boundaries and exports for tree-shaking before expanding the component
  catalog.
- `window` and `document` access belongs in the DOM layer, not in core.
- Web Components are not the mandatory foundation of every adapter unless a later proof
  demonstrates a concrete benefit.

## Proposed monorepo shape

Use pnpm workspaces and TypeScript strict mode.

```text
packages/
  core/
  dom/
  tokens/
  css/
  react/
  vue/
  svelte/
  testing/
apps/
  docs/
  playground-dom/
  playground-react/
  playground-vue/
  playground-svelte/
tooling/
  build/
  eslint/
  typescript/
  release/
```

Component-owned modules may live inside each package. Do not introduce a shared package
that becomes a miscellaneous dependency sink. Extract common primitives only after real
duplication appears across implemented components.

## Architecture layers

### Tokens

- Primitive tokens: palette, spacing, typography, radii, shadows, and motion.
- Semantic tokens: surface, content, border, accent, danger, and focus.
- Component tokens only for genuinely local contracts.
- CSS custom properties form the public runtime theming contract.
- Provide light, dark, and user-defined themes.
- Modern color models are allowed when accompanied by intentional fallbacks.
- Build tokens into CSS and typed TypeScript exports.

### CSS

- Use explicit cascade layers.
- Prefer low specificity with `:where()` where it improves customization.
- Expose public component state through `data-*` attributes.
- Use logical properties and support RTL.
- Account for forced colors, reduced motion, and contrast preferences.
- Allow consumers to override themes through variables without rebuilding.
- Make individual component styles independently importable.

### Core

- Use pure state machines or behavior controllers where the complexity justifies them.
- Support controlled and uncontrolled scenarios through documented contracts.
- Keep lifecycle and cleanup predictable.
- Keep focus management, dismissable layers, keyboard navigation, positioning, and
  scroll locking under distinct owners; do not turn core into a monolith.

### DOM

- Provide a native TypeScript API that works without a framework.
- Support progressive enhancement where it suits the component.
- Guarantee explicit, correct teardown.
- Evaluate custom elements separately from the native DOM API.

### Framework adapters

- React: hooks, refs, portals, and conventional controlled props.
- Vue: Composition API, props, emits, slots, and `v-model`.
- Svelte: the idiomatic API for the selected Svelte version, including actions,
  bindings, or snippets where appropriate.
- Preserve behavior and accessibility semantics across adapters without forcing
  artificially identical public APIs.
- Use a shared conformance matrix for state and accessibility invariants.

## Packaging and tree-shaking

- Publish ESM first.
- Define package and component subpath exports in `package.json`.
- Use `sideEffects: false` for logic and list CSS files explicitly as side effects where
  required.
- Do not create a mandatory barrel that imports the full catalog or all CSS.
- Generate declarations, source maps, and readable ESM.
- Validate consumers with real fixture applications, not only dist inspection.
- Add size budgets and assertions for single-component imports.
- Validate published package structure and type exports with `publint` and an
  appropriate type-resolution validator.
- Add CommonJS only after confirming a real consumer requirement.

## Accessibility contract

WCAG 2.2 AA is part of the component contract, including:

- keyboard navigation;
- visible focus and focus restoration;
- correct ARIA relationships;
- screen-reader announcements for dynamic state;
- reduced motion;
- high contrast and forced colors;
- RTL;
- touch target sizing;
- behavior that does not rely on color alone.

Complex components require a documented interaction contract before their implementation
begins.

## Testing strategy

- Unit tests for pure logic.
- DOM behavior tests.
- Shared contract tests for DOM, React, Vue, and Svelte.
- Type tests for public APIs.
- Automated accessibility checks.
- Playwright coverage for focus, keyboard, portals, scrolling, and pointer or touch
  behavior in a real browser.
- Visual regression coverage for themes, sizes, and states.
- SSR and hydration tests for adapters where applicable.
- Package and consumer tests for exports and tree-shaking.

Tests protect public behavior and edge cases; they must not merely mirror implementation
strings.

## Documentation product

Build one modern Morfira UI documentation site with:

- Vanilla, React, Vue, and Svelte example switching;
- anatomy, states, accessibility, tokens, and API sections for every component;
- interactive token customization;
- migration, architecture, and release guides;
- readable example source;
- framework playgrounds that build and run in CI.

## Releases and CI

- Use Conventional Commits.
- Release changed packages independently with semantic-release and correct dependency
  propagation.
- Publish to npm through GitHub Actions OIDC Trusted Publishing with provenance; do not
  design around long-lived npm tokens.
- CI gates: lint, typecheck, unit and contract tests, browser and accessibility tests,
  build, package validation, consumer fixtures, and size budgets.
- Publish documentation through GitHub Pages or the future domain after the first
  working vertical slice exists.
- A framework adapter cannot claim support for a component until it passes that
  component's conformance suite.

## Delivery phases

### Phase 0: architecture decisions

Write ADRs for:

- package boundaries;
- DOM ownership;
- controlled and uncontrolled behavior;
- styling and token contracts;
- exports and tree-shaking;
- independent versioning and dependency propagation;
- browser support and SSR.

No broad component implementation should precede these decisions.

### Phase 1: proof-oriented vertical slice

Implement:

- tokens and theming;
- Button;
- Field and Input;
- Dialog as the first complex overlay;
- DOM, React, Vue, and Svelte implementations;
- documentation, tests, SSR checks, and consumer fixtures for the slice.

The purpose is to prove the architecture with both simple and complex components before
scaling the catalog.

### Phase 2

- Checkbox, Radio, Switch, Textarea, and Select.
- Tooltip and Popover.
- Tabs and Accordion.
- Form validation, status/severity, and action-group patterns.
- Extract shared primitives only from confirmed repetition.

### Phase 3

- Menu and Dropdown.
- Combobox and Autocomplete.
- Toast and Drawer.
- Table and Data Grid boundaries.
- Application shell, navigation, filtering, bulk actions, and primary-detail patterns.

### Phase 4

- Expand the catalog according to real product scenarios.
- Close validated enterprise capability gaps against the maintained competitive map.
- Add CLI or scaffolding only after demand is demonstrated.
- Add complete theme presets and migration tooling.

## Component definition of done

A component is complete only when:

- anatomy and states are defined;
- keyboard and accessibility contracts are documented;
- core and DOM implementations plus every claimed adapter exist;
- tokens and customization hooks exist;
- the shared conformance matrix passes;
- SSR and hydration are verified where applicable;
- documented examples work;
- importing the component does not pull in unrelated components;
- package output is readable, typed, and structurally valid.

## Immediate work

1. Run and record the release matrix, including native autofill, for the latest two
   Safari releases, current Firefox ESR, VoiceOver with Safari, and NVDA with Firefox
   ESR before declaring Phase 1 stable.
2. Start Phase 2 with Checkbox without adapter-specific exceptions after the manual
   Phase 1 certification record passes.
