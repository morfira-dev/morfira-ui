# Phase 2 manual browser and accessibility verification

This protocol records evidence that cannot be inferred from static checks or Playwright
browser engines. Do not treat bundled WebKit as released Safari or bundled Firefox as
Firefox ESR. Phase 1 external certification remains a separate pending gate.

## Required release matrix

Record exact versions, operating system, date, tester, commit, and result for every row.

| Target      | Required environment                                                   | Evidence status         |
| ----------- | ---------------------------------------------------------------------- | ----------------------- |
| Safari      | Latest two released stable Safari versions on supported macOS versions | Pending manual evidence |
| Firefox ESR | Current released Firefox ESR on a supported desktop OS                 | Pending manual evidence |
| VoiceOver   | Released Safari paired with its supported macOS version                | Pending manual evidence |
| NVDA        | Current NVDA with Firefox ESR on Windows                               | Pending manual evidence |

## Setup and modes

1. Check out the exact candidate commit, install with the locked pnpm version, run
   `pnpm check` and `pnpm build`, then serve the Phase 2 playground used by the
   candidate.
2. Record light and dark themes, LTR and RTL, 100% and 200% zoom, a narrow viewport,
   reduced motion, and the platform high-contrast or forced-color mode.
3. Use a keyboard without a pointer for the keyboard pass. Repeat floating-layer checks
   with mouse, trackpad, and a touch-capable device where available.
4. Preserve screenshots or recordings for visual defects and include browser/version
   chrome where practical.

## Native form controls

For Checkbox, Radio, Switch, Textarea, and Select:

- Activate associated labels and confirm the correct control receives focus and state.
- Submit and reset a real form. Record checked values, same-name radio selection,
  multiple Select values, required validity, disabled omission, and Textarea text.
- Confirm Checkbox unchecked, checked, and mixed appearance and announcement. Mixed
  state must not invent a third submitted value.
- Navigate a same-name Radio group with arrows. Confirm one selection, disabled-item
  skipping, and normal Tab entry and exit.
- Toggle Switch with Space. Confirm on/off and disabled state are announced as a switch;
  Enter must not gain an adapter-specific behavior.
- Edit, select, copy, and scroll Textarea content. Compare readonly and disabled state,
  resize modes, spellcheck, and native browser autofill where available.
- Exercise Select with pointer, keyboard typeahead, arrows, Home/End where provided by
  the platform, optgroups, disabled options, multiple selection, and visible row count.
- Check Field labels, helper text, required state, invalid state, and error messages for
  Textarea and Select. Confirm focus draws one compact boundary.
- At every size confirm control geometry changes, target size stays usable, status does
  not depend on color, and forced colors retain native state indicators.

## Tooltip and Popover

- Open Tooltip from pointer hover and keyboard focus. Verify configured delay, stable
  placement, readable wrapping, and preservation while moving the pointer onto content.
- Leave both trigger and Tooltip, blur the trigger, and press Escape. Confirm each
  closes by policy, stale timers do not reopen it, and focus never moves into Tooltip
  content.
- Confirm any pre-existing accessible description remains and the Tooltip description is
  announced once while open. Verify Tooltip content contains no interactive descendants.
- Open Popover from its trigger and verify accessible name, expanded state, content
  controls, natural Tab order, Escape, trigger close, outside-pointer close, and focus
  restoration. Confirm background content is not made inert and document scrolling is
  not locked.
- Repeat both components at each logical placement near every viewport edge, after page
  scroll, inside a scrolling container, after viewport resize, at 200% zoom, and in RTL.
  Content must remain discoverable and must not appear at the viewport origin.
- Exercise nested Popovers and a Popover near a Dialog without dismissing an unrelated
  layer. Remove the trigger while open and confirm teardown does not throw or steal
  focus.
- On touch, confirm essential information is not available only through Tooltip hover;
  use Popover for touch-operable disclosure.

## Tabs and Accordion

- Enter each Tabs set with Tab and confirm only the selected enabled tab is in the
  roving sequence. Exercise horizontal and vertical arrows, Home, End, disabled tabs,
  looping and non-looping boundaries.
- Compare automatic activation with manual activation. In manual mode focus must move
  without changing the panel until Enter or Space.
- In RTL confirm horizontal arrow movement follows visual direction. Panel names and
  selected state must remain unchanged.
- Insert and remove selected, focused, disabled, first, and last tabs in the interactive
  fixture. Confirm deterministic fallback and no orphaned accessible relationships.
- Activate every native Accordion summary with Enter, Space, and pointer. Exercise
  single, multiple, collapsible, and non-collapsible state.
- Use Up, Down, Home, and End between enabled summaries. Disabled summaries must not
  toggle or become a sequential keyboard stop.
- Confirm expanded/collapsed state, panel region name, nested instances, and dynamic
  item removal are announced without duplicate headings or regions.
- At 200% zoom and narrow width, confirm labels wrap without covering indicators and all
  content remains available without two-dimensional scrolling.

## Screen-reader pass

With VoiceOver plus Safari and NVDA plus Firefox ESR:

- Record role, name, checked/selected/expanded, mixed, disabled, readonly, required, and
  invalid announcements for every applicable Phase 2 control.
- Confirm Tooltip augments rather than replaces the trigger name and does not create a
  keyboard stop.
- Confirm Popover trigger expansion and the named non-modal dialog surface, then verify
  focus restoration after every dismissal path.
- Confirm Tabs announce position, selected state, disabled state, and labelled panels.
- Confirm Accordion summaries announce collapsed or expanded state and each open region
  has the expected summary-derived name.
- Repeat one representative flow in dark theme and RTL to confirm visual changes do not
  alter reading order or accessible naming.

## Evidence record

Copy for each run:

```text
Commit:
Date and tester:
OS and version:
Browser and exact version:
Assistive technology and exact version:
Input devices:
Themes, direction, zoom, contrast, and motion modes:
Components and scenarios covered:
Result: pass | fail | blocked
Issues and linked evidence:
```

Phase 2 may be declared stable only when automated gates pass for the same candidate and
all required release-matrix rows contain passing records. A failure stays open until the
affected released browser and assistive-technology pairing verifies the fix.
