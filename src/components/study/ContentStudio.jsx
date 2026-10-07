import { useEffect, useState } from 'react';
import { academicsApi } from '../../api';
import { ContentBlocks } from './shared';

const ADDERS = [
  ['paragraph', 'Add Text'],
  ['formula', 'Add Formula'],
  ['example', 'Add Example'],
  ['tip', 'Add Tip'],
  ['table', 'Add Table'],
  ['image', 'Add Image'],
  ['question', 'Add Question'],
  ['concept', 'Add Concept'],
  ['definition', 'Add Definition'],
  ['note', 'Add Important Note'],
  ['try', 'Try Yourself'],
  ['summary', 'Add Summary'],
];

function newId() {
  return crypto.randomUUID?.() || `block-${Date.now()}`;
}

function blankBlock(type) {
  const block = { id: newId(), type, content: '' };
  if (type === 'formula') return { ...block, title: 'Key Formula', content: 'x = -b/a' };
  if (type === 'example') return { ...block, title: 'Example 1', content: '' };
  if (type === 'table') {
    return { ...block, headers: ['Column 1', 'Column 2'], rows: [['', '']] };
  }
  if (type === 'image') return { ...block, url: '', content: '' };
  return block;
}

export default function ContentStudio({ token, onSaved, catalog, target }) {
  const classes = catalog?.classes || [];
  const subjects = catalog?.subjects || [];
  const chapters = catalog?.chapters || [];
  const [form, setForm] = useState({
    class_name: 'Class 9',
    subject: 'Mathematics',
    chapter: '',
    topic: '',
    description: '',
    status: 'published',
  });
  const [blocks, setBlocks] = useState([blankBlock('paragraph')]);
  const [jsonText, setJsonText] = useState('');
  const [preview, setPreview] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);
  const [mode, setMode] = useState(target?.chapterId ? 'questions' : 'form');
  const [nextType, setNextType] = useState('paragraph');
  const [classId, setClassId] = useState(target?.classId || '');
  const [subjectId, setSubjectId] = useState(target?.subjectId || '');
  const [chapterId, setChapterId] = useState(target?.chapterId || '');
  const [existingCount, setExistingCount] = useState(null);
  const [questionList, setQuestionList] = useState([]);
  const [editingId, setEditingId] = useState('');
  const [question, setQuestion] = useState({
    prompt: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct: 'A',
  });

  useEffect(() => {
    if (!target?.chapterId) return;
    setClassId(target.classId || '');
    setSubjectId(target.subjectId || '');
    setChapterId(target.chapterId || '');
    setMode('questions');
  }, [target]);

  useEffect(() => {
    if (!chapterId) {
      setExistingCount(null);
      return undefined;
    }
    let active = true;
    setEditingId('');
    academicsApi.practiceQuestions({ chapter: chapterId }, token)
      .then((response) => {
        if (!active) return;
        const items = response.data || [];
        setQuestionList(items);
        setExistingCount(items.length);
      })
      .catch(() => {
        if (active) {
          setQuestionList([]);
          setExistingCount(null);
        }
      });
    return () => {
      active = false;
    };
  }, [chapterId, message, token]);

  const classChoices = classes;
  const subjectChoices = subjects.filter((item) => item.school_class === classId);
  const chapterChoices = chapters.filter((item) => item.subject === subjectId);
  const chosenClass = classChoices.find((item) => item.uuid === classId);
  const chosenSubject = subjectChoices.find((item) => item.uuid === subjectId);
  const chosenChapter = chapterChoices.find((item) => item.uuid === chapterId);
  const questionPath = [
    chosenClass?.class_name,
    chosenSubject?.subject_name,
    chosenChapter ? `Chapter ${chosenChapter.chapter_number}: ${chosenChapter.chapter_name}` : '',
  ].filter(Boolean).join('  →  ');

  const updateBlock = (id, patch) => {
    setBlocks((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const moveBlock = (from, to) => {
    if (to < 0 || to >= blocks.length || from === to) return;
    setBlocks((items) => {
      const next = [...items];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const payloadFromForm = () => ({
    ...form,
    blocks: blocks.map((block, index) => ({ ...block, order: index })),
  });

  const save = async (event) => {
    event?.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      let payload = payloadFromForm();
      if (mode === 'json') {
        payload = JSON.parse(jsonText);
        if (!payload.status) payload.status = form.status;
      }
      if (!payload.subject || !payload.chapter || !payload.topic) {
        throw new Error('Subject, chapter, and topic are required.');
      }
      const response = await academicsApi.importContent(payload, token);
      setSaved(response.data);
      setMessage(`Saved as ${response.data.status}.`);
      onSaved?.();
    } catch (requestError) {
      setError(requestError.message || 'Could not save this note.');
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (blockId, file) => {
    if (!file) return;
    const body = new FormData();
    body.set('image', file);
    try {
      const response = await academicsApi.uploadImage(body, token);
      updateBlock(blockId, { url: response.data.url });
      setMessage('Image uploaded.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const importQuestions = async (event) => {
    event.preventDefault();
    if (!chapterId) {
      setError('Pehle class, subject, aur chapter select karo.');
      return;
    }
    const file = event.currentTarget.file.files?.[0];
    if (!file) {
      setError('Choose a CSV or Excel file.');
      return;
    }
    const body = new FormData();
    body.set('file', file);
    body.set('chapter', chapterId);
    if (saved?.topic_uuid && saved.chapter_uuid === chapterId) body.set('topic', saved.topic_uuid);
    body.set('status', form.status);
    setSaving(true);
    setError('');
    try {
      const response = await academicsApi.importQuestions(body, token);
      setMessage(`${response.message}. Set: ${questionPath}`);
      event.currentTarget.reset();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = async (event) => {
    event.preventDefault();
    if (!chapterId) {
      setError('Pehle class, subject, aur chapter select karo.');
      return;
    }
    if (!question.prompt.trim() || !question.option_a.trim() || !question.option_b.trim() || !question.option_c.trim() || !question.option_d.trim()) {
      setError('Question aur chaaron options likho.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        chapter: chapterId,
        prompt: question.prompt.trim(),
        option_a: question.option_a.trim(),
        option_b: question.option_b.trim(),
        option_c: question.option_c.trim(),
        option_d: question.option_d.trim(),
        correct_option: question.correct,
        status: 'published',
      };
      if (editingId) {
        await academicsApi.updateQuestion(editingId, payload, token);
        setMessage(`Question update ho gaya. Set: ${questionPath}`);
      } else {
        await academicsApi.createQuestion(payload, token);
        setMessage(`Question add ho gaya. Set: ${questionPath}`);
      }
      setEditingId('');
      setQuestion({ prompt: '', option_a: '', option_b: '', option_c: '', option_d: '', correct: 'A' });
      onSaved?.();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const removeQuestion = async (item) => {
    if (!window.confirm(`Is question ko delete karna hai?\n\n${item.prompt}`)) return;
    setSaving(true);
    setError('');
    try {
      await academicsApi.deleteQuestion(item.uuid, token);
      if (editingId === item.uuid) {
        setEditingId('');
        setQuestion({ prompt: '', option_a: '', option_b: '', option_c: '', option_d: '', correct: 'A' });
      }
      setMessage(`Question delete ho gaya. Set: ${questionPath}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const editQuestion = (item) => {
    setEditingId(item.uuid);
    setQuestion({
      prompt: item.prompt || '',
      option_a: item.option_a || '',
      option_b: item.option_b || '',
      option_c: item.option_c || '',
      option_d: item.option_d || '',
      correct: item.correct_option || 'A',
    });
  };

  return (
    <section className="admin-panel study-studio">
      <div className="study-panel-head">
        <div>
          <h2>Upload a topic</h2>
          <p>Class, subject, chapter, and topic — then add the blocks in order.</p>
        </div>
        <div className="study-filters">
          {[
            ['form', 'Write'],
            ['json', 'Paste JSON'],
            ['questions', 'Question set'],
          ].map(([item, label]) => (
            <button key={item} type="button" className={mode === item ? 'active' : ''} onClick={() => setMode(item)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      {error ? <p className="auth-error" role="alert">{error}</p> : null}
      {message ? <p className="admin-success">{message}</p> : null}

      {mode === 'json' ? (
        <label className="admin-field admin-field-wide">
          <span>Structured JSON</span>
          <textarea
            rows="12"
            value={jsonText}
            onChange={(event) => setJsonText(event.target.value)}
            placeholder='{"subject":"Mathematics","chapter":"Linear Equations","topic":"Solving Equations","blocks":[{"type":"formula","title":"Key Formula","content":"x = -b/a"}]}'
          />
        </label>
      ) : null}

      {mode === 'form' ? (
        <form onSubmit={save}>
          <div className="study-studio-grid">
            <label>Class<input value={form.class_name} onChange={(event) => setForm({ ...form, class_name: event.target.value })} required /></label>
            <label>Subject<input value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} required /></label>
            <label>Chapter<input value={form.chapter} onChange={(event) => setForm({ ...form, chapter: event.target.value })} required /></label>
            <label>Topic<input value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })} required /></label>
            <label className="study-wide">Description<textarea rows="2" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
            <label>Status
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>
          <div className="study-adders">
            <select value={nextType} onChange={(event) => setNextType(event.target.value)} aria-label="Block type">
              {ADDERS.map(([type, label]) => (
                <option key={type} value={type}>{label.replace('Add ', '')}</option>
              ))}
            </select>
            <button type="button" onClick={() => setBlocks((items) => [...items, blankBlock(nextType)])}>
              Add block
            </button>
            <button type="button" onClick={() => setPreview((value) => !value)}>{preview ? 'Edit blocks' : 'Preview'}</button>
          </div>
          {preview ? <ContentBlocks blocks={blocks.map((block) => ({ ...block, latex: block.type === 'formula' ? block.content : undefined, body: block.type === 'example' ? block.content : undefined }))} onCopy={() => {}} /> : (
            <div className="study-builder">
              {blocks.map((block, index) => (
                <article
                  key={block.id}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    moveBlock(dragIndex, index);
                    setDragIndex(null);
                  }}
                >
                  <header>
                    <span>{block.type}</span>
                    <div>
                      <button type="button" onClick={() => moveBlock(index, index - 1)} aria-label="Move up">↑</button>
                      <button type="button" onClick={() => moveBlock(index, index + 1)} aria-label="Move down">↓</button>
                      <button type="button" onClick={() => setBlocks((items) => items.filter((item) => item.id !== block.id))}>Remove</button>
                    </div>
                  </header>
                  {block.type !== 'table' && block.type !== 'paragraph' ? (
                    <input
                      value={block.title || ''}
                      placeholder="Title"
                      onChange={(event) => updateBlock(block.id, { title: event.target.value })}
                    />
                  ) : null}
                  {block.type === 'table' ? (
                    <textarea
                      rows="4"
                      value={[
                        (block.headers || []).join(' | '),
                        ...(block.rows || []).map((row) => row.join(' | ')),
                      ].join('\n')}
                      onChange={(event) => {
                        const lines = event.target.value.split('\n').filter(Boolean);
                        updateBlock(block.id, {
                          headers: (lines[0] || '').split('|').map((cell) => cell.trim()),
                          rows: lines.slice(1).map((line) => line.split('|').map((cell) => cell.trim())),
                        });
                      }}
                    />
                  ) : (
                    <textarea
                      rows="3"
                      value={block.content || ''}
                      placeholder={block.type === 'formula' ? 'x = -b/a' : 'Write this block'}
                      onChange={(event) => updateBlock(block.id, { content: event.target.value })}
                    />
                  )}
                  {block.type === 'image' ? (
                    <>
                      <input type="file" accept="image/*" onChange={(event) => uploadImage(block.id, event.target.files?.[0])} />
                      {block.url ? <img src={block.url} alt="" /> : null}
                    </>
                  ) : null}
                </article>
              ))}
            </div>
          )}
          <button className="signup-btn" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save topic'}</button>
        </form>
      ) : null}

      {mode !== 'form' ? (
        <div className="study-studio-actions">
          <label>Status
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          {mode === 'json' ? (
            <button className="signup-btn" type="button" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Upload JSON'}</button>
          ) : null}
        </div>
      ) : null}

      {mode === 'questions' ? (
        <div className="study-question-upload">
          <div className="question-target">
            <span>Yeh question set iske liye hai</span>
            <strong>{questionPath || 'Abhi class, subject, aur chapter select nahi hua'}</strong>
            {chosenChapter ? <small>Is chapter mein abhi {existingCount ?? '—'} objective questions hain.</small> : null}
          </div>
          <div className="study-studio-grid">
            <label>Class
              <select value={classId} onChange={(event) => { setClassId(event.target.value); setSubjectId(''); setChapterId(''); }}>
                <option value="">Select class</option>
                {classChoices.map((item) => (
                  <option key={item.uuid} value={item.uuid}>{item.class_name} ({item.medium})</option>
                ))}
              </select>
            </label>
            <label>Subject
              <select value={subjectId} onChange={(event) => { setSubjectId(event.target.value); setChapterId(''); }} disabled={!classId}>
                <option value="">Select subject</option>
                {subjectChoices.map((item) => (
                  <option key={item.uuid} value={item.uuid}>{item.subject_name}</option>
                ))}
              </select>
            </label>
            <label className="study-wide">Chapter
              <select value={chapterId} onChange={(event) => setChapterId(event.target.value)} disabled={!subjectId}>
                <option value="">Select chapter</option>
                {chapterChoices.map((item) => (
                  <option key={item.uuid} value={item.uuid}>Chapter {item.chapter_number}: {item.chapter_name}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="question-manage-list">
            <h3>Is chapter ke saare questions</h3>
            {questionList.length === 0 ? <p>Abhi koi question nahi hai. Neeche se add karo.</p> : null}
            {questionList.map((item, index) => (
              <article key={item.uuid}>
                <div>
                  <strong>{index + 1}. {item.prompt}</strong>
                  <p>A. {item.option_a} · B. {item.option_b} · C. {item.option_c} · D. {item.option_d}</p>
                  <small>Sahi option: {item.correct_option || '—'}</small>
                </div>
                <div>
                  <button type="button" onClick={() => editQuestion(item)} disabled={saving}>Edit</button>
                  <button type="button" onClick={() => removeQuestion(item)} disabled={saving}>Delete</button>
                </div>
              </article>
            ))}
          </div>
          <form onSubmit={addQuestion}>
            <label>Question
              <textarea rows="2" value={question.prompt} onChange={(event) => setQuestion({ ...question, prompt: event.target.value })} placeholder="Objective question" />
            </label>
            <div className="study-studio-grid">
              {['a', 'b', 'c', 'd'].map((letter) => (
                <label key={letter}>Option {letter.toUpperCase()}
                  <input value={question[`option_${letter}`]} onChange={(event) => setQuestion({ ...question, [`option_${letter}`]: event.target.value })} />
                </label>
              ))}
            </div>
            <label>Sahi option
              <select value={question.correct} onChange={(event) => setQuestion({ ...question, correct: event.target.value })}>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </label>
            <button className="signup-btn" type="submit" disabled={saving}>
              {editingId ? 'Save changes' : 'Add to this chapter'}
            </button>
            {editingId ? (
              <button
                className="login-btn"
                type="button"
                onClick={() => {
                  setEditingId('');
                  setQuestion({ prompt: '', option_a: '', option_b: '', option_c: '', option_d: '', correct: 'A' });
                }}
              >
                Cancel edit
              </button>
            ) : null}
          </form>
          <form onSubmit={importQuestions}>
            <p>Same chapter ke liye file se bhi daal sakte ho. Columns: question, option_a, option_b, option_c, option_d, correct.</p>
            <input name="file" type="file" accept=".csv,.xlsx" />
            <button className="login-btn" type="submit" disabled={saving}>Import file into this chapter</button>
          </form>
        </div>
      ) : null}
    </section>
  );
}
