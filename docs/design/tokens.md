# Tokens and themes

Status: Phase 1 contract; implementation and browser proof are in progress.

## Visual direction

Morfira UI starts from an original, neutral product interface with a restrained
violet-indigo accent. Neutral colors carry surfaces, content, and borders; the accent is
reserved for interaction, selection, and focus. Status colors communicate danger,
success, and warning without becoming the product identity.

This direction belongs to Morfira UI. PatternFly may be studied as a capability and
quality benchmark, but its source, token values, naming, component structure, and visual
appearance are not copied.

## Token layers

Tokens have three layers with different ownership:

1. **Primitive tokens** define raw palette steps, spacing, typography, control sizes,
   radii, borders, shadows, motion, and stacking levels. Components must not treat a raw
   palette value as a user-facing meaning.
2. **Semantic tokens** map primitives to roles such as surface, content, border,
   interactive, focus, and shadow. Light and dark themes provide the same semantic shape
   so components can switch themes without changing their styles.
3. **Component tokens** are narrow, public customization points owned by one component.
   They are added only when implemented components demonstrate that semantic tokens are
   insufficient.

CSS custom properties are the public runtime contract. Typed TypeScript exports expose
the source contracts for tooling and documentation; they do not replace the CSS runtime
API.

## Package imports

Use the typed token source from the token package:

```ts
import {
  darkThemeTokens,
  lightThemeTokens,
  primitiveTokens,
} from '@morfira-dev/tokens';
```

CSS entrypoints are explicit so a consumer can choose the smallest appropriate contract:

```css
@import '@morfira-dev/css/primitives.css';
@import '@morfira-dev/css/themes/light.css';
@import '@morfira-dev/css/themes/dark.css';
@import '@morfira-dev/css/themes/forced-colors.css';
```

The convenience entrypoint below assembles the standard runtime theme contract:

```css
@import '@morfira-dev/css/theme.css';
```

Importing TypeScript tokens does not implicitly import global CSS. CSS files remain
explicit package side effects.

## Runtime theme selection

Light is the default theme. Set `data-morfira-theme` on the document root or a subtree
for an explicit choice:

```html
<html data-morfira-theme="dark"></html>
```

Supported built-in values are `light` and `dark`. When the attribute is absent, the
standard theme contract may follow `prefers-color-scheme`; an explicit attribute wins.
Keeping selection in an HTML attribute makes server-rendered output deterministic and
lets applications set the theme before hydration. Each explicit theme scope also sets
its foreground to `--morfira-content-primary`, so a nested theme does not retain the
resolved text color inherited from its parent theme.

Custom themes override semantic custom properties in a consumer-owned cascade layer or
scope. Consumers should prefer semantic variables and leave primitives unchanged unless
they are deliberately creating a new scale:

```css
@layer morfira.overrides {
  [data-brand='example'] {
    --morfira-interactive-primary: #5146d8;
    --morfira-focus-ring: #5146d8;
  }
}
```

Modern color values must include meaningful fallbacks for supported browsers that do not
understand the modern syntax. Overrides must preserve contrast and visible focus;
changing one color variable is not evidence that the resulting theme remains accessible.

## Accessibility behavior

- **Dark theme:** preserves the semantic token shape rather than asking components to
  branch on the active theme. Text, borders, focus, and interactive states require
  contrast checks in rendered components.
- **Forced colors:** system colors take precedence where necessary so borders, content,
  controls, and focus indicators remain perceivable. Do not neutralize browser-forced
  colors globally.
- **Reduced motion:** non-essential transition durations collapse when
  `prefers-reduced-motion: reduce` is active. State changes must remain understandable
  without animation.
- **RTL:** tokens avoid encoding physical left/right meaning. Component styles use
  logical properties and are verified separately.
- **Non-color meaning:** status and interaction must not be communicated by token color
  alone.

## Verification boundary

Static checks can prove that light and dark themes expose the same semantic keys, that
semantic values reference public custom properties, that modern colors have fallbacks,
and that generated entrypoints are valid and independently importable.

Static checks cannot prove visual contrast, focus visibility, browser preference
handling, forced-color rendering, reduced-motion behavior, or absence of a theme flash.
Those claims require a browser fixture, accessibility inspection, and visual evidence
covering light, dark, automatic, forced-color, and reduced-motion states. Until that
evidence exists, documentation must describe those behaviors as requirements rather than
verified results.
