import { useEffect, useState } from 'react';
import { academicsApi } from '../api/client';
import { classLabel, subjectLabel, tUI } from '../mediumText';
import NoteBlocksRenderer from './NoteBlocksRenderer';

const iconForSubject = (name = '') => {
  const value = name.toLowerCase();
  if (value.includes('math')) return 'fas fa-calculator';
  if (value.includes('physics')) return 'fas fa-atom';
  if (value.includes('chem')) return 'fas fa-flask';
  if (value.includes('bio')) return 'fas fa-dna';
  if (value.includes('computer')) return 'fas fa-laptop-code';
  return 'fas fa-book-open';
};

async function fetchAll(fetchPage, params) {
  const first = await fetchPage({ ...params, page: 1 });
  const notes = [...(first.data || [])];
  const totalPages = first.pagination?.total_pages || 1;

  for (let page = 2; page <= totalPages; page += 1) {
    const next = await fetchPage({ ...params, page });
    notes.push(...(next.data || []));
  }

  return notes;
}

export default function ApiClassPage({
  classData,
  onBack,
  onDownload,
  bookmarks = [],
  onToggleBookmark,
  initialSubject,
  initialChapter,
  medium = 'English',
}) {
  const text = tUI(medium);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectUuid, setSelectedSubjectUuid] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [subjectNotes, setSubjectNotes] = useState([]);
  const [openChapter, setOpenChapter] = useState(null);
  const [notes, setNotes] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const classTitle = classData.class_name || classData.title;
  const subject = subjects.find((item) => item.uuid === selectedSubjectUuid);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    fetchAll(academicsApi.subjects, { school_class: classData.uuid })
      .then((items) => {
        if (!active) return;
        setSubjects(items);
        const initial = items.find((item) => item.subject_name === initialSubject);
        setSelectedSubjectUuid(initial?.uuid || items[0]?.uuid || null);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [classData.uuid, initialSubject]);

  useEffect(() => {
    if (!selectedSubjectUuid) {
      setChapters([]);
      return undefined;
    }

    let active = true;
    setLoading(true);
    setError('');
    setOpenChapter(null);
    setNotes([]);
    setChapters([]);
    setSubjectNotes([]);

    Promise.all([
      fetchAll(academicsApi.chapters, { subject: selectedSubjectUuid, ordering: 'chapter_number' }),
      fetchAll(academicsApi.notes, { subject: selectedSubjectUuid, ordering: 'created_at' }),
    ])
      .then(([items, allNotes]) => {
        if (!active) return;
        setChapters(items);
        setSubjectNotes(allNotes);
        const initial = items.find(
          (item) => item.title === initialChapter || item.chapter_name === initialChapter,
        );
        if (initial) {
          setOpenChapter(initial);
          setNotes(allNotes.filter((note) => note.chapter === initial.uuid));
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedSubjectUuid, initialChapter]);

  const openSubject = (subjectUuid) => {
    setSelectedSubjectUuid(subjectUuid);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const readChapter = (chapter) => {
    setOpenChapter(chapter);
    setNotes(subjectNotes.filter((item) => item.chapter === chapter.uuid));
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const bookmarkItem = (chapter) => ({
    classTitle,
    subject: subject?.subject_name,
    chapterTitle: chapter.title || chapter.chapter_name,
    meta: `Chapter ${chapter.chapter_number}`,
    description: chapter.description,
  });

  const saved = (chapter) =>
    bookmarks.some(
      (item) =>
        item.classTitle === classTitle &&
        item.subject === subject?.subject_name &&
        item.chapterTitle === (chapter.title || chapter.chapter_name),
    );

  return (
    <main className="class-page">
      <div className="class-page-layout">
        <aside className={`class-sidebar${sidebarOpen ? ' open' : ''}`}>
          <button className="class-page-back" type="button" onClick={onBack}>
            <i className="fas fa-arrow-left"></i>
            {text.backHome}
          </button>

          <div className="class-sidebar-header">
            <h1 className="class-page-title">{classLabel(classTitle, medium)}</h1>
            <p className="class-page-eyebrow">{classData.medium || medium} Medium</p>
          </div>

          <h2 className="class-sidebar-label">{text.subjects}</h2>
          <nav className="class-sidebar-nav" aria-label="Class subjects">
            {subjects.map((item) => (
              <button
                key={item.uuid}
                type="button"
                className={`class-sidebar-item${item.uuid === selectedSubjectUuid ? ' active' : ''}`}
                onClick={() => openSubject(item.uuid)}
              >
                <span className="class-sidebar-icon">
                  <i className={iconForSubject(item.subject_name)}></i>
                </span>
                <span className="class-sidebar-item-text">
                  <span className="class-sidebar-item-name">
                    {subjectLabel(item.subject_name, medium)}
                  </span>
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {sidebarOpen ? (
          <button
            className="class-sidebar-backdrop"
            type="button"
            aria-label="Close subjects"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <section className="class-page-main">
          <button
            className="class-sidebar-toggle"
            type="button"
            onClick={() => setSidebarOpen(true)}
          >
            <i className="fas fa-bars"></i>
            {text.subjects}
          </button>

          {error ? <p className="auth-error">{error}</p> : null}
          {loading ? <p className="class-page-subtitle">Loading...</p> : null}

          {subject && openChapter ? (
            <article className="notes-reader notes-html-theme">
              <button
                className="class-page-back"
                type="button"
                onClick={() => {
                  setOpenChapter(null);
                  setNotes([]);
                }}
              >
                <i className="fas fa-arrow-left"></i>
                {text.backChapters}
              </button>

              <header className="note-html-header">
                <div className="notes-reader-top">
                  <div className="note-badge">
                    {classLabel(classTitle, medium)} •{' '}
                    {subjectLabel(subject.subject_name, medium)} • Chapter{' '}
                    {openChapter.chapter_number}
                  </div>
                  <button
                    className={`bookmark-btn${saved(openChapter) ? ' active' : ''}`}
                    type="button"
                    onClick={() => onToggleBookmark?.(bookmarkItem(openChapter))}
                  >
                    <i className={`${saved(openChapter) ? 'fas' : 'far'} fa-bookmark`}></i>
                    {saved(openChapter) ? text.saved : text.bookmark}
                  </button>
                </div>
                <h1>{openChapter.title || openChapter.chapter_name}</h1>
              </header>

              {!loading && notes.length === 0 ? (
                <p className="class-page-subtitle">Notes are not available yet.</p>
              ) : null}

              {notes.map((note) => (
                <article className="note-html-card" key={note.uuid}>
                  <h2>{note.title}</h2>
                  <NoteBlocksRenderer
                    blocks={note.content_blocks}
                    fallbackHtml={note.content}
                  />
                </article>
              ))}
            </article>
          ) : subject ? (
            <>
              <div className="class-main-header">
                <div className="class-subject-icon">
                  <i className={iconForSubject(subject.subject_name)}></i>
                </div>
                <div>
                  <p className="class-page-eyebrow">{classLabel(classTitle, medium)}</p>
                  <h2 className="class-main-title">
                    {subjectLabel(subject.subject_name, medium)}
                  </h2>
                  <p className="class-page-subtitle">{subject.description}</p>
                </div>
              </div>

              <div className="notes-grid">
                {chapters.map((chapter) => (
                  <div className="note-card" key={chapter.uuid}>
                    <div className="note-header">
                      <div className="note-header-top">
                        <div className="note-badge">
                          {classLabel(classTitle, medium)} •{' '}
                          {subjectLabel(subject.subject_name, medium)}
                        </div>
                        <button
                          className={`bookmark-icon${saved(chapter) ? ' active' : ''}`}
                          type="button"
                          aria-label={saved(chapter) ? text.remove : text.bookmark}
                          onClick={() => onToggleBookmark?.(bookmarkItem(chapter))}
                        >
                          <i className={`${saved(chapter) ? 'fas' : 'far'} fa-bookmark`}></i>
                        </button>
                      </div>
                      <h3 className="note-title">{chapter.title || chapter.chapter_name}</h3>
                      <p className="note-meta">Chapter {chapter.chapter_number} · {chapter.chapter_name}</p>
                    </div>
                    <div className="note-body">
                      <p className="note-description">{chapter.description}</p>
                      <div className="note-actions">
                        <button
                          className="note-btn note-btn-primary"
                          type="button"
                          onClick={() => readChapter(chapter)}
                        >
                          {text.readNotes}
                        </button>
                        <button
                          className="note-btn note-btn-secondary"
                          type="button"
                          onClick={() => onDownload(chapter.title || chapter.chapter_name)}
                        >
                          <i className="fas fa-file-pdf"></i> PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : !loading ? (
            <p className="class-page-subtitle">No subjects are available for this class.</p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
