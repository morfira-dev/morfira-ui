# Dialog contract

Status: Phase 1 public contract; the native DOM and framework adapters implement the
first modal overlay slice. Automated Chromium, Firefox, and WebKit coverage proves the
primary browser, accessibility, SSR, hydration, and consumer contracts; the extended
nested, interrupted-lifecycle, screenshot, and manual assistive-technology matrix
remains.

Dialog is Morfira UI's first complex overlay. Its API, markup, visual treatment, focus
model, and dismissal behavior are original to Morfira UI. Other enterprise systems are
coverage benchmarks only and do not define this implementation.

## Scope and anatomy

This slice provides a modal Dialog built on the native `<dialog>` element and its top
layer. Non-modal dialogs, alert dialogs, drawers, draggable or resizable windows, and
arbitrary overlay positioning are outside this contract.

The stable surface hook is `dialog[data-morfira-dialog]`. Its anatomy hooks are:

- `[data-morfira-dialog-header]`;
- `[data-morfira-dialog-title]`;
- `[data-morfira-dialog-description]` when a description is present;
- `[data-morfira-dialog-body]`;
- `[data-morfira-dialog-footer]` when footer content is present;
- `button[data-morfira-dialog-close]`;
- `dialog[data-morfira-dialog]::backdrop` for the browser-owned backdrop.

No wrapper or synthetic backdrop is required. `showModal()` moves the native dialog to
the browser top layer, so transformed or clipped application ancestors do not constrain
the modal surface.

```html
<dialog
  data-morfira-dialog
  data-size="md"
  data-state="open"
  role="dialog"
  aria-modal="true"
  aria-labelledby="archive-title"
  aria-describedby="archive-description"
  tabindex="-1"
>
  <header data-morfira-dialog-header>
    <div>
      <h2 id="archive-title" data-morfira-dialog-title>Archive workspace?</h2>
      <div id="archive-description" data-morfira-dialog-description>
        Existing links will stop working.
      </div>
    </div>
    <button
      type="button"
      aria-label="Close archive confirmation"
      data-morfira-dialog-close
    >
      <span aria-hidden="true">×</span>
    </button>
  </header>
  <div data-morfira-dialog-body>...</div>
  <footer data-morfira-dialog-footer>...</footer>
</dialog>
```

## Public state

| Contract     | Values                   | Meaning                                                          |
| ------------ | ------------------------ | ---------------------------------------------------------------- |
| `data-state` | `open`, `closed`         | Resolved state mirrored by the DOM controller.                   |
| `data-size`  | `sm`, `md`, `lg`         | Distinct preferred widths of 26, 36, and 48 rem.                 |
| `open`       | native boolean attribute | Applied through `showModal()` and removed through `close()`.     |
| `aria-modal` | `true`                   | Identifies the top-layer surface as a modal accessibility scope. |

IDs are explicit public inputs. A title ID is required. Description content and its ID
must be supplied together; otherwise `aria-describedby` would reference missing content
or useful text would be disconnected from the dialog.

## Controlled state and dismissal

React and Vue expose controlled state: a dismissal emits a request and the owner updates
`open`. Svelte uses bindable `open`; a user dismissal updates the binding and invokes
callbacks with a `DialogDismissReason`. Supported reasons are `escape`, `backdrop`,
`close-button`, and `native-close`.

Escape dismissal is enabled by default. Backdrop dismissal is intentionally disabled by
default because destructive and multi-step enterprise workflows must not close from an
incidental pointer action. When enabled, pointer-down and pointer-up must both originate
on the native dialog backdrop target; dragging from content to the backdrop does not
dismiss.

## Keyboard and focus

- `showModal()` establishes native top-layer modality and focus containment. The DOM
  controller adds deterministic initial focus, restoration, and teardown.
- Initial focus goes to the requested `initialFocus` target, then the first eligible
  focusable descendant, and finally the dialog surface with `tabindex="-1"`.
- `Tab` and `Shift+Tab` remain inside the active modal. Dynamic content is considered; a
  stale one-time list of controls is not the public behavior.
- Escape requests dismissal only when `closeOnEscape` is enabled. A cancelled controlled
  close leaves the dialog open.
- After an accepted close, focus returns to `returnFocus` or the previously focused
  trigger when it is still connected and focusable.
- The close button is a native button with a required, localized accessible name and a
  44 px minimum target.
- Nested dialogs retain scroll locking until the final modal closes. Only the topmost
  layer handles dismissal and focus containment.

The controller must restore listeners, focus state, scroll styles, and attributes during
normal close, interrupted updates, and unmount. Framework strict or repeated lifecycle
execution must not duplicate these effects.

## Layout, styling, and customization

Import themes and Dialog styling explicitly:

```css
@import '@morfira-dev/css/theme.css';
@import '@morfira-dev/css/dialog.css';
```

The surface uses a three-row grid: header, a `minmax(0, 1fr)` body, and footer. Only the
body scrolls, so the title, close button, and actions remain available with long
content. The preferred widths are capped by the viewport. `100vh` is retained as a
fallback and `100dvb` accounts for dynamic mobile browser UI.

Public component variables are:

- `--morfira-dialog-background`;
- `--morfira-dialog-border-color`;
- `--morfira-dialog-color`;
- `--morfira-dialog-inline-size`;
- `--morfira-dialog-radius`;
- `--morfira-dialog-shadow`;
- `--morfira-dialog-viewport-gap`;
- `--morfira-dialog-backdrop-background`.

The backdrop variable is component-owned until a second real overlay demonstrates a
shared semantic scrim role. Consumer overrides remain responsible for surface, text,
border, focus, and backdrop contrast.

## Rendering modes

- The opening transition changes surface opacity and a small block-axis translation and
  scale. Native `close()` removes the top-layer surface immediately, so this slice does
  not promise an exit animation or retain fake closed markup.
- Reduced-motion mode removes both surface and backdrop entrance animation. State,
  dismissal, focus restoration, and teardown never depend on an animation event.
- Forced-color mode uses `Canvas`, `CanvasText`, and system button/focus treatment,
  removes the shadow, and preserves a perceivable backdrop.
- Logical properties make spacing and action alignment direction-neutral. RTL order
  follows DOM order without physical left/right rules.
- The Dialog itself inherits theme variables because native top-layer participation does
  not reparent the element in the DOM. Explicit subtree and custom consumer themes
  therefore remain available without copying attributes to a portal root.

## SSR and hydration boundary

Server rendering can emit deterministic Dialog content, IDs, ARIA relationships,
`data-state`, and `data-size`, but a server cannot establish the browser top layer. The
Svelte adapter does not access `window` or `document` at module scope. The DOM enhancer
calls `showModal()` only after mount and reconciles the requested open state.

Products must expect an initially open server-rendered Dialog to become visible and
modal only after hydration. The adapter must not render a non-modal `open` attribute on
the server as a substitute for `showModal()`. Initial focus and scroll locking are also
client effects. Explicit stable IDs prevent hydration mismatches in accessible
relationships.

## Verification boundary

Static tests cover native anatomy, public hooks, distinct size geometry, viewport caps,
body-only scrolling, logical properties, focus styling, reduced motion, forced colors,
SSR compilation, callback reason types, and absence of module-level browser access.

Real-browser verification must separately prove `showModal()` top-layer behavior,
initial focus fallback, Tab wrapping, programmatic focus containment, Escape and
backdrop dismissal, focus restoration, nested scroll locks, long-body scrolling,
26/36/48-rem computed size selection subject to viewport caps, narrow and zoomed
viewports, light and dark themes, RTL, reduced motion, forced colors, unmount cleanup,
and hydration. Static CSS or DOM snapshots alone are not evidence for those behaviors.
