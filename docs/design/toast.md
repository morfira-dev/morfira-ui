# Toast contract

Status: Phase 3 implementation contract. Automated engine coverage does not replace
released-browser and manual assistive-technology certification.

## Purpose and anatomy

Toast reports a completed or newly changed state without moving focus. A toast contains
an optional visible title, message content, and an optional labelled dismiss button.
Applications own the viewport, ordering, queue limits, and history; a single Toast owns
only its announcement, timeout, pause, and dismissal lifecycle.

Public states are `data-morfira-toast`, `data-tone`, `data-state`, and `data-paused`.
Public anatomy hooks are `data-morfira-toast-title`, `data-morfira-toast-body`, and
`data-morfira-toast-close`.

## State and live-region policy

- `neutral`, `success`, and `info` use `role="status"` with `aria-live="polite"`.
- `warning` and `danger` use `role="alert"` with `aria-live="assertive"` only when the
  message requires prompt attention. Tone is never the only visible carrier of meaning.
- The complete toast is atomic. Updates to an existing toast are not a substitute for a
  new event and may be re-announced by assistive technology.
- Toast never receives focus on appearance. Interactive workflows and errors requiring a
  decision belong in Dialog or inline validation instead.

`duration` is milliseconds or `null` for a persistent toast. A positive duration starts
after enhancement. The remaining time pauses while pointer hover, focus within, or
document invisibility applies, then resumes without resetting. Timeout and close-button
dismissals are requests; controlled owners remove the toast. Teardown cancels every
timer and listener, and late callbacks cannot dismiss.

## Keyboard, focus, and motion

Toast adds no composite keyboard model. Its dismiss button is a normal button and uses
the shared focus-visible contract. Dismissal never restores or redirects focus. Enter
and Space activate the native button. Motion is decorative and disabled under
`prefers-reduced-motion: reduce`; timer duration is unchanged because users can pause by
hovering or focusing and applications can choose a persistent toast.

## SSR and adapters

Server markup includes deterministic role, live-region, tone, and state attributes but
does not start a timer. DOM enhancement is the only timer/listener owner. React exposes
controlled `open`, Vue uses `modelValue`, and Svelte uses bindable `open`; all adapters
emit the same `timeout` or `close-button` reason and render identical semantics.

## Styling and conformance

Toast uses semantic surface, content, border, status, spacing, radius, shadow, motion,
and focus tokens. CSS uses logical properties, supports RTL and forced colors, and does
not position a global viewport. Conformance covers live-region mapping, pause/resume,
visibility, latest callbacks, idempotent teardown, SSR safety, and adapter dismissal.
