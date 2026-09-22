import { useLayoutEffect, useRef } from 'react';
import renderMathInElement from 'katex/contrib/auto-render';
import 'katex/dist/katex.min.css';

export function looksLikeHtml(value) {
  return /<\/?[a-z][\s\S]*>/i.test(value || '');
}

export function sanitizeNoteHtml(html) {
  const parsed = new DOMParser().parseFromString(`<div>${html || ''}</div>`, 'text/html');
  parsed.querySelectorAll('script, iframe, object, embed, link, meta, form').forEach((node) => node.remove());
  parsed.querySelectorAll('*').forEach((node) => {
    [...node.attributes].forEach((attr) => {
      if (attr.name.startsWith('on') || attr.name === 'srcdoc') {
        node.removeAttribute(attr.name);
      }
      if (
        (attr.name === 'href' || attr.name === 'src') &&
        /^\s*javascript:/i.test(attr.value)
      ) {
        node.removeAttribute(attr.name);
      }
    });
  });
  return parsed.body.firstElementChild?.innerHTML || '';
}

export default function NoteHtml({ html }) {
  const ref = useRef(null);
  const isHtml = looksLikeHtml(html);
  const sanitized = isHtml ? sanitizeNoteHtml(html) : '';

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !isHtml || !node.isConnected) return;
    try {
      renderMathInElement(node, {
        delimiters: [
          { left: '\\[', right: '\\]', display: true },
          { left: '$$', right: '$$', display: true },
          { left: '\\(', right: '\\)', display: false },
        ],
        ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
        throwOnError: false,
        strict: false,
      });
    } catch {
      // Keep the original formula text visible if rendering fails.
    }
  });

  if (!html) return null;
  if (!isHtml) {
    return <p className="note-html-plain">{html}</p>;
  }

  return (
    <div
      ref={ref}
      className="note-html"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
