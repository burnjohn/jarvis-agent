import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { assemble, listFiles } from '../lib/assemble';
import { makeRepo } from './fixture';

describe('assemble', () => {
  it('copies only specs, architecture and decisions, with README as the section index', () => {
    const repo = makeRepo();
    const contentDir = join(repo, 'site-content');
    const pages = assemble({ repoRoot: repo, contentDir, homePage: join(repo, 'home.md') });

    expect(pages).toEqual([
      'architecture/deployment.md',
      'architecture/index.md',
      'decisions/architecture/0002-two.md',
      'decisions/architecture/0010-ten.md',
      'decisions/architecture/index.md',
      'index.md',
      'specs/abstract.md',
      'specs/index.md',
    ]);
    const written = listFiles(contentDir, '.');
    expect(written.some((p) => /plans|webinar|STATUS/.test(p))).toBe(false);
    expect(existsSync(join(contentDir, 'public/architecture/overview.html'))).toBe(true);
    expect(existsSync(join(contentDir, 'architecture/overview.html'))).toBe(false);
  });

  it('copies files byte for byte and leaves docs/ untouched', () => {
    const repo = makeRepo();
    const before = listFiles(repo, 'docs').map((p) => [p, readFileSync(join(repo, p), 'utf8')]);
    const contentDir = join(repo, 'site-content');
    assemble({ repoRoot: repo, contentDir, homePage: join(repo, 'home.md') });

    expect(readFileSync(join(contentDir, 'specs/abstract.md'), 'utf8')).toBe(
      readFileSync(join(repo, 'docs/specs/abstract.md'), 'utf8'),
    );
    const after = listFiles(repo, 'docs').map((p) => [p, readFileSync(join(repo, p), 'utf8')]);
    expect(after).toEqual(before);
  });

  it('starts from an empty folder on every run', () => {
    const repo = makeRepo();
    const contentDir = join(repo, 'site-content');
    assemble({ repoRoot: repo, contentDir, homePage: join(repo, 'home.md') });
    const pages = assemble({ repoRoot: repo, contentDir, homePage: join(repo, 'home.md') });
    expect(listFiles(contentDir, '.').filter((p) => p.endsWith('.md'))).toHaveLength(pages.length);
  });
});
