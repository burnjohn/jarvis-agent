import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { assemble } from '../lib/assemble';
import { frontmatterTable } from '../lib/frontmatter';
import { buildSidebar, pageTitle } from '../lib/sidebar';
import { contentToRepoPath, repoToContentPath } from '../lib/sections';
import { makeRepo } from './fixture';

describe('frontmatterTable', () => {
  it('renders keys as headers and values as cells, like GitHub', () => {
    const html = frontmatterTable({
      status: 'accepted',
      date: new Date('2026-11-08T00:00:00Z'),
      scope: ['a/**', 'b.ts'],
      supersedes: [],
    });
    expect(html).toContain('<table class="frontmatter" v-pre>');
    expect(html).toContain('<th>status</th><th>date</th><th>scope</th><th>supersedes</th>');
    expect(html).toContain('<td>accepted</td><td>2026-11-08</td>');
    expect(html).toContain('<tr><td>a/**</td></tr><tr><td>b.ts</td></tr>');
  });

  it('escapes HTML and Vue interpolation', () => {
    const html = frontmatterTable({ note: '<script>{{ x }}</script>' });
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('{{');
  });

  it('renders nothing without front matter', () => {
    expect(frontmatterTable(undefined)).toBe('');
    expect(frontmatterTable({})).toBe('');
  });
});

describe('buildSidebar', () => {
  it('has the three sections with every page, landing page first, ADRs by number', () => {
    const repo = makeRepo();
    const contentDir = join(repo, 'site-content');
    const pages = assemble({ repoRoot: repo, contentDir, homePage: join(repo, 'home.md') });
    const sidebar = buildSidebar(contentDir, pages);

    expect(sidebar.map((g) => g.text)).toEqual(['Specifications', 'Architecture', 'Decisions']);
    expect(sidebar[0]?.items).toEqual([
      { text: 'Overview', link: '/specs/' },
      { text: 'Abstract Spec', link: '/specs/abstract' },
    ]);
    expect(sidebar[1]?.items).toEqual([
      { text: 'Overview', link: '/architecture/' },
      { text: 'Deployment', link: '/architecture/deployment' },
      { text: 'Interactive overview', link: '/architecture/overview.html', target: '_self' },
    ]);
    expect(sidebar[2]?.items.map((i) => i.text)).toEqual([
      'Overview',
      'ADR-0002: Two',
      'ADR-0010: Ten',
    ]);
  });

  it('takes the title from the first heading outside code fences', () => {
    const repo = makeRepo();
    expect(pageTitle(join(repo, 'docs/decisions/architecture/0002-two.md'))).toBe('ADR-0002: Two');
  });
});

describe('content paths', () => {
  it('maps README to index and back', () => {
    expect(repoToContentPath('docs/specs/README.md')).toBe('specs/index.md');
    expect(contentToRepoPath('specs/index.md')).toBe('docs/specs/README.md');
    expect(contentToRepoPath('specs/a.md')).toBe('docs/specs/a.md');
    expect(contentToRepoPath('index.md')).toBeNull();
  });
});
