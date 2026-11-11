import { posix } from 'node:path';

/** The repository the site is built from and the branch out-of-site links point to (ADR-0029). */
export const REPO_URL = 'https://github.com/burnjohn/jarvis-agent';
export const REPO_BRANCH = 'main';

/** Site base path on the default GitHub Pages address. */
export const SITE_BASE = '/jarvis-agent/';

/**
 * The only parts of docs/ that are published, by repository path (agreed in #jarvis-demo:
 * specifications, architecture and decisions; never docs/plans, docs/webinar or STATUS.md).
 */
export const PUBLISHED_DIRS = ['docs/specs', 'docs/architecture', 'docs/decisions'] as const;

/** Static files served as they are (not rendered as pages), by repository path. */
export const STATIC_FILES = ['docs/architecture/overview.html'] as const;

export function isPublished(repoPath: string): boolean {
  return PUBLISHED_DIRS.some((dir) => repoPath === dir || repoPath.startsWith(`${dir}/`));
}

/**
 * Maps a page of the assembled site (path relative to the content dir, e.g. `architecture/index.md`)
 * to the repository file it was copied from (`docs/architecture/README.md`). The home page has none.
 */
export function contentToRepoPath(contentPath: string): string | null {
  if (contentPath === 'index.md') return null;
  const dir = posix.dirname(contentPath);
  const base = posix.basename(contentPath);
  return posix.join('docs', dir, base === 'index.md' ? 'README.md' : base);
}

/** Inverse of contentToRepoPath for a published Markdown file. */
export function repoToContentPath(repoPath: string): string {
  const rel = posix.relative('docs', repoPath);
  return posix.basename(rel) === 'README.md' ? posix.join(posix.dirname(rel), 'index.md') : rel;
}
