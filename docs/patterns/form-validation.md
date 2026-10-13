# Form validation pattern

Status: Phase 2 implementation-complete composition guidance. This pattern adds no
runtime component; it combines native forms, Field, and native-first Morfira controls.
Released-browser and assistive-technology certification remains pending.

## Purpose and anatomy

Use validation to help a person correct input, not merely to reject submission. A form
is ordered as:

1. a visible form title and optional instructions;
2. an error summary after an unsuccessful submit when more than one field is invalid;
3. Fields in task order, each with label, optional helper text, control, and inline
   validation message;
4. an action group containing submit and escape or cancel actions;
5. an optional polite result message for asynchronous success.

Use native `<form>`, `fieldset`, `legend`, `label`, and constraint attributes. Field
owns the IDs and relationships for one control. Checkbox or Radio groups use `fieldset`
and `legend`; do not force a multi-control group through Field's one-control contract.

## Validation timing and ordering

- Validate required structure and formats on submit. Validation on blur is appropriate
  after a person has interacted with a field. Do not display errors on untouched fields
  during initial render.
- While correcting an invalid field, update its message when the new value has enough
  information to evaluate. Do not announce every keystroke.
- Place an inline error immediately after its control and helper text. Phrase it as a
  correction, such as “Enter a complete email address,” rather than only “Invalid.”
- Preserve the person's values after client or server rejection. Merge server errors
  into the same Field contract instead of rendering a second unrelated message.
- After an unsuccessful submit, reveal the summary, focus it programmatically, and keep
  its links in the same order as the invalid fields. Activating a link focuses the named
  control. If there is only one obvious error, focusing the first invalid control is
  acceptable when the error is announced with it.
- After success, keep focus at the initiating action unless navigation or a newly
  created resource gives a more meaningful destination.

## Accessibility contract

An error control uses native `required` where applicable, `aria-invalid="true"`, and an
explicit `aria-describedby` or `aria-errormessage` relationship to visible text. Warning
and success states do not misuse `aria-invalid`. Required markers are decorative when
the native required state already supplies the semantic meaning.

The summary uses a heading and a focusable container. It may use `role="alert"` only as
the direct result of a submit; a permanently rendered summary must not repeatedly
interrupt the screen reader. Asynchronous success uses `role="status"` or an equivalent
polite live region. Do not place every inline message in its own assertive live region.

```html
<form data-morfira-validation-pattern>
  <div
    data-morfira-validation-summary
    role="alert"
    tabindex="-1"
    aria-labelledby="profile-errors-title"
  >
    <h2 id="profile-errors-title">Fix 2 fields</h2>
    <ul>
      <li><a href="#profile-email">Enter a complete email address</a></li>
      <li><a href="#profile-region">Choose a region</a></li>
    </ul>
  </div>

  <div data-morfira-field data-validation="error">
    <label id="profile-email-label" for="profile-email" data-morfira-field-label>
      Email
    </label>
    <div data-morfira-field-control>
      <input
        id="profile-email"
        data-morfira-input
        data-size="md"
        data-validation="error"
        required
        aria-invalid="true"
        aria-labelledby="profile-email-label"
        aria-errormessage="profile-email-error"
      />
    </div>
    <p id="profile-email-error" data-morfira-field-message data-message-kind="error">
      Enter a complete email address.
    </p>
  </div>
</form>
```

The `data-morfira-validation-*` attributes identify the documented composition for
application styling and tests. They do not introduce a new package export or controller.

## Responsive and visual behavior

Keep labels and messages adjacent to their controls at every width. Let long messages
wrap; do not truncate the correction. At narrow widths, stack fields and actions in DOM
order. At 200% zoom, the form must not require horizontal scrolling for ordinary text
entry. Summary links and controls retain visible focus and at least the existing Morfira
control target sizes.

Use `--morfira-content-danger`, `--morfira-content-warning`,
`--morfira-content-success`, `--morfira-border-danger`, and the Field/Input component
variables. Text and the Field status glyph carry meaning in addition to color. Forced
colors must retain boundaries, focus, and message text.

## Anti-patterns

- Placeholder-only labels or errors shown only as red borders.
- Disabling submit before explaining what remains incomplete.
- Clearing values after a failed request.
- Moving focus on every validation update.
- Announcing untouched fields, duplicating the same error in multiple live regions, or
  marking warnings as invalid.
- Reordering the visual form independently from DOM and summary order.
- Implementing Checkbox or Radio groups as unrelated divs without `fieldset` and
  `legend`.
