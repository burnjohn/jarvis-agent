---
status: proposed
date: 2026-11-02
decision-makers: []  # owner asked for docs on GitHub Pages 2026-11-02; drafted by Claude
scope: ["docs/.vitepress/**", ".github/workflows/docs.yml", "package.json"]
supersedes: []
superseded-by: []
---

# ADR-0014: Publish `docs/` as a VitePress site on GitHub Pages

## Context and Problem Statement
The owner wants the documentation readable as a site, with the Mermaid diagrams rendered. The sources
must stay plain Markdown that also reads well on github.com (folder indexes are `README.md`, links point
at `.md` files, ADRs carry YAML front matter). The repo is public, so GitHub Pages is free.

## Considered Options
- VitePress with `vitepress-plugin-mermaid`, built and deployed by a GitHub Actions workflow
- GitHub's built-in Jekyll build with a custom layout that loads Mermaid from a CDN
- MkDocs Material (Python toolchain)

## Decision Outcome
Chosen option: "VitePress", because it is in the same TypeScript/pnpm toolchain as the rest of the repo
(ADR-0002), renders Mermaid, has local search, and needs no changes to the Markdown sources: a rewrite
maps `README.md` to the folder index and a small Markdown rule fixes links to `README.md`.

Dev dependencies at the workspace root (docs only, not shipped by any module): `vitepress`,
`vitepress-plugin-mermaid`, `mermaid`. Scripts: `pnpm docs:dev`, `pnpm docs:build`, `pnpm docs:preview`.
`architecture/overview.html` is copied into the site as a standalone page at build time.

### Consequences
- Good, because every push to `main` that touches `docs/` republishes the site; pull requests only build it, so broken links fail CI.
- Good, because docs tooling stays out of `shared/`, `engine/` and `web/`.
- Bad, because three more dev dependencies to keep up to date; `vitepress-plugin-mermaid` supports VitePress 1.x only.

### Confirmation
- RULE: Docs tooling is a root dev dependency only; no module depends on it.
  CHECK: `grep -n vitepress */package.json` (expect none)
- RULE: `pnpm docs:build` passes (dead links fail the build).
  CHECK: `.github/workflows/docs.yml` on pull requests
