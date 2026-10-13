# Field and Input contract

Status: Phase 1 public contract; CSS and adapters are implemented. DOM browser geometry,
focus, accessible relationships, RTL, reduced motion, forced colors, and automated WCAG
checks run across Chromium, Firefox, and WebKit; React, Vue, and Svelte SSR/hydration
fixtures cover the shared public contract.

Field and Input establish Morfira UI's first form-control composition. PatternFly and
other enterprise systems are capability and accessibility benchmarks only; this anatomy,
visual treatment, naming, and implementation are original to Morfira UI.

## Anatomy and ownership

`Field` owns the relationship between a visible label, one control, optional helper
text, and an optional validation message. `Input` owns a native `<input>` and may render
it in a control shell with non-interactive prefix or suffix content. No icon package is
implied by these hooks; consumers provide their own text or decorative icon nodes.

Native HTML owns text editing, selection, browser autofill, form participation,
`disabled`, and `readonly` behavior. Field and Input do not replace native keyboard
handling or maintain an internal value model.

## Public DOM contract

The stable root hooks are `[data-morfira-field]` and `input[data-morfira-input]`.

| Contract          | Values                                | Meaning                                                                      |
| ----------------- | ------------------------------------- | ---------------------------------------------------------------------------- |
| `data-size`       | `sm`, `md`, `lg`                      | Visual density with distinct 32, 40, and 48 px control sizes.                |
| `data-validation` | `none`, `error`, `warning`, `success` | Validation presentation on Field and/or a standalone Input; always present.  |
| `data-disabled`   | present on Field                      | Mirrors the native disabled control for label and message styling.           |
| `disabled`        | native boolean on Input               | Prevents focus, editing, and form submission.                                |
| `readonly`        | native boolean on Input               | Keeps the value focusable, selectable, and submitted while preventing edits. |

Additional anatomy hooks are `[data-morfira-field-label]`,
`[data-morfira-field-required]`, `[data-morfira-field-control]`,
`[data-morfira-field-prefix]`, `[data-morfira-field-suffix]`, and
`[data-morfira-field-message]`. A message uses `data-message-kind` with `helper`,
`error`, `warning`, or `success`.

IDs are explicit public inputs, never generated from visible labels or client-only
counters. Field adapters accept an input ID and label ID, plus optional helper and
validation-message IDs. The input references all rendered descriptive text with
`aria-describedby`; error state additionally uses `aria-invalid="true"`. This keeps SSR
output deterministic and lets applications coordinate IDs across larger forms.

```html
<div data-morfira-field data-size="md" data-validation="error">
  <label id="email-label" for="email" data-morfira-field-label>
    Email
    <span data-morfira-field-required aria-hidden="true">*</span>
  </label>
  <div data-morfira-field-control>
    <span data-morfira-field-prefix aria-hidden="true">@</span>
    <input
      id="email"
      data-morfira-input
      data-size="md"
      aria-labelledby="email-label"
      aria-describedby="email-helper email-message"
      aria-invalid="true"
      required
    />
  </div>
  <p id="email-helper" data-morfira-field-message data-message-kind="helper">
    Use your work address.
  </p>
  <p id="email-message" data-morfira-field-message data-message-kind="error">
    Enter a complete email address.
  </p>
</div>
```

The required marker is decorative because the native `required` attribute exposes the
requirement. Validation messages must state the problem or success in text; color and
the CSS status glyph are supplementary cues. Adapter-specific live-announcement policy
must avoid announcing untouched validation or duplicating messages already spoken by the
owning form workflow.

## Interaction, state, and focus

- Text entry and standard editing shortcuts remain native; adapters must not intercept
  printable keys, selection keys, or platform editing commands.
- Disabled inputs are not focusable and do not submit a value. Read-only inputs remain
  focusable and submit their value. The two states are intentionally styled differently.
- A standalone input uses `:focus-visible`. A composed control shell uses
  `:focus-within` so prefix and suffix content share one compact focus boundary; the
  nested input does not draw a second outline.
- Field does not move, trap, or restore focus. A form workflow may focus the first
  invalid control after submission, but that behavior is outside this component.
- Value is controlled or uncontrolled according to native DOM or the framework adapter;
  Field owns no second value state.

## Styling and customization

Import themes and each component stylesheet explicitly:

```css
@import '@morfira-dev/css/theme.css';
@import '@morfira-dev/css/field.css';
@import '@morfira-dev/css/input.css';
```

Both stylesheets use `morfira.components`, low-specificity `:where(...)` selectors, and
logical properties. `field.css` can be used with another native form control, and
`input.css` can style a standalone input without importing the Field layout.

Public component variables are `--morfira-field-gap`, `--morfira-field-label-color`,
`--morfira-field-message-color`, `--morfira-field-status-color`,
`--morfira-input-background`, `--morfira-input-border-color`, `--morfira-input-color`,
`--morfira-input-placeholder-color`, `--morfira-input-size`, and
`--morfira-input-padding-inline`. Consumer overrides remain responsible for contrast in
default, hover, focus, validation, disabled, read-only, dark, and forced-color states.

## Accessibility and rendering modes

- The visible Input and composed control block size follows `--morfira-control-size-sm`,
  `-md`, or `-lg`; size is geometry, not a font-only variant. All three sizes remain
  above the baseline 24 px target-size requirement. Touch-oriented products may override
  `--morfira-input-size` with `--morfira-control-touch-target`.
- Validation uses explicit message text, `aria-invalid` for errors, a changed border,
  and a distinct leading glyph; it never relies on color alone.
- Reduced-motion mode removes input and shell transitions.
- Forced-color mode restores system field, text, focus, placeholder, and disabled colors
  while retaining borders and status text.
- Logical properties keep label, messages, prefix, and suffix direction-neutral. Their
  order follows DOM order in both LTR and RTL.
- Plain attributes and caller-provided IDs produce deterministic SSR output. Hydration
  must reproduce the same IDs, message presence, `aria-describedby`, and validation
  state.

Static contract tests cover selectors, sizes, validation cues, disabled/read-only
separation, logical properties, focus modes, package exports, reduced motion, and forced
colors. Browser tests additionally prove visible control geometry, accessible names and
descriptions, focus treatment, RTL composition, forced colors, rendered contrast, and
axe WCAG checks. Adapter fixtures additionally cover SSR markup and hydrated input/value
bindings. Browser autofill and manual screen-reader announcement order remain separate
pending evidence.
