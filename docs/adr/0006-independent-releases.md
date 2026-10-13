# ADR-0006: Release packages independently

- Status: Accepted
- Date: 2026-10-13
- Owners: Morfira UI maintainers

## Context

Package layers evolve at different rates. Consumers should not receive unrelated major
versions, but internal dependency changes must still reach downstream packages reliably.

## Decision

Version and release each public package independently using Conventional Commits and
per-package semantic-release automation. Propagate releases when a shipped internal
dependency range or behavior changes. Publish through npm Trusted Publishing with GitHub
Actions OIDC and provenance.

Release automation is added only after the first package has a validated public
contract. Packages remain private during Phase 0 to prevent accidental publication.

## Alternatives considered

- One lockstep monorepo version: rejected because unrelated packages would share release
  pressure.
- Long-lived npm tokens: rejected as the default because OIDC provides a narrower
  credential model.

## Consequences

The release design requires changed-package detection, dependency propagation,
per-package tags, and dry-run coverage before Trusted Publishing is enabled.
