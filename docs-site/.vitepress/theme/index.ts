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
 * Renders run one after another: on a fresh load the content-updated hook fires more than once, and
 * two concurrent mermaid.run calls on the same nodes leave them as source text.
 */
let queue: Promise<void> = Promise.resolve();

function renderMermaid(): void {
  if (!inBrowser) return;
  queue = queue.then(renderPending).catch((error: unknown) => {
    console.warn('mermaid: diagram not rendered', error);
  });
}

async function renderPending(): Promise<void> {
  const selector = 'pre.mermaid:not([data-processed])';
  if (!document.querySelector(selector)) return;
  const mermaid = await loadMermaid();
  const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
  if (nodes.length === 0) return;
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
      renderMermaid();
    });
  },
};

export default theme;
