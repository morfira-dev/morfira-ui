# Tabs and Accordion contract

Status: Phase 2 implementation in progress. Keyboard, dynamic-state, SSR, browser, and
assistive-technology gates remain required before stability is declared.

Tabs and Accordion organize related content without replacing document structure.
Callers provide explicit unique IDs so relationships remain deterministic in SSR and
hydration.

## Tabs anatomy and API

Tabs consists of one tab list, ordered tab triggers, and one panel per trigger. Every
item has a `tabId`, `panelId`, disabled state, label, and panel content. State supports
a selected ID, horizontal or vertical orientation, automatic or manual activation, and
optional looping. Framework adapters expose controlled state and an idiomatic default
selected value.

The list has `role="tablist"` and `aria-orientation`; triggers have `role="tab"`,
`aria-controls`, `aria-selected`, and roving `tabindex`; panels have `role="tabpanel"`
and `aria-labelledby`. Only the selected panel is exposed. Public hooks are the semantic
list `[data-morfira-tabs]`, `[data-morfira-tab]`, and `[data-morfira-tab-panel]`;
adapters that need one containing element use `[data-morfira-tabs-root]`. The list
exposes `data-orientation`; tabs and panels expose `data-state="active|inactive"`.

Keyboard behavior:

- horizontal lists use Left and Right; vertical lists use Up and Down;
- horizontal arrows follow visual direction in RTL;
- Home and End move to the first and last enabled tab;
- disabled tabs are skipped;
- automatic activation selects when focus moves;
- manual activation moves focus only, then Enter or Space selects;
- Tab enters at the selected enabled tab and then continues into page content.

The initial contract does not include closable tabs, drag reordering, overflow menus, or
panel lazy-loading policy.

## Accordion anatomy and API

Accordion is a group of native `<details>` items. Each item starts with a native
`<summary>` trigger and contains one labelled panel region. Every item has an explicit
`triggerId`, `panelId`, disabled state, title, and panel content. Expansion is
represented as a list of trigger IDs in both single and multiple mode, avoiding
framework-specific string-or-array ambiguity. `collapsible=false` prevents the final
expanded item from closing.

Native details and summary own basic disclosure semantics, Enter and Space activation,
and document behavior. The DOM controller coordinates controlled state, single versus
multiple expansion, disabled summaries, and deterministic teardown. Down and Up move
between enabled summaries; Home and End move to the first and last enabled summary.

Public hooks are `[data-morfira-accordion]`, `details[data-morfira-accordion-item]`,
`summary[data-morfira-accordion-trigger]`, and `[data-morfira-accordion-panel]`, with
`data-state="open|closed"`. Triggers expose `aria-controls` and `aria-expanded`; panels
use `role="region"` and `aria-labelledby`. Disabled summary is expressed with
`aria-disabled="true"`, removed from sequential focus, and prevented from toggling
because summary has no native disabled attribute.

## Adapter and lifecycle contract

React uses selected or expanded props with corresponding default props and change
callbacks. Vue uses `modelValue` and `update:modelValue`. Svelte exposes bindable
values. All adapters preserve explicit item order and IDs, update when state changes,
and avoid client-only ID generation. Controlled callbacks request a state change;
adapters do not silently diverge from the owner-provided value.

Dynamic removal of a selected tab or expanded item must produce the documented core
fallback rather than leave an orphaned ARIA relationship. Empty and all-disabled sets
must remain safe. Nested Tabs or Accordions own only their nearest instance. Teardown
restores managed DOM attributes and native open state.

## Styling and verification

Import `@morfira-dev/css/tabs.css` or `@morfira-dev/css/accordion.css` independently.
Styles use logical borders and spacing, minimum touch targets, visible focus, non-color
active indicators, forced-color fallbacks, and reduced motion. Tabs orientation and
Accordion expansion are public data states; component logic does not depend on generated
class names.

The complete gate covers every keyboard command, RTL horizontal Tabs, automatic and
manual activation, looping boundaries, disabled and all-disabled items, single and
multiple Accordion state, non-collapsible behavior, nested instances, rapid controlled
updates, dynamic insertion and removal, native summary activation, refs/bindings,
SSR/hydration, axe, zoom, themes, forced colors, reduced motion, visual regression,
isolated imports, declarations, source maps, and gzip budgets. Released-browser and
screen-reader results are recorded in the Phase 2 manual matrix.
