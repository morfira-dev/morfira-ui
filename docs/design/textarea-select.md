# Textarea and Select contract

Status: Phase 2 implementation in progress. Automated and manual verification remains
required before either component is stable.

Textarea and Select extend the native-first Field and Input composition. Field owns the
visible label, helper text, validation message, IDs, and accessible relationships.
Textarea and Select own their native editing or selection element and do not add a
second value model.

## Textarea

Textarea renders a native `<textarea>`. It supports `sm`, `md`, and `lg`; validation
states `none`, `error`, `warning`, and `success`; resize modes `none`, `vertical`, and
`both`; and native disabled, readonly, and required state. Native `rows`, `cols`,
`minLength`, `maxLength`, `wrap`, `name`, `form`, controlled value, and default value
remain available. Automatic height growth is not part of the initial contract.

The root hook is `textarea[data-morfira-textarea]`. Public state hooks are `data-size`,
`data-validation`, and `data-resize`. Public variables are
`--morfira-textarea-border-color` and `--morfira-textarea-min-block-size`.

Text editing, selection, platform shortcuts, spellcheck, and browser form behavior stay
native. Readonly Textarea remains focusable and submitted; disabled Textarea does not.
When composed with Field it receives the Field label, description, error relationship,
size, required state, and validation state without generating client-only IDs.

## Select

Select renders a native `<select>`, including native `<option>` and `<optgroup>`
children. It supports visual `size` values `sm`, `md`, and `lg`; validation states;
disabled, required, and multiple selection. Adapters expose the native value conventions
of their framework, including string-array values for multiple selection.

The visual `size` API is distinct from HTML select's row-count attribute. Adapters that
expose the row count name it `visibleRows` and map it to the native `size` attribute.
Consumers create placeholder behavior with a real empty option; Morfira does not invent
a non-native placeholder. Browser typeahead, option navigation, popup rendering, form
submission, and reset stay native.

The root hook is `select[data-morfira-select]`. Public state hooks are `data-size`,
`data-validation`, and `data-multiple`. Public variables are `--morfira-select-size` and
`--morfira-select-border-color`.

## Accessibility and visual behavior

- Both controls use the Field-provided `aria-labelledby`, `aria-describedby`, and
  `aria-errormessage` relationships when composed with Field.
- Error state sets `aria-invalid="true"`; warning and success remain textual Field
  messages without misusing invalid state.
- Validation is not color-only: the owning Field message supplies explicit text and a
  supplementary status cue.
- Focus is a single compact boundary. A composed Field shell must not draw a duplicate
  outline.
- Logical padding, resize affordances, and the Select indicator work in RTL.
- Forced-colors mode restores system field rendering where custom appearance would hide
  native state. Reduced-motion mode removes transitions.

Import styles independently from `@morfira-dev/css/textarea.css` and
`@morfira-dev/css/select.css` together with the chosen theme and, when composed, Field
styles.

## Limitations

Select is intentionally a native select, not a custom listbox, combobox, or
autocomplete. Search, remote options, free-form input, virtualization, and custom option
interaction belong to the Phase 3 Combobox and Autocomplete work. Native popup
appearance can vary by operating system and browser; Morfira guarantees the closed
control and documented states, not pixel-identical platform menus.

## Verification

The full gate covers native value and change events, form payload/reset/validity,
multiple values, optgroups, disabled options, readonly versus disabled Textarea,
selection and editing, Field relationships, controlled and uncontrolled adapters,
SSR/hydration, RTL, zoom, dark theme, forced colors, reduced motion, visual regression,
isolated imports, declarations, source maps, and size budgets. Browser autofill,
platform Select popups, and screen-reader announcement order remain manual evidence.
