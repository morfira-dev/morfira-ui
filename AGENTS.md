# Morfira UI Agent Instructions

These instructions apply to the entire repository and to every coding agent, editor
agent, reviewer, and automation that changes repository content.

## Mandatory reading order

Before planning or editing, read:

1. `AGENTS.md` — repository-wide operating rules;
2. `SKILLS.md` — task-specific workflows and verification expectations;
3. `SDD.md` — product requirements, architecture boundaries, and delivery phases;
4. applicable ADRs under `docs/adr/`;
5. the nearest nested `AGENTS.md`, if a package later introduces one.

User instructions override repository documents. A nested `AGENTS.md` may add
package-specific constraints but must not silently weaken repository-wide quality,
accessibility, security, or public-contract requirements.

## Product boundaries

- Morfira UI is an original implementation. Fomantic UI and other libraries may inform
  coverage, API ergonomics, accessibility patterns, and edge cases, but their source or
  visual system must not be copied without an explicit license and provenance review.
- Public npm packages use `@morfira-dev/*`.
- Do not add Radix UI, Reka UI, or another component runtime as an implementation
  dependency.
- Keep runtime dependencies minimal and justify each one in the owning change.
- Preserve framework-independent behavior in `@morfira-dev/core`; browser access belongs
  to `@morfira-dev/dom` or framework adapters.
- React, Vue, and Svelte adapters must share behavior contracts while remaining
  idiomatic for their frameworks.
- WCAG 2.2 AA, keyboard behavior, focus management, reduced motion, forced colors, RTL,
  and SSR safety are public requirements, not optional polish.

## Repository workflow

- Use Node 24 LTS and the pnpm version declared in `package.json`.
- Use pnpm workspace commands; do not introduce npm or Yarn lockfiles.
- Keep TypeScript strict. Do not weaken compiler or lint rules to bypass a local error.
- Keep changes behavior-owned and bounded. Avoid speculative shared utilities and broad
  cleanup unrelated to the task.
- Preserve unrelated user changes in a dirty worktree.
- Do not publish packages, create releases, push, force-push, rename the remote
  repository, or commit unless the user explicitly requests that action.
- Update `SDD.md` or an ADR when a change modifies an architectural decision or public
  contract. Do not rewrite accepted ADR history; supersede it.
- Use Conventional Commits when a commit is explicitly requested.

## Component workflow

Before implementing a complex component, document:

- anatomy and states;
- controlled and uncontrolled behavior;
- keyboard interactions;
- focus entry, containment, restoration, and teardown;
- ARIA relationships and announcements;
- SSR and hydration behavior;
- tokens and public `data-*` states;
- adapter conformance cases.

A component is not complete until the applicable Definition of Done in `SDD.md` is
satisfied.

## Package and source rules

- One component owns one module or directory. Do not collect unrelated controls in a
  large shared file.
- Avoid mandatory root barrels that import the full catalog or global CSS.
- Keep logic modules side-effect free. List CSS side effects explicitly.
- Keep public package output ESM-first, readable, typed, and independently importable
  through subpath exports.
- Extract a shared primitive only after repetition is demonstrated by real components.
- Never access `window` or `document` from `packages/core`.
- Do not make Web Components the mandatory base of every adapter without an accepted ADR
  proving the benefit.

## Required verification

Run checks proportional to the change. The default repository gate is:

```sh
pnpm check
pnpm build
```

Also run focused browser, accessibility, SSR, package-consumer, or visual tests when the
changed contract requires them. Passing static checks does not prove browser or visual
behavior; report verification boundaries explicitly.

## Agent compatibility

`AGENTS.md`, `SKILLS.md`, and `SDD.md` are canonical. Compatibility entrypoints for
Claude, Cursor, Copilot, OpenCode, Zcode, Gemini, Windsurf, Cline, and Roo must direct
those agents back to the canonical files. Run `pnpm instructions:check` after changing
agent documentation.
