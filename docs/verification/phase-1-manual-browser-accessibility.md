# Phase 1 manual browser and accessibility verification

This protocol records evidence that cannot be inferred from Playwright's bundled browser
engines. Playwright Chromium, Firefox, and WebKit remain automated behavior gates, but
WebKit is not released Safari and the bundled Firefox build is not Firefox ESR.

## Release matrix

Run this protocol before declaring Phase 1 stable and record the exact browser, browser
version, operating system, assistive technology, date, tester, and result for every run.

| Target      | Required environment                                                       | Evidence status         |
| ----------- | -------------------------------------------------------------------------- | ----------------------- |
| Safari      | The latest two released stable Safari versions on supported macOS versions | Pending manual evidence |
| Firefox ESR | The current released Firefox ESR on a supported desktop OS                 | Pending manual evidence |
| VoiceOver   | Released Safari with the macOS version paired to that Safari release       | Pending manual evidence |
| NVDA        | Current NVDA with Firefox ESR on Windows                                   | Pending manual evidence |

Do not mark a row as passing from a Playwright WebKit or bundled Firefox run. Attach the
test notes and, for visual defects, screenshots with the browser chrome and version page
visible where practical.

## Local released-Safari smoke evidence

The 2026-10-13 stabilization run exercised the DOM playground in released Safari 26.6.2
on macOS 26.6.2. The run confirmed that the first theme activation changes the inherited
theme, the explicit dark subtree remains readable, Button size geometry and Field/Input
states render, and an opened medium Dialog isolates the accessibility tree. Escape
dismissed only the modal content and returned the page accessibility tree.

This is useful released-browser smoke evidence, but it does not complete the Safari or
VoiceOver rows above: only one Safari release was available, VoiceOver was not enabled,
and the automation capture did not reliably composite Safari's native top layer for a
visual Dialog assertion. The Chromium golden image and Playwright WebKit behavior suite
remain separate evidence and must not be presented as substitutes for the pending manual
matrix.

## Setup

1. Check out the exact commit being evaluated, install with the locked pnpm version, and
   run `pnpm build`.
2. Serve the repository root with `python3 -m http.server 4173` and open
   `http://127.0.0.1:4173/apps/playground-dom/`.
3. Keep browser zoom at 100%. Test once with the operating system light appearance and
   once with dark appearance. Do not install extensions that rewrite page styles.
4. Record any browser preference or assistive-technology setting that differs from its
   default.

## Visual and interaction checklist

For both released Safari and Firefox ESR:

- Confirm that the inherited light and explicit dark panels remain readable, including
  the `Explicit dark subtree` heading.
- Activate `Toggle page theme` once and confirm that the inherited theme changes on the
  first activation while the explicit dark subtree stays dark.
- Compare Button small, medium, and large geometry. Confirm that the whole control,
  rather than only its text, changes size. Check primary, secondary, ghost, danger,
  disabled, loading, hover, active, and keyboard-focus states.
- Inspect Field and Input normal, required, error, success, warning, readonly, disabled,
  prefix, and suffix states. Focus the Email Input and confirm that exactly one compact
  focus outline surrounds the composed control.
- Use saved browser contact or account data to trigger autofill where the browser
  permits it. Confirm autofilled text stays readable in both themes, the control
  boundary remains visible, and the label, helper, validation, prefix, and suffix
  relationships do not move or disappear.
- Toggle RTL and confirm that prefixes, suffixes, Dialog close placement, and footer
  actions use logical directions without clipping.
- Open small, medium, and large Dialogs. Confirm that each is centered, remains within
  the viewport, renders its close button level with the title, and keeps header, body,
  and footer content readable.
- In every Dialog, navigate only with Tab and Shift+Tab. Confirm focus cannot leave the
  modal, Escape follows the documented dismissal policy, and focus returns to the
  trigger after close.
- Repeat at 200% browser zoom and at a narrow viewport. Confirm that content remains
  available without two-dimensional scrolling and that Dialog body overflow is usable.
- Enable the operating system high-contrast or increased-contrast setting when the
  platform provides one and verify visible boundaries and focus. Enable reduced motion
  and verify that control and Dialog motion is removed.

## Screen-reader checklist

With VoiceOver plus Safari and NVDA plus Firefox ESR:

- Navigate to every Button and confirm its accessible name, disabled state, and loading
  state are announced without duplicate labels.
- Navigate to every Input and confirm its label, required or readonly state, helper
  text, and validation message. The error Input must announce invalid state and its
  error message; meaning must not depend on color alone.
- Open each Dialog size from its trigger. Confirm that the Dialog role, title, and
  description are announced once and that initial focus lands on `Cancel`.
- Navigate through the Dialog in both directions, activate Close and Cancel, dismiss
  with Escape, and confirm that focus restoration is announced at the originating
  trigger.
- Toggle RTL and both themes and confirm that reading order, accessible names, and
  announcements do not change unexpectedly.

## Evidence record

Copy this block for each manual run:

```text
Commit:
Date and tester:
OS and version:
Browser and exact version:
Assistive technology and exact version:
Light/dark/RTL/zoom modes covered:
Result: pass | fail | blocked
Issues and linked evidence:
```

Phase 1 may be declared stable only after the required release-matrix rows have passing
records for the same release candidate. A failure remains open until the fix is verified
again in the affected released browser and assistive-technology pairing.
