# Fonts

Self-hosted so the app makes no third-party requests. The fonts are licensed under the SIL Open Font
License 1.1 (`OFL-Inter.txt`, `OFL-JetBrainsMono.txt`, `OFL-InstrumentSerif.txt`).

| Files                                                                      | Source                                                    |
| -------------------------------------------------------------------------- | --------------------------------------------------------- |
| `inter-{latin,latin-ext,cyrillic,cyrillic-ext}-wght-normal.woff2`          | npm `@fontsource-variable/inter@5.3.0`, `files/`          |
| `jetbrains-mono-{latin,latin-ext,cyrillic,cyrillic-ext}-wght-normal.woff2` | npm `@fontsource-variable/jetbrains-mono@5.3.0`, `files/` |
| `instrument-serif-{latin,latin-ext}-400-{normal,italic}.woff2`             | npm `@fontsource/instrument-serif@5.3.0`, `files/`        |

The packages are only the source of the files; they are not dependencies of `@jarvis/web`. The
`@font-face` rules live in `web/src/styles/fonts.css` (copied from the packages' `wght.css` / `400*.css`, paths
rewritten to `/fonts/`).
