# Morfira UI Software Design Description

Status: accepted baseline for Phase 0.

## 1. Purpose

Morfira UI is an original, accessible, framework-independent UI system with native DOM,
React, Vue, and Svelte delivery layers. Its design, tokens, architecture, and
implementation belong to Morfira UI.

The system uses Fomantic UI only as optional research input for component coverage and
API ergonomics. No source copying or visual cloning is allowed without an explicit
license and provenance review.

## 2. Public identity

- Product: Morfira UI.
- GitHub organization: `morfira-dev`.
- Current repository: `morfira-dev/morfira-ui`; the exact repository slug is not part of
  the package contract.
- npm namespace: `@morfira-dev/*`.
- License: MIT.
- Technical identifiers use ASCII only.

## 3. Supported platform baseline

- Development runtime: Node.js `>=24.12.0 <25`.
- Package manager: the exact pnpm version in the root `packageManager` field.
- React adapter peer baseline: React 19.
- Vue adapter peer baseline: Vue 3.5.
- Svelte adapter peer baseline: Svelte 5.
- Browser policy: Baseline Widely Available, the latest two stable releases of Chrome,
  Edge, Firefox, and Safari, plus Firefox ESR.
- Internet Explorer and EdgeHTML are not supported.

New CSS capabilities require intentional fallbacks when absence would break meaning,
accessibility, or essential layout.

## 4. Package model

The first-level public package plan is:

- `@morfira-dev/core` — framework-independent state and behavior;
- `@morfira-dev/dom` — native DOM bindings and lifecycle;
- `@morfira-dev/tokens` — source tokens and generated contracts;
- `@morfira-dev/css` — base CSS, themes, and component styles;
- `@morfira-dev/react` — React adapter;
- `@morfira-dev/vue` — Vue adapter;
- `@morfira-dev/svelte` — Svelte adapter;
- `@morfira-dev/testing` — deferred until a real public consumer need is demonstrated.

Packages are independently versioned. Internal dependency changes must propagate
releases to affected downstream packages.

## 5. Architectural requirements

### 5.1 Tokens

Tokens have primitive, semantic, and narrowly scoped component layers. CSS custom
properties are the public runtime theme contract. Builds produce CSS and typed
TypeScript exports. Light, dark, and user-defined themes are required.

### 5.2 CSS

CSS uses explicit cascade layers, low specificity, logical properties, public `data-*`
states, and independent component entrypoints. It supports RTL, reduced motion, forced
colors, and consumer overrides without rebuilding.

### 5.3 Core

Core contains pure models, state machines, or controllers only when they clarify
behavior. It cannot access browser globals. Controlled and uncontrolled semantics,
lifecycle, and cleanup must be deterministic.

### 5.4 DOM

The DOM layer owns browser events, focus, layers, positioning integration, scroll
locking, progressive enhancement, and teardown. Focus management, dismissable layers,
keyboard navigation, positioning, and scroll locking remain separate owners rather than
one overlay singleton.

### 5.5 Framework adapters

Adapters share state and accessibility invariants but expose idiomatic APIs: React uses
hooks, refs, controlled props, and portals; Vue uses Composition API, props, emits,
slots, and `v-model`; Svelte uses current Svelte 5 bindings, actions, and snippets where
appropriate.

## 6. Packaging requirements

- ESM-first output with declarations and source maps.
- Package and component subpath exports.
- Side-effect-free logic and explicitly listed CSS side effects.
- No mandatory barrel that imports the catalog or all styles.
- Readable output and real consumer fixtures.
- Package validation, type-resolution validation, and size budgets.
- CommonJS only after a demonstrated consumer requirement.

## 7. Accessibility requirements

WCAG 2.2 AA is part of the public contract. Components must cover keyboard navigation,
visible focus, focus restoration, ARIA relationships, dynamic announcements, reduced
motion, forced colors, contrast, RTL, touch targets, and non-color-only meaning. Complex
components require a written interaction contract before implementation.

## 8. Verification model

The complete strategy includes unit tests, DOM behavior tests, shared adapter
conformance tests, public type tests, accessibility checks, Playwright browser tests,
visual regression, SSR/hydration tests, package validation, consumer fixtures,
tree-shaking checks, and size budgets.

Tests protect public behavior and edge cases rather than implementation text.

## 9. Delivery phases

### Phase 0 — foundation

- Record package, runtime, styling, exports, support, and release ADRs.
- Create the pnpm workspace and strict TypeScript baseline.
- Establish agent governance and CI without publishing.

### Phase 1 — proof-oriented vertical slice

- Tokens and themes.
- Button.
- Field and Input.
- Dialog as the first complex overlay.
- DOM, React, Vue, and Svelte implementations.
- Documentation, conformance, browser, SSR, and consumer verification.

### Phase 2

Checkbox, Radio, Switch, Textarea, Select, Tooltip, Popover, Tabs, and Accordion. Shared
primitives may be extracted only from demonstrated reuse.

### Phase 3

Menu, Dropdown, Combobox, Autocomplete, Toast, Drawer, Table/Data Grid boundaries, and
navigation components.

### Phase 4

Expand according to real product scenarios. Add CLI, scaffolding, migration tooling, or
broad theme presets only when demand is demonstrated.

## 10. Component Definition of Done

A component is complete only when anatomy and states are defined; keyboard and
accessibility contracts are documented; required core, DOM, and claimed adapter
implementations exist; tokens and customization are public; conformance passes;
SSR/hydration is verified where applicable; examples work; isolated imports do not pull
unrelated components; and package output is readable, typed, and valid.

## 11. Change control

Accepted architecture decisions live in `docs/adr/`. Changes to this SDD or a public
contract require an ADR when the decision has cross-package or long-term consequences.
Accepted ADRs are superseded, not silently rewritten.
