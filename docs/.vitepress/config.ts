import { readdirSync, readFileSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withMermaid } from 'vitepress-plugin-mermaid';

// Docs site on GitHub Pages under /docs/, next to the webinar deck at the site root (ADR-0029).
// Sources stay plain Markdown that also reads well on github.com.

const REPO = 'https://github.com/burnjohn/jarvis-agent';
const DECK = 'https://burnjohn.github.io/jarvis-agent/';
const SRC = join(dirname(fileURLToPath(import.meta.url)), '..');

// Sidebar sections, in reading order. Every Markdown file in a section's folder is listed, so a new
// document shows up on the site without touching this file.
const SECTIONS: { text: string; dir: string; collapsed?: boolean }[] = [
  { text: 'Specs', dir: 'specs' },
  { text: 'Architecture', dir: 'architecture' },
  { text: 'Decisions (ADRs)', dir: 'decisions/architecture', collapsed: true },
  { text: 'Plans', dir: 'plans', collapsed: true },
  { text: 'Webinar', dir: 'webinar' },
];

// A short sidebar label from the document's first heading. ADR headings are whole sentences, so an ADR
// is labelled by its number and file name instead.
function titleOf(file: string): string {
  const name = posix.basename(file, '.md');
  const adr = name.match(/^(\d{4})-(.+)$/);
  if (adr) return `${adr[1]} · ${adr[2][0].toUpperCase()}${adr[2].slice(1).replace(/-/g, ' ')}`;
  let title = readFileSync(join(SRC, file), 'utf8').match(/^#\s+(.+)$/m)?.[1]?.replace(/`/g, '').trim();
  if (!title) return name;
  title = title
    .replace(/^(Spec|Implementation Plan):\s*/i, '')
    .replace(/\s+—\s+Implementation Plan$/i, '')
    .split(' — ')[0];
  const [head, ...rest] = title.split(': ');
  if (rest.length && rest.join(': ').split(' ').length > 4) title = head;
  return title[0].toUpperCase() + title.slice(1);
}

function sectionItems(dir: string) {
  const files = readdirSync(join(SRC, dir))
    .filter((f) => f.endsWith('.md'))
    .sort((a, b) => (a === 'README.md' ? -1 : b === 'README.md' ? 1 : a.localeCompare(b)));
  return files.map((f) => ({
    text: f === 'README.md' ? 'Overview' : titleOf(`${dir}/${f}`),
    link: f === 'README.md' ? `/${dir}/` : `/${dir}/${f.replace(/\.md$/, '')}`,
  }));
}

export default withMermaid({
  title: 'Jarvis Docs',
  description: 'Personal AI development agent on the Claude Code subscription',
  base: '/jarvis-agent/docs/',
  cleanUrls: true,
  lastUpdated: true,
  srcExclude: ['design/**'],
  // README.md is the folder index on github.com; serve it as the folder index on the site too.
  rewrites: {
    ':dir/README.md': ':dir/index.md',
    ':dir/:sub/README.md': ':dir/:sub/index.md',
  },
  markdown: {
    // The docs write placeholders like <name> as plain text; render raw HTML as text so Vue does not
    // parse them as tags.
    html: false,
    config(md) {
      // Nor as interpolation: a literal {{ in prose or inline code stays text.
      for (const rule of ['text', 'code_inline'] as const) {
        const render = md.renderer.rules[rule]!;
        md.renderer.rules[rule] = (...args) => render(...args).replace(/\{\{/g, '&#123;&#123;');
      }
      // Links are written for github.com. Point README.md links at the rewritten index page, and links
      // that leave docs/ (code, AGENTS.md, STATUS.md) at the file on GitHub.
      md.core.ruler.after('inline', 'github-links', (state) => {
        const from = posix.dirname(String(state.env.relativePath ?? ''));
        for (const block of state.tokens) {
          for (const token of block.children ?? []) {
            const href = token.type === 'link_open' ? token.attrGet('href') : null;
            if (!href || /^([a-z]+:|#|\/)/i.test(href)) continue;
            const target = posix.normalize(posix.join(from, href));
            if (target.startsWith('../')) {
              token.attrSet('href', `${REPO}/blob/main/${target.slice(3)}`);
              token.attrSet('target', '_blank');
            } else {
              token.attrSet('href', href.replace(/(^|\/)README\.md(?=#|$)/, '$1index.md'));
            }
          }
        }
      });
    },
  },
  // overview.html is a standalone page copied in buildEnd, not a Markdown page.
  ignoreDeadLinks: [/overview(\.html)?$/],
  themeConfig: {
    nav: [
      { text: 'Presentation', link: DECK, target: '_self' },
      { text: 'Spec', link: '/specs/abstract-project-spec' },
      { text: 'Architecture', link: '/architecture/' },
      { text: 'ADRs', link: '/decisions/architecture/' },
    ],
    sidebar: [
      {
        text: 'Start',
        items: [
          { text: 'Home', link: '/' },
          { text: 'Presentation', link: DECK, target: '_self' },
          { text: 'Running Jarvis', link: '/running' },
        ],
      },
      ...SECTIONS.map(({ text, dir, collapsed }) => ({
        text,
        collapsed,
        items: [
          ...sectionItems(dir),
          ...(dir === 'architecture'
            ? [{ text: 'Visual overview', link: '/architecture/overview.html', target: '_self' }]
            : []),
        ],
      })),
    ],
    outline: [2, 3],
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: REPO }],
    editLink: { pattern: `${REPO}/edit/main/docs/:path` },
  },
  async buildEnd(site) {
    // The artifact export has no document skeleton; add one so it renders in standards mode.
    const html = await readFile(join(site.srcDir, 'architecture/overview.html'), 'utf8');
    const head =
      '<!doctype html>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    await writeFile(join(site.outDir, 'architecture/overview.html'), html.startsWith('<!doctype') ? html : head + html);
  },
});
