# Primary-detail pattern

Status: Phase 3 composition contract.

Primary-detail presents a collection and the currently selected item's details while
preserving a coherent navigation model across viewport sizes.

## Wide layout

The primary region contains a list, Table, or future Data Grid. The detail region is a
named complementary region when it supplements the list, or part of `main` when it is
the primary task. Selection and keyboard focus are separate: changing the selected item
does not move focus unless the user invokes navigation that explicitly enters detail.

The selected item uses a non-color indicator and, where appropriate, `aria-current` or
`aria-selected` according to its native role. Detail headings identify the selected
record. Loading a new record preserves the region and announces the update without
rebuilding the entire shell.

## Narrow layout

The pattern becomes sequential navigation rather than squeezing both regions together.
Opening detail records a return target; Back restores the list state, scroll position,
selection, and focus when that target still exists. A Drawer is appropriate for short
supporting detail, not for long primary workflows that need their own route.

## Async and destructive changes

Late detail responses cannot overwrite a newer selection. Deleted or filtered-out items
move selection predictably and announce the result. Unsaved edits require an explicit
navigation guard owned by the application. URLs should represent shareable selection
when the product supports deep links.

## Verification

Test keyboard and pointer selection, rapid changes, loading and errors, deletion,
filtering, browser navigation, resize across the layout breakpoint, focus restoration,
scroll restoration, RTL, zoom, SSR/hydration, and long translated content.
