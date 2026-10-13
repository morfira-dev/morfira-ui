# Menu and Dropdown contract

Status: Phase 3 implementation candidate. The automated contract must still be
supplemented by released-browser and assistive-technology certification before a stable
release.

Menu presents a short set of commands. Dropdown is the disclosure owner that connects a
trigger to a Menu. A Menu is not site navigation, a select control, a command palette,
or a container for arbitrary form fields. Those patterns use links, Select, Combobox, or
Popover respectively.

## Anatomy and states

Menu consists of one element with `role="menu"` and ordered entries with
`role="menuitem"`. This first contract supports action entries and visual separators.
Disabled entries use `aria-disabled="true"`, remain perceivable, and are skipped by
roving focus and typeahead. Public hooks are `[data-morfira-menu]`,
`[data-morfira-menu-item]`, and `[data-morfira-menu-separator]`. Items publish
`data-state="enabled|disabled"` and the menu publishes `data-orientation="vertical"`.

Dropdown adds one trigger and one menu surface. It supports controlled and uncontrolled
open state, disabled state, logical placement, Escape and outside-primary-pointer
dismissal, and focus restoration. Public hooks are `[data-morfira-dropdown-trigger]` and
`[data-morfira-dropdown]`, with `data-state="open|closed"` and `data-placement`.
Placement values are `block-start`, `block-end`, `inline-start`, and `inline-end`.

## Keyboard and focus

When a standalone Menu receives focus, exactly one enabled item participates in the tab
order. Arrow Down and Arrow Up move focus, Home and End move to the first and last
enabled item, and printable characters perform case-insensitive prefix typeahead.
Repeated characters cycle matching items. Disabled entries and separators never receive
focus. Enter and Space activate the focused action through native button or link
behavior.

Activating a Dropdown trigger opens the menu and moves focus to its first enabled item.
Arrow Down opens and enters at the first item; Arrow Up opens and enters at the last.
Escape closes and restores focus to the trigger. Selecting an action closes and restores
focus. Tab closes without preventing normal focus traversal. A primary pointer outside
the trigger and surface closes it; secondary and non-primary pointers do not. The menu
does not trap focus or lock scrolling. Destroying an instance removes listeners and
restores attributes without moving focus.

## ARIA and announcements

The Dropdown trigger exposes `aria-haspopup="menu"`, `aria-controls`, and
`aria-expanded`. The surface has `role="menu"` and is named with either `aria-label` or
an explicit consumer relationship. Native buttons and links retain their native roles
only outside a Menu; inside the component they receive `role="menuitem"`. Consumers must
put persistent navigation in `nav`, not in Menu.

## State ownership and SSR

Core validates IDs, entries, placement, loop, and typeahead timing without browser
globals. DOM owns event listeners, focus, positioning, outside-pointer dismissal, and
teardown. Adapters expose controlled state plus an uncontrolled default and report
open-change and select reasons. SSR output contains deterministic IDs, relationships,
roles, roving tabindex, and initial hidden state. Hydration must not initially move
focus or flash a closed surface.

## Styling and tokens

Import `@morfira-dev/css/menu.css` for a standalone Menu and
`@morfira-dev/css/dropdown.css` for the disclosure surface. Dropdown CSS also imports
Menu CSS at the package-contract layer. Styles use semantic surface, content, border,
focus, shadow, spacing, radius, and motion tokens. Logical properties provide RTL
behavior. Forced colors retain surface boundaries, focus, and disabled meaning. Reduced
motion removes the opening animation.

Positioning publishes `--morfira-dropdown-anchor-x` and `--morfira-dropdown-anchor-y`;
`data-direction` records the resolved writing direction. Automatic collision flipping
and submenus are explicitly deferred.

## Adapter conformance and limitations

React, Vue, and Svelte must render the same ARIA relationships and public data states,
skip disabled entries, preserve DOM order, support controlled and uncontrolled open
state, close on selection, and produce stable SSR markup. Labels may be framework-native
renderable content, while the required `textValue` string supplies deterministic
typeahead independently of rendered markup.

The first slice excludes nested submenus, checkbox/radio menu items, virtualized menus,
and arbitrary interactive descendants. These require additional state and announcement
contracts rather than being approximated with action-menu semantics.
