import { existsSync, statSync } from 'node:fs';
import { join, posix } from 'node:path';
import {
  REPO_BRANCH,
  REPO_URL,
  SITE_BASE,
  STATIC_FILES,
  contentToRepoPath,
  isPublished,
} from './sections';

export type LinkResolution =
  /** Leave the link to VitePress: a page of the site, or a missing file its dead-link check reports. */
  | { kind: 'keep'; href: string }
  /** A file of the repository that is not published: open it on GitHub. */
  | { kind: 'github'; href: string }
  /** A static file of the site (overview.html): a plain link, not routed by the SPA. */
  | { kind: 'static'; href: string };

const SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Decides where a link in a published page goes (ADR-0029). `pageContentPath` is the page's path in the
 * assembled site (`architecture/index.md`), `repoRoot` the repository on disk.
 */
export function resolveLink(
  href: string,
  pageContentPath: string,
  repoRoot: string,
): LinkResolution {
  if (
    !href ||
    href.startsWith('#') ||
    href.startsWith('/') ||
    href.startsWith('//') ||
    SCHEME_RE.test(href)
  ) {
    return { kind: 'keep', href };
  }
  const pageRepoPath = contentToRepoPath(pageContentPath);
  if (pageRepoPath === null) return { kind: 'keep', href };

  const match = /^([^?#]*)([?#].*)?$/.exec(href);
  const pathPart = match?.[1] ?? href;
  const suffix = match?.[2] ?? '';
  if (pathPart === '') return { kind: 'keep', href };

  const target = posix.normalize(posix.join(posix.dirname(pageRepoPath), decodeURI(pathPart)));
  const targetRepoPath = target.replace(/\/$/, '');
  if (targetRepoPath.startsWith('..')) return { kind: 'keep', href };

  if ((STATIC_FILES as readonly string[]).includes(targetRepoPath)) {
    return {
      kind: 'static',
      href: `${SITE_BASE}${posix.relative('docs', targetRepoPath)}${suffix}`,
    };
  }

  if (isPublished(targetRepoPath)) {
    // A section README.md is the section's index page on the site.
    if (posix.basename(pathPart) === 'README.md') {
      return { kind: 'keep', href: `${pathPart.slice(0, -'README.md'.length)}index.md${suffix}` };
    }
    return { kind: 'keep', href };
  }

  const abs = join(repoRoot, targetRepoPath);
  if (!existsSync(abs)) return { kind: 'keep', href };
  const view = statSync(abs).isDirectory() ? 'tree' : 'blob';
  return { kind: 'github', href: `${REPO_URL}/${view}/${REPO_BRANCH}/${targetRepoPath}${suffix}` };
}
