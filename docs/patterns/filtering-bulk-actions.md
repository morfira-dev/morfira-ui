# Filtering and bulk actions pattern

Status: Phase 3 composition contract.

Filtering and bulk actions coordinate form controls, result state, selection, and
feedback. They are application workflows, not one generic toolbar component.

## Filtering

Filters belong to a named `search` or form region. Text search uses a visible label;
bounded choices use Select, Checkbox, Radio, or Combobox according to the data model.
Applied filters are represented by visible text and removable controls. A clear-all
action is available only when at least one non-default filter is active.

Submitting or changing filters must communicate loading and result changes without
moving focus unexpectedly. The application owns URL/query serialization and remote
requests. Late responses must not replace newer results. Empty filtered results explain
that filters are active and provide a direct recovery action.

## Selection and bulk actions

Selection is explicit and independent from row focus. A native Checkbox selects each
item; a header Checkbox represents none, some, or all visible items. Selecting all
results across pages is a separate acknowledged action, never an accidental extension of
selecting the current page.

The bulk-action region states the selection count in visible text. Destructive actions
use clear labeling and confirmation proportional to impact. After completion, focus
returns to a stable surviving control and the result is announced. If selected items
disappear after filtering or refresh, the application reports how selection changed.

## Responsive and accessibility rules

Controls wrap without changing their logical order. Overflow actions may move into a
Menu, but primary recovery and destructive actions remain identifiable. Status cannot
depend only on badge color. Touch targets, forced colors, RTL, 200% zoom, keyboard-only
operation, and screen-reader announcements are required.

## Verification

Test empty and populated results, rapid filter changes, failed requests, partial and
cross-page selection, disabled actions, destructive confirmation, item removal,
responsive wrapping, RTL, and focus retention after every state transition.
