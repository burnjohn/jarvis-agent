import DefaultTheme from 'vitepress/theme';
import { inBrowser, onContentUpdated, withBase } from 'vitepress';
import type { Theme } from 'vitepress';
import './custom.css';

interface MermaidApi {
  initialize(config: Record<string, unknown>): void;
  run(options: { nodes: HTMLElement[] }): Promise<void>;
}

let mermaidLoad: Promise<MermaidApi> | null = null;

/** Loads the prebuilt Mermaid file the config copied to public/vendor, once. */
function loadMermaid(): Promise<MermaidApi> {
  mermaidLoad ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = withBase('/vendor/mermaid.min.js');
    script.async = true;
    script.onload = () => resolve((window as unknown as { mermaid: MermaidApi }).mermaid);
    script.onerror = () => reject(new Error('mermaid failed to load'));
    document.head.appendChild(script);
  });
  return mermaidLoad;
}

/**
 * The default theme (no brand design, ADR-0029) plus Mermaid: the Markdown renderer emits each
 * ```mermaid block as <pre class="mermaid">, and this draws it as an SVG after every page render.
 */
async function renderMermaid(): Promise<void> {
  if (!inBrowser) return;
  const nodes = Array.from(
    document.querySelectorAll<HTMLElement>('pre.mermaid:not([data-processed])'),
  );
  if (nodes.length === 0) return;
  const mermaid = await loadMermaid();
  const dark = document.documentElement.classList.contains('dark');
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: dark ? 'dark' : 'default',
  });
  await mermaid.run({ nodes });
}

const theme: Theme = {
  extends: DefaultTheme,
  setup() {
    onContentUpdated(() => {
      void renderMermaid();
    });
  },
};

export default theme;
