# Button contract

Status: Phase 1 public contract; core, DOM, and framework adapters are implemented. DOM
browser geometry, themes, accessibility, RTL, reduced motion, and forced colors are
automated across Chromium, Firefox, and WebKit. React, Vue, and Svelte SSR, hydration,
and shared interaction conformance run against the same consumer contract.

Button is the first action primitive in Morfira UI's original product and enterprise
system. Mature enterprise libraries such as PatternFly are useful coverage and edge-case
benchmarks, but do not define this component's API, styling, tokens, or implementation.

## Anatomy and ownership

Button uses a native `<button>` as its only required interactive element. Consumer
content provides the visible label and may include an icon before or after it. The CSS
loading indicator is decorative; the accessible name continues to come from the
consumer-provided label.

Native HTML owns activation, form participation, keyboard input, and disabled behavior.
The component does not introduce a framework-independent state machine because a native
button already owns these behaviors. Framework adapters map their public props to the
same DOM attributes without replacing native semantics.

## Public DOM contract

The stable styling hook is `button[data-morfira-button]`.

| Contract       | Values                                    | Meaning                                                                  |
| -------------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| `data-variant` | `primary`, `secondary`, `ghost`, `danger` | Visual role. `primary` is the default adapter value.                     |
| `data-size`    | `sm`, `md`, `lg`                          | Visual density with distinct 32, 40, and 48 px block sizes.              |
| `data-loading` | present or absent                         | Shows a non-color loading indicator and suppresses hover/active styling. |
| `disabled`     | native boolean attribute                  | Prevents activation and form submission.                                 |
| `aria-busy`    | `true` while loading                      | Exposes the in-progress state to assistive technology.                   |

`data-loading` is not an interaction lock. Every adapter must render native `disabled`
and `aria-busy="true"` while loading. The visible label remains in the DOM so loading is
not communicated by color or animation alone. Products may change the label to a
localized progress phrase when the surrounding workflow needs a more explicit
announcement.

```html
<button type="button" data-morfira-button data-variant="primary" data-size="md">
  Save changes
</button>

<button
  type="button"
  data-morfira-button
  data-variant="primary"
  data-size="md"
  data-loading
  disabled
  aria-busy="true"
>
  Saving changes
</button>
```

Use `type="button"` unless form submission is intentional. An icon-only button still
requires a product-owned accessible name through `aria-label` or equivalent visible
text.

## Interaction and focus

- `Enter` and `Space` use native button activation; adapters must not add duplicate
  keyboard handlers.
- Native `disabled` buttons cannot receive focus or activate. Loading follows the same
  rule because it is also disabled.
- `:focus-visible` renders an offset outline using the semantic focus token. Pointer
  focus is not forced into the keyboard focus treatment.
- Button does not move focus, trap focus, or restore focus. The invoking workflow owns
  those behaviors when necessary.
- No controlled or uncontrolled component state exists in this slice. Variant, size,
  disabled, and loading are render inputs.

## Styling and customization

Import themes and the component independently:

```css
@import '@morfira-dev/css/theme.css';
@import '@morfira-dev/css/button.css';
```

The component is in `morfira.components`, uses low-specificity `:where(...)` selectors,
and relies on logical sizing and spacing. Consumers can customize one scope in the
override layer without rebuilding the package:

```css
@layer morfira.overrides {
  [data-brand='example'] button[data-morfira-button] {
    --morfira-button-background: #5146d8;
    --morfira-button-background-hover: #4036b5;
    --morfira-button-background-active: #31298f;
    --morfira-button-color: #ffffff;
  }
}
```

Public component variables are `--morfira-button-background`,
`--morfira-button-background-hover`, `--morfira-button-background-active`,
`--morfira-button-border-color`, `--morfira-button-border-color-hover`,
`--morfira-button-border-color-active`, `--morfira-button-color`,
`--morfira-button-size`, and `--morfira-button-padding-inline`. Overrides remain
responsible for contrast in default, hover, active, focus, disabled, and forced-color
states.

The danger variant uses semantic danger content and border roles rather than treating a
raw palette step as product meaning. Its visible action label remains the non-color cue.

## Accessibility and rendering modes

- The visible block size follows `--morfira-control-size-sm`, `-md`, or `-lg`; size is
  geometry, not a font-only variant. The minimum inline target remains
  `--morfira-control-touch-target`, while all three block sizes stay above the baseline
  24 px target-size requirement. Touch-oriented products may override the public size
  variable to the larger `--morfira-control-touch-target` token.
- Reduced-motion mode removes transitions and spinner rotation. The loading ring and
  visible label remain, so progress does not depend on motion.
- Forced-color mode uses system button, highlight, focus, and disabled colors while
  retaining a visible border and loading ring.
- Logical properties make the layout direction-neutral. Icon order follows DOM order, so
  consumers may choose an idiomatic RTL-aware order without CSS mirroring hacks.
- SSR output is deterministic: all public states are plain attributes, and the
  stylesheet reads no browser globals. Hydration must reproduce the server attributes.

Static contract tests cover selectors, independent export wiring, logical properties,
focus, reduced motion, and forced colors. The shared browser fixture proves size
geometry, theme switching, loading state, RTL, reduced motion, forced-color rendering,
and automated WCAG checks. Framework consumer SSR, hydration, and shared interaction
conformance run in all three browser engines. Screenshot regression and manual
assistive-technology perception remain separate pending evidence.
