# Jarvis Deck

Webinar slides as one self-contained file: `index.html`. Published to the root of GitHub Pages by
`.github/workflows/pages.yml`, together with the docs site under `/docs/` (ADR-0029). The cover links
to the docs.

Not part of the product: excluded from ESLint (`eslint.config.js`), Prettier (`.prettierignore`),
typecheck and tests. Edit the HTML directly, or re-export it from the Claude artifact and overwrite
`index.html`.
