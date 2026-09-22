import { useCallback, useMemo, useState } from 'react';
import { Extension } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from '@tiptap/extension-table';
import { Fragment } from '@tiptap/pm/model';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import {
  blocksToHtml,
  normalizeBlocks,
  smartTextToBlocks,
} from '../noteBlocks';
import {
  NoteDiagram,
  NoteExample,
  NoteFormula,
  normalizeFormulaInput,
} from './noteEditorExtensions';

const BUBBLE_MENU_OPTIONS = { placement: 'top-end', offset: 8 };

const SelectedContentBlock = Extension.create({
  name: 'selectedContentBlock',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('selectedContentBlock'),
        props: {
          decorations(state) {
            const { doc, selection } = state;
            const position = Math.min(selection.from, Math.max(doc.content.size - 1, 0));
            let selectedDecoration = null;

            doc.forEach((node, offset) => {
              if (!selectedDecoration && position >= offset && position < offset + node.nodeSize) {
                selectedDecoration = Decoration.node(
                  offset,
                  offset + node.nodeSize,
                  { class: 'is-selected-content-block' },
                );
              }
            });

            return selectedDecoration
              ? DecorationSet.create(doc, [selectedDecoration])
              : DecorationSet.empty;
          },
        },
      }),
    ];
  },
});

function shouldShowContextMenu({ editor }) {
  return editor.isFocused;
}

async function decodeImage(file) {
  if ('createImageBitmap' in window) return window.createImageBitmap(file);
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Image open nahi ho saki.'));
      image.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function prepareImageForOcr(file) {
  const image = await decodeImage(file);
  const longestSide = Math.max(image.width, image.height);
  const scale = Math.min(4, Math.max(2, 3200 / longestSide));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close?.();

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  let brightness = 0;
  let samples = 0;
  const sampleStep = Math.max(4, Math.floor(pixels.length / 160000));
  for (let index = 0; index < pixels.length; index += sampleStep * 4) {
    brightness += (pixels[index] * 0.299) + (pixels[index + 1] * 0.587) + (pixels[index + 2] * 0.114);
    samples += 1;
  }
  const invert = brightness / Math.max(samples, 1) < 128;

  for (let index = 0; index < pixels.length; index += 4) {
    let grey = (pixels[index] * 0.299) + (pixels[index + 1] * 0.587) + (pixels[index + 2] * 0.114);
    if (invert) grey = 255 - grey;
    const value = grey > 175 ? 255 : 0;
    pixels[index] = value;
    pixels[index + 1] = value;
    pixels[index + 2] = value;
    pixels[index + 3] = 255;
  }
  context.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Image prepare nahi ho saki.'))),
      'image/png',
    );
  });
}

function ToolButton({
  active = false,
  disabled = false,
  icon,
  label,
  onClick,
}) {
  return (
    <button
      type="button"
      className={active ? 'active' : ''}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
    >
      <i className={icon} aria-hidden="true"></i>
      <span>{label}</span>
    </button>
  );
}

function selectedTopLevelBlock(editor) {
  if (!editor) return null;
  const { doc, selection } = editor.state;
  const position = Math.min(selection.from, Math.max(doc.content.size - 1, 0));
  let selected = null;
  doc.forEach((node, offset, index) => {
    if (!selected && position >= offset && position < offset + node.nodeSize) {
      selected = { node, offset, index, total: doc.childCount };
    }
  });
  return selected;
}

export default function RichNoteEditor({
  defaultValue = '',
  defaultBlocks = [],
  onTitleDetected,
}) {
  const initialContent = useMemo(() => {
    if (defaultValue?.trim()) return defaultValue;
    const oldBlocks = normalizeBlocks(defaultBlocks);
    return oldBlocks.length ? blocksToHtml(oldBlocks) : '<p></p>';
  }, [defaultValue, defaultBlocks]);
  const [html, setHtml] = useState(initialContent);
  const [documentJson, setDocumentJson] = useState({});
  const [pasteText, setPasteText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importError, setImportError] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [ocrConfidence, setOcrConfidence] = useState(null);
  const [, setSelectionVersion] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Placeholder.configure({
        placeholder: 'Yahan likhna ya formatted text paste karna shuru karein…',
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      NoteFormula,
      NoteExample,
      NoteDiagram,
      SelectedContentBlock,
    ],
    content: initialContent,
    onCreate: ({ editor: currentEditor }) => {
      setHtml(currentEditor.getHTML());
      setDocumentJson(currentEditor.getJSON());
    },
    onUpdate: ({ editor: currentEditor }) => {
      setHtml(currentEditor.getHTML());
      setDocumentJson(currentEditor.getJSON());
    },
    onSelectionUpdate: () => {
      setSelectionVersion((version) => version + 1);
    },
  });

  const getSelectedBlockReference = useCallback(() => {
    const selected = selectedTopLevelBlock(editor);
    if (!selected || !editor) return null;
    const domNode = editor.view.nodeDOM(selected.offset);
    if (!domNode) return null;
    const element = domNode.nodeType === window.Node.TEXT_NODE
      ? domNode.parentElement
      : domNode;
    if (!element?.getBoundingClientRect) return null;
    return {
      getBoundingClientRect: () => element.getBoundingClientRect(),
      contextElement: element,
    };
  }, [editor]);

  const putImportedTextInEditor = (text, fileName = '') => {
    const parsed = smartTextToBlocks(text);
    const importedHtml = blocksToHtml(parsed.blocks);
    if (!editor) return;

    if (editor.isEmpty) {
      editor.commands.setContent(importedHtml || '<p></p>');
      if (parsed.title) onTitleDetected?.(parsed.title);
    } else if (importedHtml) {
      editor.chain().focus('end').insertContent(importedHtml).run();
    }

    setSourceName(fileName);
    setImportError('');
  };

  const importSource = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportProgress(0);
    setImportError('');
    try {
      if (file.type.startsWith('image/')) {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error('Image 10 MB se chhoti honi chahiye.');
        }
        const preparedImage = await prepareImageForOcr(file);
        const { createWorker, PSM } = await import('tesseract.js');
        const worker = await createWorker('eng', undefined, {
          logger: (message) => {
            if (message.status === 'recognizing text') {
              setImportProgress(Math.round((message.progress || 0) * 100));
            }
          },
        });
        try {
          await worker.setParameters({
            tessedit_pageseg_mode: PSM.AUTO,
            preserve_interword_spaces: '1',
            user_defined_dpi: '300',
          });
          const result = await worker.recognize(preparedImage);
          setPasteText(result.data.text);
          setOcrConfidence(Math.round(result.data.confidence || 0));
          putImportedTextInEditor(result.data.text, file.name);
        } finally {
          await worker.terminate();
        }
      } else {
        if (file.size > 2 * 1024 * 1024) {
          throw new Error('Text file 2 MB se chhoti honi chahiye.');
        }
        const text = await file.text();
        setPasteText(text);
        setOcrConfidence(null);
        putImportedTextInEditor(text, file.name);
        setImportProgress(100);
      }
    } catch (error) {
      setImportError(error.message || 'File read nahi ho saki. Dobara try karein.');
      setSourceName('');
      setOcrConfidence(null);
      event.target.value = '';
    } finally {
      setImporting(false);
    }
  };

  const importPastedText = () => {
    if (!pasteText.trim()) {
      setImportError('Pehle notes ka text paste karein.');
      return;
    }
    putImportedTextInEditor(pasteText);
  };

  const insertFormula = () => {
    const value = window.prompt(
      'Formula likhein ($ ya $$ nahi lagana):',
      'V = \\frac{W}{q}',
    );
    const latex = normalizeFormulaInput(value || '');
    if (!latex) return;
    editor?.chain().focus().insertContent({
      type: 'noteFormula',
      attrs: { latex },
    }).run();
  };

  const insertExample = () => {
    editor?.chain().focus().insertContent({
      type: 'noteExample',
      content: [
        {
          type: 'heading',
          attrs: { level: 4 },
          content: [{ type: 'text', text: 'Example' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Yahan example ka explanation likhein.' }],
        },
      ],
    }).run();
  };

  const insertDiagram = () => {
    const text = window.prompt(
      'Diagram text paste karein:',
      'q1 (+)  ---- r ----  q2 (+)',
    );
    if (!text?.trim()) return;
    editor?.chain().focus().insertContent({
      type: 'noteDiagram',
      attrs: { text },
    }).run();
  };

  const moveSelectedContent = (direction) => {
    const selected = selectedTopLevelBlock(editor);
    if (!selected) return;
    const targetIndex = selected.index + direction;
    if (targetIndex < 0 || targetIndex >= selected.total) return;

    const { doc, tr } = editor.state;
    if (direction < 0) {
      const previous = doc.child(targetIndex);
      const start = selected.offset - previous.nodeSize;
      tr.replaceWith(
        start,
        selected.offset + selected.node.nodeSize,
        Fragment.fromArray([selected.node, previous]),
      );
      tr.setSelection(TextSelection.near(tr.doc.resolve(Math.min(start + 1, tr.doc.content.size))));
    } else {
      const next = doc.child(targetIndex);
      const end = selected.offset + selected.node.nodeSize + next.nodeSize;
      const newPosition = selected.offset + next.nodeSize;
      tr.replaceWith(
        selected.offset,
        end,
        Fragment.fromArray([next, selected.node]),
      );
      tr.setSelection(TextSelection.near(
        tr.doc.resolve(Math.min(newPosition + 1, tr.doc.content.size)),
      ));
    }
    editor.view.dispatch(tr.scrollIntoView());
    editor.commands.focus();
  };

  const deleteSelectedContent = () => {
    const selected = selectedTopLevelBlock(editor);
    if (!selected) return;
    const { tr } = editor.state;
    tr.delete(selected.offset, selected.offset + selected.node.nodeSize);
    const focusPosition = Math.min(selected.offset, tr.doc.content.size);
    tr.setSelection(TextSelection.near(tr.doc.resolve(focusPosition)));
    editor.view.dispatch(tr.scrollIntoView());
    editor.commands.focus();
  };

  if (!editor) return <p>Editor loading…</p>;

  const selectedBlock = selectedTopLevelBlock(editor);
  const selectedLabel = {
    paragraph: 'Text',
    heading: 'Heading',
    bulletList: 'Bullets',
    orderedList: 'List',
    noteFormula: 'Formula',
    noteExample: 'Example',
    noteDiagram: 'Diagram',
    table: 'Table',
  }[selectedBlock?.node.type.name] || 'Content';

  return (
    <div className="rich-note-editor">
      <details className="note-smart-import">
        <summary>
          <i className="fas fa-wand-magic-sparkles"></i>
          Upload image/text or use Smart Paste
        </summary>
        <p>Import ek draft banata hai. Editor mein check karke final Save karein.</p>
        <label className="note-source-picker">
          <i className="fas fa-upload" aria-hidden="true"></i>
          <span>{importing ? 'Reading file...' : 'Upload image or text'}</span>
          <input
            name="source_file"
            type="file"
            accept="image/png,image/jpeg,image/webp,text/plain,text/markdown,.txt,.md"
            disabled={importing}
            onChange={importSource}
          />
        </label>
        {importing ? (
          <div className="note-import-progress" aria-live="polite">
            <span style={{ width: `${Math.max(importProgress, 5)}%` }}></span>
            <small>Image se text read ho raha hai… {importProgress}%</small>
          </div>
        ) : null}
        {sourceName ? (
          <p className="note-import-success">
            <i className="fas fa-circle-check"></i>
            {sourceName} imported
            {ocrConfidence !== null ? ` • OCR quality ${ocrConfidence}%` : ''}.
          </p>
        ) : null}
        {ocrConfidence !== null && ocrConfidence < 70 ? (
          <p className="note-import-warning">
            Image clear nahi hai. Words aur formulas ko editor mein correct karein.
          </p>
        ) : null}
        {importError ? <p className="auth-error" role="alert">{importError}</p> : null}
        <textarea
          rows="6"
          value={pasteText}
          onChange={(event) => setPasteText(event.target.value)}
          placeholder="Text yahan paste karke Make page dabayein"
        />
        <button className="note-make-page-btn" type="button" onClick={importPastedText}>
          Make page
        </button>
      </details>

      <div className="rich-editor-toolbar" role="toolbar" aria-label="Note formatting">
        <ToolButton
          icon="fas fa-align-left"
          label="Text"
          active={editor.isActive('paragraph')}
          onClick={() => editor.chain().focus().setParagraph().run()}
        />
        <ToolButton
          icon="fas fa-heading"
          label="Heading"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <ToolButton
          icon="fas fa-bold"
          label="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolButton
          icon="fas fa-italic"
          label="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolButton
          icon="fas fa-underline"
          label="Underline"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolButton
          icon="fas fa-list-ul"
          label="Bullets"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolButton
          icon="fas fa-list-ol"
          label="List"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolButton
          icon="fas fa-superscript"
          label="Formula"
          onClick={insertFormula}
        />
        <ToolButton
          icon="fas fa-lightbulb"
          label="Example"
          active={editor.isActive('noteExample')}
          onClick={insertExample}
        />
        <ToolButton
          icon="fas fa-draw-polygon"
          label="Diagram"
          onClick={insertDiagram}
        />
        <ToolButton
          icon="fas fa-table"
          label="Table"
          active={editor.isActive('table')}
          onClick={() => editor.chain().focus().insertTable({
            rows: 3,
            cols: 3,
            withHeaderRow: true,
          }).run()}
        />
        <ToolButton
          icon="fas fa-rotate-left"
          label="Undo"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolButton
          icon="fas fa-rotate-right"
          label="Redo"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        />
      </div>

      <div className="rich-editor-stage">
        <BubbleMenu
          editor={editor}
          className={`rich-context-tools${editor.isActive('table') ? ' rich-context-tools-table' : ''}`}
          options={BUBBLE_MENU_OPTIONS}
          shouldShow={shouldShowContextMenu}
          getReferencedVirtualElement={getSelectedBlockReference}
          aria-label="Selected content controls"
          onMouseDown={(event) => event.preventDefault()}
        >
          <strong>{selectedLabel}</strong>
          <div className="rich-move-tools">
            <button
              type="button"
              disabled={!selectedBlock || selectedBlock.index === 0}
              title="Move content up"
              onClick={() => moveSelectedContent(-1)}
            >
              <i className="fas fa-arrow-up"></i>
              <span>Up</span>
            </button>
            <button
              type="button"
              disabled={!selectedBlock || selectedBlock.index === selectedBlock.total - 1}
              title="Move content down"
              onClick={() => moveSelectedContent(1)}
            >
              <i className="fas fa-arrow-down"></i>
              <span>Down</span>
            </button>
            <button
              type="button"
              className="danger"
              disabled={!selectedBlock}
              title="Remove selected content"
              onClick={deleteSelectedContent}
            >
              <i className="fas fa-xmark"></i>
              <span>Remove</span>
            </button>
          </div>

          {editor.isActive('table') ? (
            <div className="rich-table-tools">
              <strong>Table tools</strong>
              <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()}>
                <i className="fas fa-plus"></i> Row
              </button>
              <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()}>
                <i className="fas fa-plus"></i> Column
              </button>
              <button type="button" onClick={() => editor.chain().focus().deleteRow().run()}>
                <i className="fas fa-minus"></i> Row
              </button>
              <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()}>
                <i className="fas fa-minus"></i> Column
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => editor.chain().focus().deleteTable().run()}
              >
                <i className="fas fa-xmark"></i> Table
              </button>
            </div>
          ) : null}
        </BubbleMenu>

        <EditorContent editor={editor} className="rich-editor-canvas note-html" />
      </div>

      <textarea className="note-content-input" name="content" value={html} readOnly required />
      <textarea
        className="note-content-input"
        name="content_blocks"
        value={JSON.stringify(documentJson)}
        readOnly
      />
    </div>
  );
}
