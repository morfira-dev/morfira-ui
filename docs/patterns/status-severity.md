# Status and severity pattern

Status: Phase 2 implementation-complete composition guidance. The pattern uses semantic
tokens and native text; it does not add a Badge, Alert, or notification runtime.
Released-browser and assistive-technology certification remains pending.

## Model and anatomy

Status describes current state; severity describes the consequence that deserves
attention. Do not infer severity only from a color or from a backend numeric level. Map
product meaning explicitly to one of:

| Severity  | Use                                                                  | Token guidance                                                          |
| --------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `neutral` | ordinary, inactive, pending, or unknown state                        | primary/secondary content and subtle/default border                     |
| `info`    | useful state or progress that does not require corrective action     | accent content and subtle surface                                       |
| `success` | completed or healthy state                                           | `--morfira-content-success`                                             |
| `warning` | degraded state or action recommended before it becomes blocking      | `--morfira-content-warning`                                             |
| `danger`  | failed, destructive, security-sensitive, or currently blocking state | `--morfira-content-danger` and, where needed, `--morfira-border-danger` |

A status presentation contains a visible label, optional decorative icon, and optional
detail or timestamp. Put the label first in accessible reading order. Icons are
`aria-hidden="true"` when the adjacent text already names the status.

Recommended application hooks are `[data-morfira-status]` and
`data-severity="neutral|info|success|warning|danger"`; optional parts use
`[data-morfira-status-icon]`, `[data-morfira-status-label]`, and
`[data-morfira-status-detail]`. These hooks document composition and testing intent but
do not create a new runtime component or guaranteed component stylesheet.

```html
<span data-morfira-status data-severity="warning">
  <span aria-hidden="true" data-morfira-status-icon>!</span>
  <span data-morfira-status-label>Degraded</span>
  <span data-morfira-status-detail>2 checks need attention</span>
</span>
```

## Accessibility and announcements

- Static status needs no live-region role. Screen readers encounter it through normal
  document navigation.
- Use `role="status"` for a meaningful asynchronous update that is not urgent, such as
  completion or refreshed health. Update one concise text node so it is announced once.
- Reserve `role="alert"` for a new urgent condition that requires immediate attention.
  Do not put an entire dashboard or repeatedly updating counter in an alert.
- A changing value must include its subject: “Production deployment failed,” not only
  “Failed.”
- Progress and busy state use their native or ARIA progress semantics; color severity is
  supplementary.
- Never encode danger only with a red dot. Keep visible text when an icon is hidden,
  unavailable, or rendered in forced colors.

## Ordering and responsive behavior

Within lists and tables, keep status in the column associated with the resource and use
the same vocabulary throughout the product. Sort by product meaning rather than by color
name. When multiple conditions exist, show the highest actionable severity first and
expose the remaining detail in nearby text or an accessible disclosure; do not stack
unexplained icons.

Allow the label and detail to wrap at narrow widths. A compact layout may hide a
nonessential timestamp, but not the status label. RTL reverses visual inline flow
through logical layout without changing reading order. At high zoom, the status must not
cover its resource name or action group.

Use semantic content and surface variables rather than primitive palette values. In
forced-colors mode retain a text label and, where a boundary is necessary, system-color
borders. Motion is not required to convey a state change; respect reduced motion if an
application adds a transition.

## Anti-patterns

- Treating severity as a direct copy of an internal log number without product meaning.
- Color-only dots, unlabeled icons, or abbreviations that have no expanded accessible
  name.
- `role="alert"` on static content or rapidly updating telemetry.
- Using success styling for a submitted action before the server confirms success.
- Mixing “warning,” “error,” “critical,” and “danger” as interchangeable labels in the
  same workflow.
- Hiding the status text on mobile while leaving only color.
- Introducing a new runtime dependency merely to render a colored label.
