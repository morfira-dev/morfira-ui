# Checkbox, Radio, and Switch contract

Status: Phase 2 implementation in progress. The public contract is implemented across
the shared layers only when the repository gate and the Phase 2 manual matrix pass.

These controls preserve native form behavior. Morfira supplies state resolution,
consistent DOM hooks, adapter bindings, and visual treatment; it does not replace
browser activation, label behavior, form submission, reset, or validation.

## Anatomy and public API

`Checkbox` renders an `input[type="checkbox"]`. It supports `sm`, `md`, and `lg`, plus
`checked`, `defaultChecked` where the framework provides it, `indeterminate`,
`disabled`, and `required`. Native `name`, `value`, `form`, and change events remain
available. Indeterminate is a visual and accessible mixed state, not a third submitted
value, and must be reapplied through the element property after hydration.

`Radio` renders an `input[type="radio"]`. Radios form a group through the native shared
`name` contract. Morfira does not add a second group store or intercept browser
arrow-key selection. It supports the same sizes and native checked, disabled, and
required state. A higher-level RadioGroup may be added only after a complete group-label
and error contract is designed.

`Switch` renders an `input[type="checkbox"]` exposed with `role="switch"`. It supports
only on and off; indeterminate is intentionally absent. The accessible name comes from a
real label, `aria-label`, or `aria-labelledby`, never from decorative on/off text.

React uses native controlled `checked` and uncontrolled `defaultChecked` conventions.
Vue uses `modelValue` and `update:modelValue`. Svelte Radio uses its idiomatic required
`value` plus bindable `group`; Checkbox and Switch expose bindable checked state.
Adapters preserve native event objects and element refs or bindings.

## DOM and styling contract

| Component | Root hook                      | Public state hooks                                   |
| --------- | ------------------------------ | ---------------------------------------------------- |
| Checkbox  | `input[data-morfira-checkbox]` | `data-size`, `data-indeterminate`, native `:checked` |
| Radio     | `input[data-morfira-radio]`    | `data-size`, native `:checked`                       |
| Switch    | `input[data-morfira-switch]`   | `data-size`, `data-checked`, native `:checked`       |

The public component variables are `--morfira-checkbox-size`,
`--morfira-checkbox-border-color`, `--morfira-checkbox-background`,
`--morfira-radio-size`, `--morfira-switch-inline-size`, `--morfira-switch-block-size`,
and `--morfira-switch-gap`. Component styles are imported independently from
`@morfira-dev/css/checkbox.css`, `radio.css`, and `switch.css`.

Sizes change control geometry, not only text. Focus uses `:focus-visible`; disabled
controls preserve a visible boundary. Forced-colors mode restores native appearance so
system colors and state indicators remain reliable. Reduced-motion mode removes switch
and indicator transitions. Logical sizing and positioning preserve RTL behavior.

## Accessibility and keyboard

- Space activates all three controls through the browser. Enter is not added to Switch.
- Clicking an associated label activates the control and moves focus according to
  platform behavior.
- Same-name radios use native arrow-key navigation and single selection.
- Disabled controls are removed from keyboard interaction and form submission.
- Required and checked state remain native form semantics.
- Checkbox mixed state exposes `aria-checked="mixed"`; it does not change the submitted
  checked value by itself.
- Meaning is visible through shape or indicator changes and never depends on color.

## SSR, teardown, and limitations

SSR emits deterministic native markup. Hydration must preserve controlled versus
uncontrolled state, and Checkbox must synchronize the non-attribute `indeterminate`
property without changing the submitted value. DOM enhancers snapshot and restore every
attribute or property they own and ignore updates after destruction.

These components do not render label text, descriptions, or group legends. Compose a
single control with Field where its label order is suitable; use native `fieldset` and
`legend` for groups until a dedicated group pattern exists.

## Verification

The complete gate covers resolver state, native submit/reset and label activation,
controlled and uncontrolled adapters, explicit refs, SSR/hydration, same-name radio
keyboard behavior, mixed Checkbox state, Switch announcements, disabled/required state,
RTL, dark theme, forced colors, reduced motion, visual regression, isolated imports,
declarations, source maps, and gzip budgets. Released-browser and screen-reader evidence
is recorded separately in the Phase 2 manual matrix.
