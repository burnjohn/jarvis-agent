---
status: accepted
date: 2026-11-11
decision-makers: ['Ivan Lapa'] # owner: publish specs, architecture and decisions as a public site on the default GitHub Pages address; plans, STATUS.md and the webinar stay unpublished (2026-11-11, spec of T-7); drafted by Claude
scope: ['docs-site/**', '.github/workflows/docs.yml']
supersedes: []
superseded-by: []
---

# ADR-0029: Publish the documentation as a VitePress site on GitHub Pages, built from the unchanged files in docs/

## Context and Problem Statement

Specifications, architecture and decisions live as Markdown files in `docs/`. Reading them needs the
repository, one file at a time; Mermaid blocks read as code; there is no search but GitHub's. The owner,
webinar attendees, new contributors and PR reviewers need one public link with navigation, search and
rendered diagrams. The team agreed: the address is public, only `docs/specs`, `docs/architecture` and
`docs/decisions` are published (not `docs/plans`, not `STATUS.md`), the default GitHub Pages address is
enough, the documents are not rewritten for the site, the site updates on every merge to `main`, and a
broken internal link blocks the pull request.

## Considered Options

- **VitePress** in a workspace package.
- MkDocs Material.
- Docusaurus.

## Decision Outcome

Chosen option: **VitePress**, because it is Node and Vite, like the rest of the monorepo (ADR-0001),
so CI needs no second toolchain; its default theme has the sidebar, a mobile menu and a local full-text
search with no external account; and its build fails on a dead link. MkDocs needs Python in CI;
Docusaurus parses Markdown as MDX, which breaks on the plain `<...>` text the docs contain, and brings React.

- **Package `docs-site/`** (`@jarvis/docs-site`). Dependencies, pinned exactly: `vitepress` 1.6.4 and
  `mermaid` 12.3.0, plus `vitest`, `typescript` and `@types/node` at the versions the other packages use. No
  Mermaid plugin: `vitepress-plugin-mermaid` 2.0.17 requires mermaid 10 or 11. A fence renderer and a
  few lines of theme code render the diagrams in the browser, using mermaid's prebuilt `mermaid.min.js`. The
  build copies that file to the site, and only a page with a diagram loads it. Bundling mermaid through
  Rollup ran out of memory on the 4 GB server.
- **The site is assembled, not authored.** When the config loads, it copies the three published sections
  into the git-ignored `docs-site/content/` and adds the site's own home page. A section's `README.md` is its
  landing page. `docs/architecture/overview.html` is served as a static file. Its diagrams need a script, so the site copy gets the Mermaid script appended. Nothing in `docs/` is
  edited for the site.
- **Reads the same as on GitHub.** YAML front matter is shown as a table above the page, as GitHub does.
  A relative link to an existing repository file that is not published (`STATUS.md`, `deploy/README.md`)
  is rewritten to that file on GitHub, branch `main`. A relative link to a file that does not exist is left as
  it is, so the dead-link check fails the build. Raw HTML in Markdown is shown as text, not rendered. The
  docs use none, but they write placeholders such as `<artifactsDir>` in plain text, and as HTML those
  break the page.
- **Address** `https://burnjohn.github.io/jarvis-agent/` (base `/jarvis-agent/`), no custom domain.
- **Workflow `.github/workflows/docs.yml`** (`name: docs`): job `build` runs on every pull request to
  `main` and on every push to `main` (tests, then build). Job `deploy` runs only on a push to `main` and
  publishes with `actions/deploy-pages`, using the workflow token's `pages: write` and `id-token: write`.
  No personal token and no secret.

### Consequences

- Good, because a document reaches the site with the merge that changes it, and nobody publishes by hand.
- Good, because a dead link between documents fails `docs / build` on the pull request.
- Bad, because two repository settings are manual and outside any pull request. Pages must use
  "GitHub Actions" as its source. `docs / build` must be a required check on `main`. Without the
  second, a red check is visible but does not block the merge.
- Bad, because a link to an unpublished file always points to `main`, even from an older page.
- Bad, because the site is public: anything merged into the three sections is published. A secret or a
  private address must never be written there (ADR-0015 already forbids it in any committed file).

### Confirmation

- RULE: Only `docs/specs`, `docs/architecture` and `docs/decisions` are copied into the site; `docs/plans`,
  `docs/webinar` and `STATUS.md` are not.
  CHECK: `docs-site/test/assemble.test.ts`
- RULE: Building the site never writes to `docs/`.
  CHECK: `docs-site/test/assemble.test.ts`; review: no change under `docs/` in a pull request that only changes `docs-site/`
- RULE: A relative link to a missing file fails the build; a link to an unpublished existing file goes to GitHub.
  CHECK: `docs-site/test/links.test.ts`, the `docs / build` job
