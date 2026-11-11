import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { PUBLISHED_DIRS, STATIC_FILES, repoToContentPath } from './sections';

export interface AssembleOptions {
  /** Repository root (the folder that holds docs/). */
  repoRoot: string;
  /** Output folder; deleted and recreated. */
  contentDir: string;
  /** The site's own home page (Markdown), copied to `<contentDir>/index.md`. */
  homePage: string;
}

/**
 * Builds the site's source folder from the published parts of docs/ (ADR-0029). Files are copied
 * byte for byte; docs/ is only read. A section README.md becomes the section's index.md, static
 * files (overview.html) go to `public/` so VitePress serves them untouched.
 * Returns the content paths of the pages written.
 */
export function assemble({ repoRoot, contentDir, homePage }: AssembleOptions): string[] {
  rmSync(contentDir, { recursive: true, force: true });
  mkdirSync(contentDir, { recursive: true });
  const pages: string[] = [];

  for (const dir of PUBLISHED_DIRS) {
    for (const repoPath of listFiles(repoRoot, dir)) {
      if (!repoPath.endsWith('.md')) continue;
      const contentPath = repoToContentPath(repoPath);
      copy(join(repoRoot, repoPath), join(contentDir, contentPath));
      pages.push(contentPath);
    }
  }

  for (const repoPath of STATIC_FILES) {
    const source = join(repoRoot, repoPath);
    if (existsSync(source))
      copy(source, join(contentDir, 'public', posix.relative('docs', repoPath)));
  }

  copy(homePage, join(contentDir, 'index.md'));
  pages.push('index.md');
  return pages.sort();
}

/** Repository-relative POSIX paths of all files under `dir`, sorted. */
export function listFiles(repoRoot: string, dir: string): string[] {
  const abs = join(repoRoot, dir);
  if (!existsSync(abs)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(abs).sort()) {
    const rel = posix.join(dir, entry);
    if (statSync(join(repoRoot, rel)).isDirectory()) out.push(...listFiles(repoRoot, rel));
    else out.push(rel);
  }
  return out;
}

function copy(from: string, to: string): void {
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to);
}
