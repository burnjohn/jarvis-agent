import { describe, expect, it } from 'vitest';
import { resolveLink } from '../lib/links';
import { makeRepo } from './fixture';

const repo = makeRepo();

describe('resolveLink', () => {
  it('keeps a link between published documents', () => {
    expect(resolveLink('abstract.md', 'specs/index.md', repo)).toEqual({
      kind: 'keep',
      href: 'abstract.md',
    });
    expect(
      resolveLink('../decisions/architecture/0010-ten.md#x', 'architecture/index.md', repo),
    ).toEqual({
      kind: 'keep',
      href: '../decisions/architecture/0010-ten.md#x',
    });
  });

  it('leaves a link to a published folder to VitePress, missing or not', () => {
    for (const href of ['../decisions/architecture/', '../decisions/nothing-here/']) {
      expect(resolveLink(href, 'architecture/index.md', repo)).toEqual({ kind: 'keep', href });
    }
  });

  it('points a link to a section README at the section index page', () => {
    expect(
      resolveLink('../decisions/architecture/README.md', 'architecture/index.md', repo),
    ).toEqual({
      kind: 'keep',
      href: '../decisions/architecture/index.md',
    });
  });

  it('sends a link to an existing unpublished file to GitHub, keeping the hash', () => {
    expect(resolveLink('../../STATUS.md', 'architecture/index.md', repo)).toEqual({
      kind: 'github',
      href: 'https://github.com/burnjohn/jarvis-agent/blob/main/STATUS.md',
    });
    expect(
      resolveLink('../../deploy/README.md#deploy-script', 'architecture/deployment.md', repo),
    ).toEqual({
      kind: 'github',
      href: 'https://github.com/burnjohn/jarvis-agent/blob/main/deploy/README.md#deploy-script',
    });
    expect(resolveLink('../plans/iteration-1.md', 'specs/index.md', repo)).toEqual({
      kind: 'github',
      href: 'https://github.com/burnjohn/jarvis-agent/blob/main/docs/plans/iteration-1.md',
    });
    expect(resolveLink('../../deploy/', 'architecture/index.md', repo)).toEqual({
      kind: 'github',
      href: 'https://github.com/burnjohn/jarvis-agent/tree/main/deploy',
    });
  });

  it('leaves a link to a missing file unchanged, so the dead-link check fails the build', () => {
    expect(resolveLink('../../NOPE.md', 'architecture/index.md', repo)).toEqual({
      kind: 'keep',
      href: '../../NOPE.md',
    });
    expect(resolveLink('missing.md', 'specs/index.md', repo)).toEqual({
      kind: 'keep',
      href: 'missing.md',
    });
  });

  it('turns a link to overview.html into a plain link under the site base', () => {
    expect(resolveLink('overview.html', 'architecture/index.md', repo)).toEqual({
      kind: 'static',
      href: '/jarvis-agent/architecture/overview.html',
    });
  });

  it('does not touch external, absolute and anchor links, or links on the home page', () => {
    for (const href of ['https://example.org/a.md', 'mailto:a@b.c', '#top', '/specs/']) {
      expect(resolveLink(href, 'specs/index.md', repo)).toEqual({ kind: 'keep', href });
    }
    expect(resolveLink('../STATUS.md', 'index.md', repo)).toEqual({
      kind: 'keep',
      href: '../STATUS.md',
    });
  });
});
