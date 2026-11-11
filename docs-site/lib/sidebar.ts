import { readFileSync } from 'node:fs';
import { join, posix } from 'node:path';

export interface SidebarItem {
  text: string;
  link: string;
  target?: string;
}

export interface SidebarGroup {
  text: string;
  link: string;
  collapsed: boolean;
  items: SidebarItem[];
}

interface Section {
  text: string;
  /** Folder in the assembled content. */
  dir: string;
}

export const SECTIONS: readonly Section[] = [
  { text: 'Specifications', dir: 'specs' },
  { text: 'Architecture', dir: 'architecture' },
  { text: 'Decisions', dir: 'decisions/architecture' },
];

/**
 * One sidebar group per published section: the section's landing page (its README) first, then the
 * other documents in file-name order (ADRs by number), each titled by its first `# ` heading.
 * `pages` are content paths as returned by assemble().
 */
export function buildSidebar(contentDir: string, pages: string[]): SidebarGroup[] {
  return SECTIONS.map(({ text, dir }) => {
    const docs = pages
      .filter((p) => posix.dirname(p) === dir && posix.basename(p) !== 'index.md')
      .sort()
      .map((p) => ({
        text: pageTitle(join(contentDir, p)) ?? posix.basename(p, '.md'),
        link: `/${p.slice(0, -3)}`,
      }));
    const items: SidebarItem[] = [{ text: 'Overview', link: `/${dir}/` }, ...docs];
    if (dir === 'architecture') {
      items.push({
        text: 'Interactive overview',
        link: '/architecture/overview.html',
        target: '_self',
      });
    }
    return { text, link: `/${dir}/`, collapsed: false, items };
  });
}

/** The first level-1 heading outside code fences, as plain text. */
export function pageTitle(file: string): string | null {
  let inFence = false;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const m = /^#\s+(.+?)\s*#*\s*$/.exec(line);
    if (m?.[1]) return m[1].replace(/`/g, '');
  }
  return null;
}
