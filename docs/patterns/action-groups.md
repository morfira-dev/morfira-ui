# Action group pattern

Status: Phase 2 implementation-complete composition guidance. Action groups arrange
existing Button components and native links; they do not add a new runtime component.
Released-browser and assistive-technology certification remains pending.

## Purpose, anatomy, and order

An action group contains controls that complete, cancel, or otherwise act on one nearby
task. Use a plain container with `[data-morfira-action-group]`. Optional application
hooks `data-align="start|end"` and `data-stack-at="narrow"` may describe layout intent;
they are not package exports or a JavaScript API.

Order actions by task meaning in DOM order:

1. the primary completion action;
2. secondary alternatives;
3. cancel, back, or dismiss where the workflow requires it;
4. a destructive action separated visually and textually from routine actions.

Keep one primary action per group. In a Dialog footer, use the same DOM order in every
direction; logical CSS alignment may move the group without reversing reading or Tab
order. When a platform convention requires a different visual arrangement, document it
without changing accessible sequence unpredictably.

```html
<div data-morfira-action-group data-align="end" data-stack-at="narrow">
  <button type="submit" data-morfira-button data-variant="primary">Save changes</button>
  <button type="button" data-morfira-button data-variant="secondary">Cancel</button>
</div>
```

For navigation, use a real link with `href`; do not render a Button that manually
changes location. For form submission, use `type="submit"`. Every non-submit Button
explicitly uses `type="button"`.

## Interaction and accessibility

- Give every action a specific visible name. “Delete project” is clearer than “OK.”
- Keyboard order follows DOM order. Do not assign positive `tabindex` values.
- Loading disables repeat activation for the submitting action and exposes its busy
  state through Button. Keep a safe cancel action available unless cancellation would
  corrupt the operation.
- After an asynchronous failure, restore the submitting action and use the form
  validation or status pattern to explain the outcome. Do not silently leave every
  action disabled.
- A destructive action uses the danger variant and normally opens a named Dialog when
  consequences are not immediately reversible. Focus returns to the initiating action
  after cancellation.
- Tooltip may clarify an unfamiliar icon action, but it cannot replace the accessible
  name. Popover may disclose secondary actions only when their order and focus remain
  understandable; menu behavior waits for the dedicated Menu component.

## Responsive behavior and tokens

Use flex with logical gaps from `--morfira-space-*`, allow wrapping, and preserve DOM
order. At narrow widths, stack actions when labels no longer fit; make controls full
width only when that improves target clarity. Do not place two long half-width buttons
where text truncates. At 200% zoom every label remains visible and the group does not
create horizontal page scrolling.

Use Button variants and their variables instead of restyling actions with primitive
colors. Primary, secondary, ghost, danger, disabled, loading, focus-visible,
forced-colors, and reduced-motion behavior remain owned by Button. Alignment uses
logical properties so RTL changes placement without reversing meaning.

## Common compositions

- **Form footer:** primary submit, secondary cancel; validation messages appear before
  the group in reading order.
- **Dialog footer:** confirm and cancel, with the least destructive initial focus when a
  mistake would be costly.
- **Bulk action row:** describe the selected count before the actions and disable only
  actions that truly cannot operate on the selection.
- **Card or row actions:** one visible primary or frequent action; use native links for
  navigation. Do not invent an overflow menu until Menu is available.

## Anti-patterns

- Multiple visually primary actions competing in one group.
- Reversing visual order with CSS while keyboard order remains different.
- Icon-only actions without an accessible name and visible contextual meaning.
- Using disabled actions as the only explanation of missing permission or invalid data.
- Disabling cancel together with a loading submit without a safety requirement.
- Putting destructive action beside submit with identical emphasis.
- Building an ad hoc dropdown or keyboard menu inside the group before the Menu contract
  exists.
