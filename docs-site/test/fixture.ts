import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

/** A throwaway repository with the shape of this one: published sections and the files never published. */
export function makeRepo(): string {
  const root = mkdtempSync(join(tmpdir(), 'docs-site-'));
  const files: Record<string, string> = {
    'STATUS.md': '# Status\n',
    'deploy/README.md': '# Deploy\n',
    'docs/specs/README.md': '# Specs\n\n[Abstract](abstract.md)\n',
    'docs/specs/abstract.md': '---\nstatus: draft\ndate: 2026-10-26\n---\n\n# Abstract Spec\n',
    'docs/architecture/README.md': '# Architecture\n\n[status](../../STATUS.md)\n',
    'docs/architecture/deployment.md': '# Deployment\n',
    'docs/architecture/overview.html': '<html></html>',
    'docs/decisions/architecture/README.md': '# ADRs\n',
    'docs/decisions/architecture/0010-ten.md': '# ADR-0010: Ten\n',
    'docs/decisions/architecture/0002-two.md': '```md\n# not a title\n```\n# ADR-0002: `Two`\n',
    'docs/plans/iteration-1.md': '# Plan\n',
    'docs/webinar/webinar-concept.md': '# Webinar\n',
  };
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  writeFileSync(join(root, 'home.md'), '---\nlayout: home\n---\n');
  return root;
}
