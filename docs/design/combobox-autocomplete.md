# Combobox and Autocomplete contract

Status: Phase 3 implementation contract. Automated engine coverage does not replace
released-browser and manual assistive-technology certification.

Combobox and Autocomplete provide text entry with a related listbox. Combobox commits
only a supplied option. Autocomplete may keep arbitrary text and optionally commit a
suggestion. Neither component is a menu, native Select replacement, tag editor, or
multi-select.

## Anatomy and state

The anatomy is one labelled text input and one non-focusable listbox containing option
elements. A consumer may add visible label, help, error, loading, empty, and status
content around that anatomy. Every instance requires stable, caller-provided `inputId`
and `listboxId`; every option requires a unique stable `id`, `value`, and visible
`label`. IDs must be deterministic across SSR and hydration.

State consists of `query`, `open`, `activeId`, options, loading, disabled, readonly, and
invalid. Combobox additionally exposes a selected value. Autocomplete exposes the text
value and an optional selected suggestion. Controlled owners receive change requests
without adapters inventing a divergent committed value. Uncontrolled adapters own their
documented defaults. Replacing options clears an orphaned active option and chooses the
first enabled visible option only while the popup is open.

The default filter is case-insensitive substring matching across label, value, and
optional keywords. Consumers may provide already filtered options. Empty and
all-disabled result sets are valid. Duplicate IDs or values and IDs containing ASCII
whitespace are rejected.

## Keyboard and focus

DOM focus remains on the input while the popup is navigated:

- Arrow Down opens the list and activates the next enabled option;
- Arrow Up opens the list and activates the previous enabled option;
- Home and End move to the first and last enabled visible option while open;
- Enter commits the active option while open and prevents form submission;
- Escape closes without committing and does not erase typed text;
- Tab closes without being prevented, preserving normal document navigation;
- printable input updates the query, opens when useful, and resets active choice;
- pointer selection keeps the input as the focus owner and commits once.

Navigation does not wrap. Disabled options are never active or selectable. Opening by
keyboard activates the first enabled option for Arrow Down and the last for Arrow Up.
Closing removes `aria-activedescendant`. Selection closes the popup and leaves focus in
the input. The component does not trap focus or restore focus after the consumer moves
it elsewhere.

## Accessibility

The input uses `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, and
`aria-controls`. It references the active option with `aria-activedescendant` only while
that option is rendered. The popup uses `role="listbox"`; children use `role="option"`,
`aria-selected`, and `aria-disabled`. The listbox is hidden when closed.

Loading and empty messages are visible status content supplied by the adapter and are
not options. Dynamic result-count or error announcements belong in a nearby polite live
region; the component must not announce every keystroke twice. A visible label remains
required. Placeholder text is not a label. Invalid state uses `aria-invalid` plus a
described error, never color alone.

Public hooks are `[data-morfira-combobox]`, `[data-morfira-combobox-input]`,
`[data-morfira-combobox-listbox]`, and `[data-morfira-combobox-option]`. The root
exposes `data-state="open|closed"` plus optional `data-loading`, `data-disabled`, and
`data-invalid`; options expose `data-active`, `data-selected`, and `data-disabled`.

## Async and lifecycle

Adapters may accept an async option loader. Each query receives a monotonically
increasing request token. Only the latest still-live request may replace options or
report an error. A later query, disabling the component, or unmounting invalidates all
older requests. Loading state belongs to the same token. Promise cancellation is not
assumed, though consumers may cancel inside their loader.

The DOM enhancement owns only listeners and attributes it installs, supports repeated
controlled updates, and restores captured attributes on teardown. It does not read
browser globals at module evaluation. Nested instances respond only to their own input
and options.

## Adapters and SSR

React exposes `value`/`defaultValue` and change callbacks; Vue uses `modelValue` and
`update:modelValue`; Svelte uses a bindable value. Combobox additionally exposes the
selected option value. Adapters preserve native input props where they do not conflict
with the ARIA contract, forward input refs or bindings, and render deterministic closed
SSR markup. Async loading starts only after client interaction, never during server
render. Hydration must not generate IDs or reorder initial options.

## Styling

Import `@morfira-dev/css/combobox.css` independently. Autocomplete deliberately shares
the same anatomy and stylesheet. The popup uses logical positioning and spacing,
viewport-bounded size, semantic surface and border tokens, non-color active and selected
indicators, visible focus, RTL-safe layout, forced-color system colors, and reduced
motion. CSS never hides the accessible input or moves DOM focus into the listbox.

## Verification and limitations

The complete gate covers filtering, empty and all-disabled data, every keyboard command,
pointer selection, controlled and uncontrolled updates, late async resolution and
rejection, unmount, focus ownership, ARIA references, forms, RTL, zoom, narrow
viewports, light/dark/forced colors, reduced motion, SSR/hydration, axe, isolated
imports, declarations, source maps, and gzip budgets.

The initial contract excludes multiple selection, chips, grouped or virtualized options,
inline completion, automatic remote debouncing, create-new rows, custom option focus,
and automatic floating collision handling. These require separate evidence and public
contracts.
