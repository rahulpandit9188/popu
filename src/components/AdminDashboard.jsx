import { useCallback, useEffect, useState } from 'react';
import { academicsApi } from '../api/client';
import AdminEditor from './AdminEditor';
import RichNoteEditor from './RichNoteEditor';

const TYPES = [
  {
    id: 'class',
    listKey: 'classes',
    label: 'Classes',
    singular: 'Class',
    icon: 'fas fa-layer-group',
    step: '1',
    title: 'Class banao',
    hint: 'Jaise Class 12. Sabse pehle yeh.',
  },
  {
    id: 'subject',
    listKey: 'subjects',
    label: 'Subjects',
    singular: 'Subject',
    icon: 'fas fa-book-open',
    step: '2',
    title: 'Subject add karo',
    hint: 'Class ke andar, jaise Physics.',
  },
  {
    id: 'chapter',
    listKey: 'chapters',
    label: 'Chapters',
    singular: 'Chapter',
    icon: 'fas fa-list-ol',
    step: '3',
    title: 'Chapter add karo',
    hint: 'Subject ke andar, jaise Chapter 1.',
  },
  {
    id: 'note',
    listKey: 'notes',
    label: 'Notes',
    singular: 'Note',
    icon: 'fas fa-file-alt',
    step: '4',
    title: 'Note card likho',
  },
];

async function loadAll(fetchPage, params = {}) {
  const first = await fetchPage({ ...params, page: 1 });
  const items = [...(first.data || [])];
  for (let page = 2; page <= (first.pagination?.total_pages || 1); page += 1) {
    const next = await fetchPage({ ...params, page });
    items.push(...(next.data || []));
  }
  return { ...first, data: items };
}

function Field({ label, hint, wide, children }) {
  return (
    <label className={`admin-field${wide ? ' admin-field-wide' : ''}`}>
      <span>{label}</span>
      {hint ? <small>{hint}</small> : null}
      {children}
    </label>
  );
}

export default function AdminDashboard({ user, onBack, onOpenClass }) {
  const [data, setData] = useState({
    classes: [],
    subjects: [],
    chapters: [],
    notes: [],
  });
  const [counts, setCounts] = useState({
    classes: 0,
    subjects: 0,
    chapters: 0,
    notes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [workspace, setWorkspace] = useState('class');
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeForm, setActiveForm] = useState('note');
  const [manageSearch, setManageSearch] = useState('');
  const [noteTitle, setNoteTitle] = useState('');

  const currentType = TYPES.find((item) => item.id === workspace) || TYPES[3];

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [classes, subjects, chapters, notes] = await Promise.all([
        loadAll(academicsApi.classes),
        loadAll(academicsApi.subjects),
        loadAll(academicsApi.chapters, { ordering: 'chapter_number' }),
        loadAll(academicsApi.notes, { ordering: '-created_at' }),
      ]);
      setData({
        classes: classes.data || [],
        subjects: subjects.data || [],
        chapters: chapters.data || [],
        notes: notes.data || [],
      });
      setCounts({
        classes: classes.pagination?.count ?? classes.data?.length ?? 0,
        subjects: subjects.pagination?.count ?? subjects.data?.length ?? 0,
        chapters: chapters.pagination?.count ?? chapters.data?.length ?? 0,
        notes: notes.pagination?.count ?? notes.data?.length ?? 0,
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const classForSubject = (subject) => data.classes.find((item) => item.uuid === subject?.school_class);
  const subjectForChapter = (chapter) => data.subjects.find((item) => item.uuid === chapter?.subject);
  const chapterForNote = (note) => data.chapters.find((item) => item.uuid === note?.chapter);
  const selectedClass = data.classes.find((item) => item.uuid === selectedClassId);
  const selectedSubject = data.subjects.find((item) => item.uuid === selectedSubjectId);
  const selectedChapter = data.chapters.find((item) => item.uuid === selectedChapterId);
  const contentPath = (type, item) => {
    if (type === 'class') return `${item.class_name} (${item.medium})`;
    if (type === 'subject') {
      const schoolClass = classForSubject(item);
      return `${schoolClass?.class_name || 'Unknown class'} → ${item.subject_name}`;
    }
    if (type === 'chapter') {
      const selectedSubject = subjectForChapter(item);
      const schoolClass = classForSubject(selectedSubject);
      return `${schoolClass?.class_name || 'Unknown class'} → ${selectedSubject?.subject_name || 'Unknown subject'} → Chapter ${item.chapter_number}: ${item.chapter_name}`;
    }
    const selectedChapter = chapterForNote(item);
    const selectedSubject = subjectForChapter(selectedChapter);
    const schoolClass = classForSubject(selectedSubject);
    return `${schoolClass?.class_name || 'Unknown class'} → ${selectedSubject?.subject_name || 'Unknown subject'} → Chapter ${selectedChapter?.chapter_number || '?'}: ${selectedChapter?.chapter_name || 'Unknown chapter'} → ${item.title}`;
  };

  const workspaceItems = {
    class: data.classes,
    subject: data.subjects.filter((item) => item.school_class === selectedClassId),
    chapter: data.chapters.filter((item) => item.subject === selectedSubjectId),
    note: data.notes.filter((item) => item.chapter === selectedChapterId),
  }[workspace] || [];
  const searchWords = manageSearch.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const filteredItems = searchWords.length
    ? workspaceItems.filter((item) => {
      const path = contentPath(workspace, item).toLowerCase();
      return searchWords.every((word) => path.includes(word));
    })
    : workspaceItems;

  const openClass = (item) => {
    setSelectedClassId(item.uuid);
    setSelectedSubjectId(null);
    setSelectedChapterId(null);
    setWorkspace('subject');
    setManageSearch('');
  };

  const openSubject = (item) => {
    setSelectedSubjectId(item.uuid);
    setSelectedChapterId(null);
    setWorkspace('chapter');
    setManageSearch('');
  };

  const openChapter = (item) => {
    setSelectedChapterId(item.uuid);
    setWorkspace('note');
    setManageSearch('');
  };

  const showClasses = () => {
    setSelectedClassId(null);
    setSelectedSubjectId(null);
    setSelectedChapterId(null);
    setWorkspace('class');
    setManageSearch('');
  };

  const showSubjects = () => {
    setSelectedSubjectId(null);
    setSelectedChapterId(null);
    setWorkspace('subject');
    setManageSearch('');
  };

  const showChapters = () => {
    setSelectedChapterId(null);
    setWorkspace('chapter');
    setManageSearch('');
  };

  const goBackLevel = () => {
    if (workspace === 'note') showChapters();
    else if (workspace === 'chapter') showSubjects();
    else if (workspace === 'subject') showClasses();
  };

  const openAdd = (type) => {
    setWorkspace(type);
    setActiveForm(type);
    setEditing(null);
    if (type === 'note') setNoteTitle('');
    setEditorOpen(true);
    setError('');
    setSuccess('');
  };

  const editContent = (type, item) => {
    setWorkspace(type);
    setActiveForm(type);
    setEditing(item);
    if (type === 'note') setNoteTitle(item.title || '');
    setEditorOpen(true);
    setError('');
    setSuccess('');
  };

  const closeEditor = () => {
    if (saving) return;
    setEditorOpen(false);
    setEditing(null);
    setError('');
  };

  const submitContent = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    setSuccess('');
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));

    try {
      if (activeForm === 'class') {
        await (editing
          ? academicsApi.updateClass(editing.uuid, values, user.access)
          : academicsApi.createClass(values, user.access));
      }
      if (activeForm === 'subject') {
        await (editing
          ? academicsApi.updateSubject(editing.uuid, values, user.access)
          : academicsApi.createSubject(values, user.access));
      }
      if (activeForm === 'chapter') {
        const payload = { ...values, chapter_number: Number(values.chapter_number) };
        await (editing
          ? academicsApi.updateChapter(editing.uuid, payload, user.access)
          : academicsApi.createChapter(payload, user.access));
      }
      if (activeForm === 'note') {
        const payload = new FormData(form);
        if (!payload.get('image')?.name) payload.delete('image');
        if (!payload.get('source_file')?.name) payload.delete('source_file');
        await (editing
          ? academicsApi.updateNote(editing.uuid, payload, user.access)
          : academicsApi.createNote(payload, user.access));
      }
      setSuccess(`${activeForm[0].toUpperCase()}${activeForm.slice(1)} ${editing ? 'updated' : 'added'} successfully.`);
      setEditorOpen(false);
      setEditing(null);
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteContent = async (type, item) => {
    const path = contentPath(type, item);
    if (!window.confirm(`Kya aap ise delete karna chahte hain?\n\n${path}\n\nLinked content bhi delete ho sakta hai.`)) return;
    setSaving(true);
    setError('');
    try {
      const method = `delete${type[0].toUpperCase()}${type.slice(1)}`;
      await academicsApi[method](item.uuid, user.access);
      setEditorOpen(false);
      setEditing(null);
      setSuccess(`${type[0].toUpperCase()}${type.slice(1)} deleted successfully.`);
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const emptyCopy = {
    class: 'Abhi koi class nahi hai. Pehle ek class add karo.',
    subject: `${selectedClass?.class_name || 'Is class'} mein abhi koi subject nahi hai.`,
    chapter: `${selectedSubject?.subject_name || 'Is subject'} mein abhi koi chapter nahi hai.`,
    note: `${selectedChapter?.chapter_name || 'Is chapter'} mein abhi koi note nahi hai.`,
  };

  if (!user?.is_staff) {
    return (
      <main className="admin-dashboard">
        <div className="admin-shell">
          <p className="auth-error">Permission denied. Staff account required.</p>
          <button className="class-page-back" type="button" onClick={onBack}>
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  const formMeta = TYPES.find((item) => item.id === activeForm) || TYPES[3];
  const levelTitle = {
    class: 'All Classes',
    subject: `${selectedClass?.class_name || 'Class'} ke Subjects`,
    chapter: `${selectedSubject?.subject_name || 'Subject'} ke Chapters`,
    note: `${selectedChapter?.chapter_name || 'Chapter'} ke Notes`,
  }[workspace];
  const levelHint = {
    class: 'Class open karke uske subjects manage karein.',
    subject: 'Sirf selected class ke subjects dikh rahe hain.',
    chapter: 'Sirf selected subject ke chapters dikh rahe hain.',
    note: 'Sirf selected chapter ke note cards dikh rahe hain.',
  }[workspace];

  return (
    <main className="admin-dashboard">
      <div className="admin-shell">
        <div className="admin-heading">
          <div>
            <h1>Content Dashboard</h1>
          </div>
          <div className="admin-heading-actions">
            <button className="login-btn" type="button" onClick={onBack}>
              Back to Home
            </button>
            <button className="signup-btn" type="button" onClick={loadDashboard}>
              <i className="fas fa-rotate"></i>
              Refresh
            </button>
          </div>
        </div>

        {error && !editorOpen ? <p className="auth-error" role="alert">{error}</p> : null}
        {success ? <p className="admin-success">{success}</p> : null}

        <section className="admin-stats" aria-label="Content totals">
          {TYPES.map((type) => (
            <div className="admin-stat-card" key={type.id}>
              <span className="admin-stat-icon">
                <i className={type.icon}></i>
              </span>
              <div>
                <strong>{loading ? '—' : counts[type.listKey]}</strong>
                <p>{type.label}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="admin-panel admin-library" aria-labelledby="admin-library-heading">
          <nav className="admin-hierarchy-breadcrumb" aria-label="Current content location">
            <button type="button" className={workspace === 'class' ? 'active' : ''} onClick={showClasses}>
              <i className="fas fa-layer-group"></i>
              Classes
            </button>
            {selectedClass ? (
              <>
                <i className="fas fa-chevron-right" aria-hidden="true"></i>
                <button type="button" className={workspace === 'subject' ? 'active' : ''} onClick={showSubjects}>
                  {selectedClass.class_name}
                </button>
              </>
            ) : null}
            {selectedSubject ? (
              <>
                <i className="fas fa-chevron-right" aria-hidden="true"></i>
                <button type="button" className={workspace === 'chapter' ? 'active' : ''} onClick={showChapters}>
                  {selectedSubject.subject_name}
                </button>
              </>
            ) : null}
            {selectedChapter ? (
              <>
                <i className="fas fa-chevron-right" aria-hidden="true"></i>
                <button type="button" className={workspace === 'note' ? 'active' : ''} onClick={() => setWorkspace('note')}>
                  Chapter {selectedChapter.chapter_number}
                </button>
              </>
            ) : null}
          </nav>

          <div className="admin-library-head">
            <div className="admin-level-heading">
              {workspace !== 'class' ? (
                <button className="admin-level-back" type="button" onClick={goBackLevel}>
                  <i className="fas fa-arrow-left"></i>
                  Back
                </button>
              ) : null}
              <div>
                <h2 id="admin-library-heading">{levelTitle}</h2>
                <p>{levelHint}</p>
              </div>
            </div>
            <button className="signup-btn" type="button" disabled={saving} onClick={() => openAdd(workspace)}>
              <i className="fas fa-plus"></i>
              Add {currentType.singular}
            </button>
          </div>

          <label className="admin-manage-search">
            <input
              type="search"
              value={manageSearch}
              onChange={(event) => setManageSearch(event.target.value)}
              placeholder={`Search ${currentType.label.toLowerCase()}`}
              aria-label={`Search in ${currentType.label.toLowerCase()}`}
            />
          </label>

          <div className="admin-hierarchy-content">
            {loading ? <p>Loading content...</p> : null}
            {!loading && filteredItems.length === 0 ? (
              <div className="admin-empty">
                <p>{manageSearch ? `No matching ${currentType.label.toLowerCase()} found.` : emptyCopy[workspace]}</p>
                {!manageSearch ? (
                  <button className="signup-btn" type="button" onClick={() => openAdd(workspace)}>
                    Add {currentType.singular}
                  </button>
                ) : null}
              </div>
            ) : null}

            {!loading && filteredItems.length > 0 ? (
              <div className="admin-hierarchy-grid">
                {filteredItems.map((item) => {
                  const childCount = workspace === 'class'
                    ? data.subjects.filter((subject) => subject.school_class === item.uuid).length
                    : workspace === 'subject'
                      ? data.chapters.filter((chapter) => chapter.subject === item.uuid).length
                      : workspace === 'chapter'
                        ? data.notes.filter((note) => note.chapter === item.uuid).length
                        : 0;
                  const title = workspace === 'class'
                    ? item.class_name
                    : workspace === 'subject'
                      ? item.subject_name
                      : workspace === 'chapter'
                        ? `Chapter ${item.chapter_number}: ${item.chapter_name}`
                        : item.title;
                  const description = workspace === 'class' || workspace === 'subject'
                    ? item.title
                    : item.description;
                  const meta = workspace === 'class'
                    ? `${item.medium} • ${childCount} subjects`
                    : workspace === 'subject'
                      ? `${childCount} chapters`
                      : workspace === 'chapter'
                        ? ''
                        : 'Note card';
                  const openItem = workspace === 'class'
                    ? () => openClass(item)
                    : workspace === 'subject'
                      ? () => openSubject(item)
                      : workspace === 'chapter'
                        ? () => openChapter(item)
                        : null;
                  const openLabel = workspace === 'class'
                    ? 'View subjects'
                    : workspace === 'subject'
                      ? 'View chapters'
                      : 'View notes';
                  const path = contentPath(workspace, item);

                  return (
                    <article className="admin-hierarchy-card" key={item.uuid}>
                      <div className="admin-hierarchy-card-main">
                        <span className="admin-hierarchy-card-icon">
                          <i className={currentType.icon}></i>
                        </span>
                        <div>
                          {meta ? <span className="admin-hierarchy-card-meta">{meta}</span> : null}
                          <h3>{title}</h3>
                          {description && description !== title ? <p>{description}</p> : null}
                        </div>
                      </div>
                      <div className="admin-hierarchy-card-actions">
                        {openItem ? (
                          <button className="admin-open-btn" type="button" onClick={openItem}>
                            {openLabel}
                            <i className="fas fa-arrow-right"></i>
                          </button>
                        ) : null}
                        {workspace === 'class' ? (
                          <button className="admin-link-btn" type="button" onClick={() => onOpenClass(item)}>
                            Student view
                          </button>
                        ) : null}
                        <button
                          className="admin-action-btn admin-edit-btn"
                          type="button"
                          disabled={saving || loading}
                          aria-label={`Edit ${path}`}
                          onClick={() => editContent(workspace, item)}
                        >
                          <i className="fas fa-pen" aria-hidden="true"></i>
                          Edit
                        </button>
                        <button
                          className="admin-action-btn admin-delete-btn"
                          type="button"
                          disabled={saving || loading}
                          aria-label={`Delete ${path}`}
                          onClick={() => deleteContent(workspace, item)}
                        >
                          <i className="fas fa-trash" aria-hidden="true"></i>
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>

        <AdminEditor
          open={editorOpen}
          saving={saving}
          onClose={closeEditor}
          className={activeForm === 'note' ? 'admin-edit-dialog-note' : 'admin-edit-dialog-compact'}
        >
          {!editing ? (
            <div className="admin-panel-heading">
              <div>
                <h2 id="admin-editor-title" tabIndex={-1}>Add {formMeta.singular}</h2>
                <p>{formMeta.hint}</p>
              </div>
            </div>
          ) : null}

          {editing ? (
            <div className="admin-editing-banner">
              <i className="fas fa-pen-to-square"></i>
              <div>
                <strong>Edit {formMeta.singular}</strong>
                <span id="admin-edit-path">{contentPath(activeForm, editing)}</span>
              </div>
            </div>
          ) : (
            <p id="admin-edit-path" className="admin-content-path">{formMeta.title}</p>
          )}

          {error ? <p className="auth-error" role="alert">{error}</p> : null}

          <form className="admin-content-form" onSubmit={submitContent} key={`${activeForm}-${editing?.uuid || 'new'}`}>
            <div className="admin-form-scroll">
            {activeForm === 'class' ? (
              <>
                <Field label="Class name" hint="Students ko yeh naam dikhega">
                  <input name="class_name" placeholder="Class 12" defaultValue={editing?.class_name || ''} required />
                </Field>
                <Field label="Display title">
                  <input name="title" placeholder="Class 12 CBSE" defaultValue={editing?.title || ''} required />
                </Field>
                <Field label="Medium">
                  <select name="medium" defaultValue={editing?.medium || 'English'} required>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </Field>
                <Field label="Description" hint="Optional" wide>
                  <textarea name="description" rows="3" defaultValue={editing?.description || ''} />
                </Field>
              </>
            ) : null}

            {activeForm === 'subject' ? (
              <>
                <Field label="Class" hint="Yeh subject kis class mein hai?" wide>
                  <select name="school_class" required defaultValue={editing?.school_class || selectedClassId || ''}>
                    <option value="" disabled>Select class</option>
                    {data.classes.map((item) => (
                      <option key={item.uuid} value={item.uuid}>{item.class_name} ({item.medium})</option>
                    ))}
                  </select>
                </Field>
                <Field label="Subject name">
                  <input name="subject_name" placeholder="Physics" defaultValue={editing?.subject_name || ''} required />
                </Field>
                <Field label="Display title">
                  <input name="title" placeholder="Physics" defaultValue={editing?.title || ''} required />
                </Field>
                <Field label="Description" hint="Optional" wide>
                  <textarea name="description" rows="3" defaultValue={editing?.description || ''} />
                </Field>
              </>
            ) : null}

            {activeForm === 'chapter' ? (
              <>
                <Field label="Subject" hint="Class → Subject" wide>
                  <select name="subject" required defaultValue={editing?.subject || selectedSubjectId || ''}>
                    <option value="" disabled>Select subject</option>
                    {data.subjects.map((item) => (
                      <option key={item.uuid} value={item.uuid}>
                        {classForSubject(item)?.class_name} → {item.subject_name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Chapter number">
                  <input name="chapter_number" type="number" min="1" placeholder="1" defaultValue={editing?.chapter_number || ''} required />
                </Field>
                <Field label="Chapter name">
                  <input name="chapter_name" placeholder="Electric Charges and Fields" defaultValue={editing?.chapter_name || ''} required />
                </Field>
                <Field label="Display title" wide>
                  <input name="title" placeholder="Chapter 1 — Electric Charges" defaultValue={editing?.title || ''} required />
                </Field>
                <Field label="Description" hint="Optional" wide>
                  <textarea name="description" rows="3" defaultValue={editing?.description || ''} />
                </Field>
              </>
            ) : null}

            {activeForm === 'note' ? (
              <>
                <Field label="Chapter" hint="Note is chapter ke andar save hoga" wide>
                  <select name="chapter" required defaultValue={editing?.chapter || selectedChapterId || ''}>
                    <option value="" disabled>Select chapter</option>
                    {data.chapters.map((item) => {
                      const selectedSubject = subjectForChapter(item);
                      return (
                        <option key={item.uuid} value={item.uuid}>
                          {classForSubject(selectedSubject)?.class_name} → {selectedSubject?.subject_name} → Chapter {item.chapter_number}: {item.chapter_name}
                        </option>
                      );
                    })}
                  </select>
                </Field>
                <Field label="Card heading" hint="Student card ka title" wide>
                  <input
                    name="title"
                    placeholder="1. Electric Charge"
                    value={noteTitle}
                    onChange={(event) => setNoteTitle(event.target.value)}
                    required
                  />
                </Field>
                <RichNoteEditor
                  defaultValue={editing?.content || ''}
                  defaultBlocks={editing?.content_blocks || []}
                  onTitleDetected={setNoteTitle}
                />
              </>
            ) : null}
            </div>

            <div className="admin-form-actions">
              <button className="login-btn" type="button" disabled={saving} onClick={closeEditor}>Cancel</button>
              <button className="signup-btn" type="submit" disabled={saving}>
                {saving ? 'Saving...' : editing ? `Save ${formMeta.singular}` : `Add ${formMeta.singular}`}
              </button>
            </div>
          </form>
        </AdminEditor>
      </div>
    </main>
  );
}
