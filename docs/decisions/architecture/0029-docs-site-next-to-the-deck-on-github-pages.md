---
status: accepted
date: 2026-11-16
decision-makers: ['owner'] # owner: keep the presentation as the main Pages site, render all the docs at a separate URL, link one to the other (2026-11-16); drafted by Claude
scope: ['docs/.vitepress/**', 'docs/index.md', '.github/workflows/pages.yml', 'deck/index.html', 'package.json']
supersedes: []
superseded-by: []
---

# ADR-0029: One GitHub Pages site — the deck at the root, every document in docs/ rendered by VitePress under /docs/

## Context and Problem Statement

GitHub Pages serves one site per repository. It used to be planned for the docs (a VitePress branch that
was never merged) and now serves the webinar deck (`deck/index.html`, `.github/workflows/deck.yml`). The
owner wants the deck to stay the main page and the documentation to be readable as a site too, at its own
URL, with each one linking to the other.

## Decision

- One workflow, `.github/workflows/pages.yml`, builds one Pages artifact: `deck/index.html` at the site
  root (`/jarvis-agent/`) and the VitePress build of `docs/` under `/jarvis-agent/docs/`. It replaces
  `deck.yml`. Pull requests build the site without deploying it.
- VitePress 1.x with `vitepress-plugin-mermaid` (and `mermaid`) are root dev dependencies; `pnpm docs:dev`,
  `docs:build`, `docs:preview` run it. The config lives in `docs/.vitepress/config.ts`.
- Every Markdown file in `docs/` is a page. The sidebar is generated from the folders, so a new document
  appears without editing the config. Sources stay plain Markdown written for github.com: `README.md` is a
  folder index, links that leave `docs/` are rewritten to the file on GitHub, raw HTML and `{{` render as
  text.
- The deck's cover links to `docs/`; the docs' nav, sidebar and home page link back to the deck.

## Consequences

- Good: the docs are browsable and searchable without leaving the deck's URL; nothing in `docs/` changes
  to fit the site.
- Bad: about 400 dev packages more in the root install, used only by the docs build.
- Neutral: the deck redeploys when docs change and vice versa, since both are one artifact.

## Confirmation

- `.github/workflows/pages.yml` is the only workflow that uploads a Pages artifact.
- `pnpm docs:build` passes on main; `docs/.vitepress/config.ts` sets `base: '/jarvis-agent/docs/'`.
- No Markdown under `docs/` uses Vue components or VitePress-only syntax.
