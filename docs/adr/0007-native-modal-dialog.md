# ADR-0007: Build the first modal Dialog on the native dialog element

- Status: Accepted
- Date: 2026-10-13
- Owners: Morfira UI maintainers

## Context

Dialog is the first Morfira UI component that owns top-layer behavior, dismissal,
initial and restored focus, background interaction, document scroll, SSR, and teardown.
Implementing those capabilities independently in every framework adapter would create
multiple behavior owners and make nested layers difficult to verify.

The first slice only needs a modal dialog. Non-modal windows, sheets, alert dialogs,
presence transitions, and a general overlay stack have different contracts and are not
required to prove this boundary.

## Decision

Render a native `<dialog>` and activate it with `showModal()` in the DOM package. Native
modal behavior owns placement in the top layer and isolation of the outside document.
Morfira owns the public anatomy and styles, controlled open state, dismissal policy,
initial and restored focus, reference-counted scroll locking, and idempotent teardown.

The core package only normalizes serializable options and caller-provided IDs. The DOM
package is the single browser-lifecycle owner. React, Vue, and Svelte render idiomatic
content and connect their lifecycle to that DOM controller; they do not implement
separate focus traps or portals.

Server output never includes the native `open` attribute because that represents a
non-modal dialog and is not equivalent to `showModal()`. Adapters render deterministic
ARIA and data attributes, then synchronize the actual modal state after mount.

The first public Dialog is modal-only and controlled-only. Backdrop dismissal is off by
default so enterprise forms and destructive workflows require an explicit decision to
enable it.

## Alternatives considered

- A custom fixed-position layer with manual `inert` and focus trapping: rejected for the
  first slice because it duplicates browser behavior and substantially expands the
  nested-layer and teardown risk surface.
- A portal in every framework adapter: rejected because native modal dialogs already
  enter the top layer, while portals introduce framework-specific lifecycle and can lose
  inherited theme scopes.
- A third-party headless overlay runtime: rejected by the original-runtime boundary and
  because the DOM package is the declared owner of browser behavior.
- One API for modal and non-modal dialogs: rejected because the accessibility,
  interaction, and focus contracts are materially different.

## Consequences

Supported browsers must provide the native modal dialog API. Real-browser tests must
prove focus containment, Escape and backdrop policy, focus restoration, nested scroll
locks, theme inheritance, reduced motion, forced colors, and teardown.

The DOM controller must not read browser globals at module evaluation time. Framework
SSR remains deterministic but an initially open modal becomes interactive only after
mount. Future sheets, alert dialogs, non-modal windows, or generalized overlay
primitives require separate evidence and may supersede part of this decision through a
new ADR.
