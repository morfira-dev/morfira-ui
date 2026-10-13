# Table and Data Grid boundary

Status: Phase 3 Table implementation contract and accepted future Data Grid boundary.

Table and Data Grid solve different problems and must not share one overloaded public
API. A semantic Table presents already available tabular content. A Data Grid manages
interactive data exploration, large collections, selection, editing, virtualization, and
application state. Visual similarity does not make them the same component.

## Table

Morfira Table preserves native `table`, `caption`, `thead`, `tbody`, `tfoot`, `tr`,
`th`, and `td` semantics. The component layer may provide styling hooks, density,
striping, hover treatment, sticky-header composition, horizontal overflow, and visible
sort indicators. It does not replace the consumer's elements with generic roles.

Sorting is application-owned. A sortable header contains a real `button`; the active
header uses `aria-sort` on its `th`. Pagination, filtering, row selection, empty states,
and loading states are explicit neighboring compositions rather than hidden Table state.
Responsive behavior preserves access to every column through scrolling or a
consumer-defined alternate presentation; Morfira never removes data based only on
viewport width.

Public styling hooks should be rooted at `[data-morfira-table]` with explicit hooks for
the scroll container, sortable headers, selected rows, and cells only where a stable
consumer need exists. Density changes geometry rather than font size alone.

## Data Grid

Data Grid is a separate future complex component. It may own row and cell navigation,
selection models, editing, column resize and reorder, pinned regions, virtualization,
and remote-data coordination. Each capability requires an independently documented state
and keyboard contract.

The first Data Grid implementation must not:

- infer client-side ownership of remote sorting, filtering, or pagination;
- virtualize without preserving accessible row and column position metadata;
- mix cell navigation and embedded-control interaction without an explicit mode;
- silently discard selection when pages or filters change;
- require every Table consumer to pay for grid state or virtualization;
- claim spreadsheet behavior without the corresponding keyboard and announcement model.

ARIA `grid` is used only when Morfira actually provides grid interaction. A visually
dense native table remains a table. The implementation must document the boundary
between focus on a cell and focus on interactive descendants, Home/End and arrow-key
behavior, edit entry and exit, selection announcements, and virtualization semantics.

## Shared boundaries

Table and Data Grid may share semantic tokens for row separators, headers, selection,
and density after both implementations demonstrate the same need. They may not share a
mandatory runtime controller. Data fetching, cache ownership, query serialization, and
domain-specific cell rendering remain consumer concerns.

## Verification

Table verification requires native semantic inspection, keyboard tests for sortable
headers and row controls, zoom and horizontal-overflow checks, RTL, forced colors, light
and dark visual regression, SSR/hydration, and isolated imports.

Data Grid will require a separate ADR and a larger matrix covering navigation modes,
selection, editing, virtualization, async updates, focus retention, announcements,
pointer and touch interaction, performance budgets, and released assistive technology.
