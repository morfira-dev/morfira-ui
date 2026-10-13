# Morfira UI Agent Workflows

This file defines repository-specific workflows that every agent should select according
to the task. It does not replace `AGENTS.md` or `SDD.md`.

## Architecture decision

Use for package boundaries, ownership, public contracts, browser support, release
behavior, or new cross-cutting primitives.

1. Read the current SDD and related ADRs.
2. Trace affected packages and consumers.
3. Write or supersede an ADR before broad implementation.
4. Record alternatives and consequences, not only the chosen tool.
5. Verify that the decision preserves tree-shaking, SSR, accessibility, and independent
   releases.

## Component vertical slice

Use when adding or materially changing a component.

1. Define anatomy, state model, interactions, accessibility, tokens, and public states.
2. Implement framework-independent behavior only where it has a real owner.
3. Bind behavior to native DOM with deterministic teardown.
4. Add idiomatic React, Vue, and Svelte adapters.
5. Add shared conformance cases and adapter-specific type tests.
6. Verify browser behavior, SSR/hydration, styling, and single-component imports.
7. Document all supported examples and limitations.

## Package contract

Use for exports, builds, dependency changes, or release configuration.

1. Inspect the package manifest, exports, side effects, declarations, and consumer
   fixtures.
2. Keep runtime dependencies minimal and peers explicit.
3. Build the package and inspect its packed contents.
4. Run package validation and a real consumer build.
5. Check that importing one component does not pull unrelated code or CSS.

## Accessibility review

Use for interactive components and any change to focus, keyboard, visibility, or dynamic
state.

1. Review the documented interaction contract.
2. Test keyboard navigation and focus restoration in a real browser.
3. Validate ARIA relationships and announcements.
4. Check reduced motion, forced colors, contrast, RTL, and touch targets.
5. Test nested, interrupted, unmounted, and late-callback scenarios where applicable.

## Documentation and design-system change

Use for tokens, CSS, themes, examples, or documentation pages.

1. Preserve public CSS variables and documented states unless a breaking change is
   explicitly approved.
2. Verify light, dark, forced-color, reduced-motion, and RTL states.
3. Keep examples readable and framework-idiomatic.
4. Run visual verification separately from static checks.

## Release preparation

Use only when the user explicitly asks for release work.

1. Determine exactly which packages changed.
2. Validate dependency propagation and independent version effects.
3. Run the full CI-equivalent gate, package validation, consumer fixtures, and size
   budgets.
4. Use npm Trusted Publishing with provenance; do not introduce a long-lived token as
   the normal path.
5. Never publish or push merely because validation succeeded.
