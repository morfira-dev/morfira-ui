# Tooltip and Popover contract

Status: Phase 2 implementation in progress. These floating layers are not stable until
positioning, dismissal, touch behavior, released browsers, and assistive technologies
pass the complete verification matrix.

Tooltip and Popover share placement vocabulary and deterministic lifecycle principles,
but not semantics. Tooltip supplies a short non-interactive description. Popover is a
non-modal disclosure that may contain interactive content. Neither is a modal Dialog.

## Tooltip anatomy and API

A Tooltip has one trigger and one content element with `role="tooltip"`. The caller
provides an explicit `contentId`; while open, the trigger references it with
`aria-describedby`. Any pre-existing description IDs are preserved. Supported logical
placements are `block-start`, `block-end`, `inline-start`, and `inline-end`. The API
supports controlled open state, disabled state, and non-negative open and close delays.

Pointer hover and keyboard focus request opening. Pointer leave and blur request closing
after the configured delay. Moving the pointer from trigger to content keeps it visible,
satisfying dismissible and hoverable content requirements. Escape requests immediate
close. Tooltip never moves focus and its content must not contain controls or links.

Public hooks are `[data-morfira-tooltip-trigger]` and `[data-morfira-tooltip]`, with
`data-state="open|closed"` and `data-placement`. Positioning publishes
`--morfira-tooltip-anchor-x` and `--morfira-tooltip-anchor-y` on the content element.

## Popover anatomy and API

A Popover has one trigger and one non-modal content surface. The caller supplies an
explicit `contentId` and an accessible name for dialog-like content. The trigger exposes
`aria-controls`, `aria-expanded`, and `aria-haspopup="dialog"`. Supported options are
controlled or uncontrolled open state, disabled state, logical placement, Escape and
outside-pointer dismissal policies, and focus restoration.

Trigger activation requests open or close. Escape and an outside primary pointer action
request close according to policy. Closing may restore focus to the connected trigger.
Popover does not lock document scrolling, make surrounding content inert, or trap focus.
Consumers remain responsible for a sensible focus order inside the disclosed content.

The DOM layer uses the native Popover API when present and retains the explicit hidden
state as progressive behavior. Positioning is based on the trigger rectangle and is
updated on viewport resize and captured scroll. CSS Anchor Positioning is not required.

Public hooks are `[data-morfira-popover-trigger]` and `[data-morfira-popover]`, with
`data-state` and `data-placement`. Positioning publishes `--morfira-popover-anchor-x`
and `--morfira-popover-anchor-y`.

## Adapter contract

Adapters accept exactly one trigger capable of receiving the required attributes and an
element ref or binding. React merges the trigger ref while preserving its event props;
Vue uses one trigger slot and element ref; Svelte supplies an idiomatic trigger snippet
or action contract. Each adapter supports controlled state and an explicit default for
uncontrolled state, reports open-change reasons, and emits deterministic SSR IDs and
initial hidden state. A wrapper that becomes an extra focus target is not allowed.

## Styling and accessibility

Import `@morfira-dev/css/tooltip.css` or `@morfira-dev/css/popover.css` independently.
Both surfaces use logical placements, viewport-constrained inline sizes, theme semantic
colors, forced-color system surfaces, and reduced-motion fallbacks. `data-placement`
describes the resolved logical side and supports RTL without changing public values.

Tooltip is an accessible description, not a replacement for a visible label. Essential
information and error messages must not exist only inside a Tooltip. Popover content
with `role="dialog"` must have an accessible name. Menu semantics, roving menu focus,
modal focus containment, and Dialog behavior are outside Popover.

## Verification and limitations

The complete gate covers focus and pointer entry/exit, delay cancellation, Escape,
outside-pointer sequences, pre-existing descriptions, nested layers, rapid controlled
updates, teardown while open, disconnected triggers, focus restoration, native Popover
availability, viewport resize and scroll, all placements in LTR and RTL, zoom, narrow
viewports, forced colors, reduced motion, SSR/hydration, visual regression, isolated
imports, declarations, source maps, and size budgets.

Automatic collision flipping and arrow rendering are not part of the initial contract.
Touch-only disclosure must use Popover rather than a hover-only Tooltip. Exact native
top-layer behavior and screen-reader announcement order require released-browser manual
evidence.
