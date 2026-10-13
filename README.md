# Morfira UI

Morfira UI is an original, accessible, framework-independent UI system for the modern
web. It targets native DOM, React, Vue, and Svelte through independently versioned
`@morfira-dev/*` packages.

The repository is currently in Phase 0: architecture and workspace foundation. No
component is production-ready yet.

## Requirements

- Node.js 24 LTS (`>=24.12.0 <25`)
- Corepack
- the pnpm version declared in `package.json`

## Setup

```sh
corepack enable
pnpm install
pnpm check
pnpm build
```

## Repository map

- `packages/` — public package boundaries;
- `apps/` — documentation and framework playgrounds;
- `tooling/` — shared build, lint, TypeScript, and release tooling;
- `docs/adr/` — architecture decisions;
- `SDD.md` — accepted software design baseline;
- `AGENTS.md` and `SKILLS.md` — mandatory instructions for coding agents.

Read `AGENTS.md`, `SKILLS.md`, `SDD.md`, and relevant ADRs before changing the
repository.

## License

MIT
