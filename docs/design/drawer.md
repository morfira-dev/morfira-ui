# Drawer contract

Status: Phase 3 implementation contract. Automated engine coverage does not replace
released-browser and manual assistive-technology certification.

## Purpose and anatomy

Drawer is an edge-attached supplementary surface for navigation, inspection, or a
bounded workflow. It has a labelled header, optional description, dismiss button,
scrollable body, and optional footer. Public hooks are `data-morfira-drawer`,
`data-morfira-drawer-header`, `data-morfira-drawer-title`,
`data-morfira-drawer-description`, `data-morfira-drawer-close`,
`data-morfira-drawer-body`, and `data-morfira-drawer-footer`.

States are `data-state`, `data-side` (`inline-start` or `inline-end`), `data-size`, and
`data-modal`. Logical sides make RTL behavior part of the contract.

## Modal and non-modal boundary

Both modes use a native `dialog` activated after mount. Modal Drawer uses `showModal()`,
`aria-modal="true"`, browser top-layer isolation, optional backdrop dismissal, document
scroll locking, and contained focus. Non-modal Drawer uses `show()`, does not expose
`aria-modal`, has no backdrop, does not lock document scroll, and leaves the rest of the
document operable. Switching mode while open closes and reopens the native dialog so the
browser state matches the public contract.

Open state is controlled in core and DOM. User actions request dismissal; the owner
closes by updating `open`. Escape defaults to enabled in both modes, while backdrop
dismissal defaults to disabled and applies only to modal mode. The close button is
always available.

## Focus and keyboard

Opening records the active element and focuses, in order: an explicit target,
`data-morfira-drawer-initial-focus`, `autofocus`, the first tabbable descendant, or the
dialog itself. Closing restores an explicit connected target or the opener when
configured. Modal focus containment is browser-owned. Non-modal focus is not trapped.
Escape requests close without mutating controlled state. Teardown closes the native
dialog, releases its own scroll lock, removes listeners, restores managed attributes,
and does not emit late dismissal.

## Responsive layout, motion, and styling

The surface attaches to the selected logical inline edge and fills the viewport block
size. Sizes are `sm`, `md`, and `lg`, capped by the viewport. On narrow viewports every
size becomes full inline width. Entry motion follows the logical side; reduced-motion
removes it. Forced colors preserve boundaries and controls. The body owns scrolling and
overscroll containment.

## SSR and adapters

SSR never renders `open`, because native `open` is not equivalent to imperative modal
activation and would create a pre-hydration mode mismatch. Deterministic ARIA and data
attributes render on the server. React exposes controlled `open`, Vue uses `modelValue`,
and Svelte uses bindable `open`; each delegates browser effects to the same DOM
controller and exposes the same dismissal reasons.

## Conformance

Tests cover option/ID validation, modal and non-modal activation, mode switching,
Escape/backdrop policy, initial and restored focus, reference-counted modal scroll
locks, RTL styling hooks, rapid updates, native close reconciliation, teardown, SSR
safety, and adapter contracts.
