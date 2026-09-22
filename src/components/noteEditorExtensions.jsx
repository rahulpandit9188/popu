import { mergeAttributes, Node } from '@tiptap/core';
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from '@tiptap/react';
import { useState } from 'react';

import { escapeHtml } from '../noteBlocks';
import NoteHtml from './NoteHtml';

export function normalizeFormulaInput(value = '') {
  const latex = value
    .trim()
    .replace(/^\\\(|^\\\[|^\$\$?/, '')
    .replace(/\\\)$|\\\]$|\$\$?$/, '')
    .trim();

  return latex.replace(
    /\s+\b(and|or|where|when|if|then|for)\b\s+/gi,
    (_, word) => ` \\quad \\text{${word}} \\quad `,
  );
}

function FormulaView({ node, updateAttributes, selected }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(node.attrs.latex);

  const editFormula = () => {
    setDraft(node.attrs.latex);
    setEditing(true);
  };

  const saveFormula = () => {
    const latex = normalizeFormulaInput(draft);
    if (!latex) return;
    updateAttributes({ latex });
    setEditing(false);
  };

  return (
    <NodeViewWrapper
      className={`note-formula-node${selected ? ' selected' : ''}`}
      data-drag-handle
    >
      <div contentEditable={false}>
        <NoteHtml
          html={`<div class="math-block">\\[${escapeHtml(normalizeFormulaInput(node.attrs.latex))}\\]</div>`}
        />
        {editing ? (
          <div className="note-node-inline-editor">
            <label>
              Formula
              <textarea
                rows="3"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                autoFocus
              />
            </label>
            <div className="note-node-inline-actions">
              <button type="button" className="primary" onClick={saveFormula}>Save</button>
              <button type="button" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button type="button" className="note-node-edit-button" onClick={editFormula}>
            <i className="fas fa-pen"></i>
            Edit formula
          </button>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export const NoteFormula = Node.create({
  name: 'noteFormula',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      latex: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-note-formula]',
        getAttrs: (element) => ({
          latex: element.getAttribute('data-note-formula') || '',
        }),
      },
      {
        tag: 'div.math-block',
        getAttrs: (element) => ({
          latex: normalizeFormulaInput(element.textContent || ''),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const latex = normalizeFormulaInput(HTMLAttributes.latex || '');
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        class: 'math-block',
        'data-note-formula': latex,
      }),
      `\\[${latex}\\]`,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FormulaView);
  },
});

function DiagramView({ node, updateAttributes, selected }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(node.attrs.text);

  const editDiagram = () => {
    setDraft(node.attrs.text);
    setEditing(true);
  };

  const saveDiagram = () => {
    if (!draft.trim()) return;
    updateAttributes({ text: draft });
    setEditing(false);
  };

  return (
    <NodeViewWrapper
      className={`note-diagram-node${selected ? ' selected' : ''}`}
      data-drag-handle
    >
      <div contentEditable={false}>
        <pre className="ascii-figure">{node.attrs.text}</pre>
        {editing ? (
          <div className="note-node-inline-editor">
            <label>
              Diagram text
              <textarea
                rows="6"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                autoFocus
              />
            </label>
            <div className="note-node-inline-actions">
              <button type="button" className="primary" onClick={saveDiagram}>Save</button>
              <button type="button" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button type="button" className="note-node-edit-button" onClick={editDiagram}>
            <i className="fas fa-pen"></i>
            Edit diagram
          </button>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export const NoteDiagram = Node.create({
  name: 'noteDiagram',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      text: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div.ascii-figure',
        getAttrs: (element) => ({ text: element.textContent || '' }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        class: 'ascii-figure',
        'data-note-diagram': '',
      }),
      HTMLAttributes.text || '',
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DiagramView);
  },
});

export const NoteExample = Node.create({
  name: 'noteExample',
  group: 'block',
  content: 'block+',
  defining: true,

  parseHTML() {
    return [{ tag: 'div.example-box' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        class: 'example-box',
        'data-note-example': '',
      }),
      0,
    ];
  },
});
