# Jarvis Deck

Webinar slides as one self-contained file per language: `index.html` (Ukrainian) and `en/index.html`
(English, served at `/en/`). The two decks link to each other from the button bar (UA / EN). Published to the root of GitHub Pages by
`.github/workflows/pages.yml`, together with the docs site under `/docs/` (ADR-0029). The cover links
to the docs.

Not part of the product: excluded from ESLint (`eslint.config.js`), Prettier (`.prettierignore`),
typecheck and tests. Edit the HTML directly, or re-export it from the Claude artifact and overwrite
`index.html`. Keep both languages in step: a change to one deck needs the same change in the other.
