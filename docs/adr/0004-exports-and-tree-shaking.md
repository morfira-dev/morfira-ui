# ADR-0004: Publish ESM-first component subpath exports

- Status: Accepted
- Date: 2026-10-13
- Owners: Morfira UI maintainers

## Context

Consumers must be able to import one component without pulling the full catalog or
unrelated CSS.

## Decision

Publish readable ESM with declarations and source maps. Define package and component
subpath exports. Mark logic side-effect free and list CSS side effects explicitly. Do
not require a root barrel that imports all components or styles.

Validate exports with package tooling and real fixture applications. Add CJS only after
a confirmed consumer requirement.

## Alternatives considered

- ESM and CJS from the first release: rejected because it doubles surface and testing
  cost without demonstrated need.
- Root-only exports: rejected because they obscure isolated import guarantees.

## Consequences

Every component slice adds export, declaration, consumer-build, and size-budget coverage
before release.
