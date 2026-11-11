import { fileURLToPath } from 'node:url';
import { cpSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vitepress';
import { assemble } from '../lib/assemble';
import { buildSidebar } from '../lib/sidebar';
import { resolveLink } from '../lib/links';
import { escapeHtml, frontmatterTable } from '../lib/frontmatter';
import { REPO_URL, SITE_BASE, contentToRepoPath } from '../lib/sections';

// Docs site of Jarvis (ADR-0029). The site's pages are assembled from the published parts of docs/
// every time this config loads; docs/ itself is never written.
const siteDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(siteDir, '..');
const contentDir = resolve(siteDir, 'content');
const pages = assemble({ repoRoot, contentDir, homePage: resolve(siteDir, 'home.md') });

// Mermaid is served as its prebuilt browser file and loaded only on pages with a diagram (theme/index.ts).
// Bundling it through Rollup needs more memory than a small build machine has.
mkdirSync(resolve(contentDir, 'public/vendor'), { recursive: true });
cpSync(
  resolve(siteDir, 'node_modules/mermaid/dist/mermaid.min.js'),
  resolve(contentDir, 'public/vendor/mermaid.min.js'),
);

interface PageEnv {
  relativePath?: string;
  frontmatter?: Record<string, unknown>;
}

export default defineConfig({
  title: 'Jarvis',
  description: 'Jarvis documentation: specifications, architecture and decisions.',
  lang: 'en-US',
  base: SITE_BASE,
  srcDir: 'content',
  cleanUrls: false,
  ignoreDeadLinks: false,
  lastUpdated: false,
  themeConfig: {
    nav: [
      { text: 'Specifications', link: '/specs/' },
      { text: 'Architecture', link: '/architecture/' },
      { text: 'Decisions', link: '/decisions/architecture/' },
    ],
    sidebar: buildSidebar(contentDir, pages),
    search: { provider: 'local' },
    outline: { level: [2, 3] },
    socialLinks: [{ icon: 'github', link: REPO_URL }],
  },
  markdown: {
    // The docs use no HTML, but they do write placeholders such as <artifactsDir> or <untrusted-content>
    // in plain text. As HTML these would break the Vue template, so they are shown as text.
    html: false,
    config(md) {
      // Links: pages of the site stay relative, unpublished repository files open on GitHub, a missing
      // target is left for VitePress's dead-link check to fail the build.
      md.core.ruler.push('jarvis_links', (state) => {
        const page = (state.env as PageEnv).relativePath;
        if (!page) return;
        for (const block of state.tokens) {
          for (const token of block.children ?? []) {
            if (token.type !== 'link_open') continue;
            const href = token.attrGet('href');
            if (href === null) continue;
            const resolved = resolveLink(href, page, repoRoot);
            token.attrSet('href', resolved.href);
            if (resolved.kind === 'static') token.attrSet('target', '_self');
          }
        }
      });

      // Front matter shown above the page, as on GitHub.
      md.core.ruler.push('jarvis_frontmatter', (state) => {
        const page = (state.env as PageEnv).relativePath;
        if (!page || contentToRepoPath(page) === null) return;
        const html = frontmatterTable((state.env as PageEnv).frontmatter);
        if (!html) return;
        const token = new state.Token('html_block', '', 0);
        token.content = html;
        state.tokens.unshift(token);
      });

      // Mermaid blocks are drawn in the browser (theme/index.ts).
      const fence = md.renderer.rules.fence;
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        if (token && token.info.trim() === 'mermaid') {
          return `<pre class="mermaid" v-pre>${escapeHtml(token.content)}</pre>\n`;
        }
        return fence
          ? fence(tokens, idx, options, env, self)
          : self.renderToken(tokens, idx, options);
      };
    },
  },
});
