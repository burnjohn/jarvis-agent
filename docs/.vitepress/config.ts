import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { withMermaid } from 'vitepress-plugin-mermaid';

// Docs site for GitHub Pages (ADR-0014). Sources stay plain Markdown that also reads well on github.com.
export default withMermaid({
  title: 'Jarvis',
  description: 'Personal AI development agent on the Claude Code subscription',
  base: '/jarvis-agent/',
  cleanUrls: true,
  lastUpdated: true,
  srcExclude: ['design/**'],
  // README.md is the folder index on github.com; serve it as the folder index on the site too.
  rewrites: {
    ':dir/README.md': ':dir/index.md',
    ':dir/:sub/README.md': ':dir/:sub/index.md',
  },
  markdown: {
    config(md) {
      // Links written for github.com point at README.md; point them at the rewritten index page.
      md.core.ruler.after('inline', 'readme-links', (state) => {
        for (const block of state.tokens) {
          for (const token of block.children ?? []) {
            const href = token.type === 'link_open' ? token.attrGet('href') : null;
            if (href && !/^[a-z]+:/i.test(href)) token.attrSet('href', href.replace(/(^|\/)README\.md(?=#|$)/, '$1index.md'));
          }
        }
      });
    },
  },
  // overview.html is a standalone page copied in buildEnd, not a Markdown page.
  ignoreDeadLinks: [/overview(\.html)?$/],
  themeConfig: {
    nav: [
      { text: 'Spec', link: '/specs/abstract-project-spec' },
      { text: 'Architecture', link: '/architecture/' },
      { text: 'ADRs', link: '/decisions/architecture/' },
    ],
    sidebar: [
      {
        text: 'Specs',
        items: [
          { text: 'Overview', link: '/specs/' },
          { text: 'Abstract project spec', link: '/specs/abstract-project-spec' },
          { text: 'Web UI design brief', link: '/specs/web-ui-design' },
        ],
      },
      {
        text: 'Architecture',
        items: [
          { text: 'Architecture', link: '/architecture/' },
          { text: 'Visual overview', link: '/architecture/overview.html', target: '_self' },
          { text: 'Decisions (ADRs)', link: '/decisions/architecture/' },
        ],
      },
      { text: 'Plans', items: [{ text: 'Iteration 1', link: '/plans/iteration-1' }] },
      { text: 'Webinar', items: [{ text: 'Concept', link: '/webinar/webinar-concept' }] },
    ],
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/burnjohn/jarvis-agent' }],
    editLink: {
      pattern: 'https://github.com/burnjohn/jarvis-agent/edit/main/docs/:path',
    },
  },
  async buildEnd(site) {
    // The artifact export has no document skeleton; add one so it renders in standards mode.
    const html = await readFile(join(site.srcDir, 'architecture/overview.html'), 'utf8');
    const head = '<!doctype html>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    await writeFile(join(site.outDir, 'architecture/overview.html'), html.startsWith('<!doctype') ? html : head + html);
  },
});
