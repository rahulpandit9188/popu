import { useEffect, useState } from 'react';
import { classPages } from '../data';
import {
  buildNotes,
  chapterDescription,
  chapterMeta,
  chapterTitle,
  classLabel,
  subjectDescription,
  subjectLabel,
  tUI,
} from '../mediumText';

export default function ClassPage({
  classData,
  onBack,
  onDownload,
  bookmarks = [],
  onToggleBookmark,
  initialSubject,
  initialChapter,
  medium = 'English',
}) {
  const page = classData || classPages['Class 9'];
  const subjects = page.subjects || [];
  const text = tUI(medium);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || subjects[0]?.name || null);
  const [openChapter, setOpenChapter] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const subject = subjects.find((item) => item.name === selectedSubject) || subjects[0];
  const notes = subject && openChapter ? buildNotes(page, subject, openChapter, medium) : null;

  useEffect(() => {
    const nextSubject = initialSubject || subjects[0]?.name || null;
    setSelectedSubject(nextSubject);
    const currentSubject = subjects.find((item) => item.name === nextSubject);
    const chapter = initialChapter
      ? currentSubject?.chapters.find((item) => item.title === initialChapter)
      : null;
    setOpenChapter(chapter || null);
  }, [page.title, initialSubject, initialChapter]);

  const openSubject = (name) => {
    setSelectedSubject(name);
    setOpenChapter(null);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const readChapter = (chapter) => {
    setOpenChapter(chapter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const bookmarkItem = (chapter) => ({
    classTitle: page.title,
    subject: subject.name,
    chapterTitle: chapter.title,
    meta: chapter.meta,
    description: chapter.description,
  });

  const saved = (chapter) =>
    bookmarks.some(
      (item) =>
        item.classTitle === page.title &&
        item.subject === subject.name &&
        item.chapterTitle === chapter.title
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
            <h1 className="class-page-title">{classLabel(page.title, medium)}</h1>
            <p className="class-page-eyebrow">{medium === 'Hindi' ? 'हिन्दी माध्यम' : 'English Medium'}</p>
          </div>

          <h2 className="class-sidebar-label">{text.subjects}</h2>
          <nav className="class-sidebar-nav" aria-label="Class subjects">
            {subjects.map((item) => (
              <button
                key={item.name}
                type="button"
                className={`class-sidebar-item${item.name === selectedSubject ? ' active' : ''}`}
                onClick={() => openSubject(item.name)}
              >
                <span className="class-sidebar-icon">
                  <i className={item.icon}></i>
                </span>
                <span className="class-sidebar-item-text">
                  <span className="class-sidebar-item-name">{subjectLabel(item.name, medium)}</span>
                  <span className="class-sidebar-item-count">{text.chaptersCount(item.chapters.length)}</span>
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

          {subject && openChapter && notes ? (
            <article className="notes-reader">
              <button
                className="class-page-back"
                type="button"
                onClick={() => setOpenChapter(null)}
              >
                <i className="fas fa-arrow-left"></i>
                {text.backChapters}
              </button>

              <div className="notes-reader-top">
                <div className="note-badge">
                  {classLabel(page.title, medium)} • {subjectLabel(subject.name, medium)} •{' '}
                  {chapterMeta(openChapter, medium)}
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
              <h2 className="notes-reader-title">{chapterTitle(openChapter, medium)}</h2>
              <p className="notes-reader-intro">{notes.intro}</p>

              <section className="notes-reader-section">
                <h3>{text.keyPoints}</h3>
                <ul>
                  {notes.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </section>

              <section className="notes-reader-section">
                <h3>{text.remember}</h3>
                <ul>
                  {notes.remember.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </section>

              <section className="notes-reader-section">
                <h3>{text.questions}</h3>
                <ol>
                  {notes.questions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ol>
              </section>

              <p className="notes-reader-note">{text.sampleNote}</p>
            </article>
          ) : subject ? (
            <>
              <div className="class-main-header">
                <div className="class-subject-icon">
                  <i className={subject.icon}></i>
                </div>
                <div>
                  <p className="class-page-eyebrow">{classLabel(page.title, medium)}</p>
                  <h2 className="class-main-title">{subjectLabel(subject.name, medium)}</h2>
                  <p className="class-page-subtitle">{subjectDescription(subject, medium)}</p>
                </div>
              </div>

              <div className="notes-grid">
                {subject.chapters.map((chapter) => (
                  <div className="note-card" key={chapter.title}>
                    <div className="note-header">
                      <div className="note-header-top">
                        <div className="note-badge">
                          {classLabel(page.title, medium)} • {subjectLabel(subject.name, medium)}
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
                      <h3 className="note-title">{chapterTitle(chapter, medium)}</h3>
                      <p className="note-meta">{chapterMeta(chapter, medium)}</p>
                    </div>
                    <div className="note-body">
                      <p className="note-description">{chapterDescription(chapter, medium)}</p>
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
                          onClick={() => onDownload(chapter.title)}
                        >
                          <i className="fas fa-file-pdf"></i> PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="class-page-subtitle">{text.selectSubject}</p>
          )}
        </section>
      </div>
    </main>
  );
}
