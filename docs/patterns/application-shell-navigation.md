# Application shell and navigation pattern

Status: Phase 3 composition contract.

An application shell composes landmarks and navigation; it is not a single component
that owns routing, authentication, product state, or responsive policy.

## Anatomy

The normal order is a skip link, optional global banner, `header`, primary `nav`,
optional contextual navigation, `main`, and optional complementary or footer regions.
Each landmark has a unique accessible name when more than one landmark of the same type
exists. The document keeps one primary `main` target and a stable heading hierarchy.

Global navigation communicates the current destination with `aria-current="page"` on the
link. Expandable groups use buttons and disclosure semantics; they are not links with
click handlers. Product switchers and action menus use Menu/Dropdown only when the
interaction is command-oriented. Ordinary destination lists remain native links.

## Responsive behavior

Wide layouts may keep primary navigation visible. Narrow layouts may disclose it in a
Drawer, but the closed Drawer must not leave focusable descendants reachable. Opening
and closing preserves the current route, restores focus to the trigger, and does not
duplicate landmark names in the accessibility tree.

The shell must tolerate 200% zoom, long translated labels, safe-area insets, and RTL.
Navigation state is not inferred from color alone. Icon-only actions need accessible
names and usually a Tooltip, but Tooltip never replaces the visible current-location
indicator.

## Ownership

The application owns routes, permissions, badges, loading, and persistence. Morfira owns
component behavior, tokens, focus rules, disclosure, and documented composition. Shell
spacing should use layout tokens and logical properties; consumers may replace regions
without rewriting component internals.

## Verification

Verify landmark order, skip-link focus, current-page announcement, keyboard traversal,
Drawer focus restoration, resize while open, RTL, zoom, forced colors, long labels,
SSR/hydration, and route changes that occur while navigation is disclosed.
