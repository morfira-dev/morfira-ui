# Phase 3 manual browser and accessibility verification

This protocol records evidence that cannot be inferred from static checks or Playwright
browser engines. Bundled WebKit is not released Safari and bundled Firefox is not
Firefox ESR. Earlier phase certification remains a separate pending gate.

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
   `pnpm check` and `pnpm build`, then serve the Phase 3 playground used by the
   candidate.
2. Record light and dark themes, LTR and RTL, 100% and 200% zoom, a narrow viewport,
   reduced motion, and the platform high-contrast or forced-color mode.
3. Complete one keyboard-only pass and repeat floating-layer checks with mouse,
   trackpad, and a touch-capable device where available.
4. Preserve screenshots or recordings for visual defects and include browser/version
   chrome where practical.

## Menu and Dropdown

- Open and close every Dropdown with pointer, Enter, Space, ArrowDown, ArrowUp, Escape,
  outside pointer, and trigger reactivation. Confirm focus returns only when policy
  requires it.
- Enter each Menu and exercise Up, Down, Home, End, wrapping boundaries, disabled-item
  skipping, printable-character typeahead, and activation. Verify exactly one enabled
  item participates in roving focus.
- Check separators, groups, checked items, radio-style items, destructive actions, and
  submenus where supported. State must not depend on color or icon shape alone.
- Resize and scroll while open. Confirm logical placement, viewport collision handling,
  RTL alignment, zoom readability, and no appearance at the viewport origin.
- Nest a Dropdown near a Dialog, Popover, and another menu. Dismissing one layer must
  not close or move focus through an unrelated layer.

## Combobox and Autocomplete

- Type, delete, paste, clear, and compose text with an IME. Confirm native text editing
  remains available and stale async results never replace a newer query.
- Open with typing and the documented arrow gesture; navigate enabled options with
  arrows, Home, End, Page Up, and Page Down where implemented. Confirm Escape, blur,
  Tab, and Enter follow the documented commit and dismissal policy.
- Verify `aria-expanded`, `aria-controls`, `aria-activedescendant`, option names,
  selected state, result count or status messaging, loading, empty, error, readonly,
  required, invalid, and disabled states.
- Compare editable Combobox selection with Autocomplete suggestion behavior. Free-form
  input must not silently become a committed option, and a suggestion must not replace
  the user's value without the documented action.
- Repeat with duplicate-looking labels, long labels, dynamic option removal, remote
  results, 200% zoom, a narrow viewport, RTL, touch, and forced colors.

## Toast and Drawer

- Trigger each Toast severity and verify its name, description, action, close control,
  announcement priority, and dismissal reason. Repeated updates must not cause duplicate
  or excessively interruptive announcements.
- Confirm timers pause under the documented hover, focus, page visibility, and reduced
  motion conditions. Keyboard users must have enough time to reach actions; persistent
  notifications must remain until explicitly dismissed.
- Open Drawer from each supported edge and verify accessible name, initial focus,
  natural Tab order, Escape, backdrop close policy, scroll locking, inert background,
  nested overlays, and focus restoration.
- At narrow and wide widths verify Drawer geometry, close-control position, safe-area
  handling, content scrolling, RTL edge meaning, forced colors, and reduced motion.
- Remove Toast and Drawer triggers while open and unmount the surfaces. Teardown must
  not throw, leave the page inert, retain scroll locks, or steal focus.

## Table and product patterns

- Inspect Table accessibility trees and confirm native caption, row, column header, and
  cell relationships remain intact. A styled Table must not expose `grid` semantics.
- Activate sortable-header buttons and verify focus remains on the button, `aria-sort`
  moves to the active `th`, and the application owns the actual sort operation.
- Check compact, comfortable, and spacious density, striping, hover, selected rows,
  sticky headers, horizontal overflow, long content, 200% zoom, RTL, and forced colors.
  Every column must remain reachable.
- Exercise the application-shell composition with landmarks, skip navigation, responsive
  Drawer navigation, route changes, and focus placement.
- Apply, clear, and rapidly replace filters. Verify loading, empty, error, result count,
  URL/state ownership, stale-response rejection, and focus retention.
- Select items, change pages and filters, invoke bulk actions, cancel confirmation, and
  verify the visible selection scope and announced result. Hidden selection must never
  be implied or discarded silently.
- In primary-detail layouts distinguish selected item from keyboard focus. At narrow
  widths verify the list-to-detail transition, labelled return action, restored list
  context, deep links, loading, empty, and deleted-item fallback.

## Screen-reader pass

With VoiceOver plus Safari and NVDA plus Firefox ESR:

- Record role, name, expanded, selected, checked, disabled, required, invalid, current,
  position, set size, and live-region announcements for applicable Phase 3 controls.
- Confirm Menu navigation and typeahead do not produce duplicate focus announcements.
- Confirm Combobox input value, active option, result status, selection, and errors are
  announced once and remain understandable during rapid updates.
- Confirm Toast urgency is proportionate and Drawer modal state does not expose inert
  background controls in the navigation order.
- Confirm native Table reading commands work and product patterns preserve landmark,
  heading, list, and table structure.

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

Phase 3 may be declared stable only when automated gates pass for the same candidate and
all required release-matrix rows contain passing records. A failure stays open until the
affected released browser and assistive-technology pairing verifies the fix.
