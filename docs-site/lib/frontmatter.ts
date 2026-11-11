/**
 * Renders a page's YAML front matter as a table, the way GitHub shows it above a Markdown file
 * (ADR-0029: documents read the same as in the repository). VitePress parses and hides front matter,
 * so without this an ADR's `status` and `date` would not be visible on the site.
 * Returns '' when there is nothing to show. The table carries `v-pre` so Vue never interprets it.
 */
export function frontmatterTable(frontmatter: Record<string, unknown> | undefined): string {
  const entries = Object.entries(frontmatter ?? {});
  if (entries.length === 0) return '';
  const head = entries.map(([key]) => `<th>${escapeHtml(key)}</th>`).join('');
  const body = entries.map(([, value]) => `<td>${formatValue(value)}</td>`).join('');
  return `<table class="frontmatter" v-pre>\n<thead><tr>${head}</tr></thead>\n<tbody><tr>${body}</tr></tbody>\n</table>\n`;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return escapeHtml(value.toISOString().slice(0, 10));
  if (Array.isArray(value)) {
    if (value.length === 0) return '';
    return `<table><tbody>${value.map((v) => `<tr><td>${formatValue(v)}</td></tr>`).join('')}</tbody></table>`;
  }
  if (typeof value === 'object') {
    const rows = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${formatValue(v)}</td></tr>`)
      .join('');
    return `<table><tbody>${rows}</tbody></table>`;
  }
  return escapeHtml(String(value));
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\{\{/g, '&#123;&#123;');
}
