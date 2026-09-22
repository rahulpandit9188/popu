import { chapterMeta, chapterTitle, classLabel, subjectLabel, tUI } from '../mediumText';

export default function BookmarksPage({
  bookmarks = [],
  onBack,
  onOpenBookmark,
  onToggleBookmark,
  medium = 'English',
}) {
  const text = tUI(medium);

  return (
    <main className="profile-page">
      <div className="profile-card">
        <button className="class-page-back" type="button" onClick={onBack}>
          <i className="fas fa-arrow-left"></i>
          {text.backHome}
        </button>

        <div className="bookmark-list-header">
          <h1 className="profile-name">{text.bookmarks}</h1>
          <span>{text.savedCount(bookmarks.length)}</span>
        </div>

        {bookmarks.length ? (
          <div className="bookmark-items">
            {bookmarks.map((item) => (
              <div className="bookmark-item" key={item.id}>
                <div>
                  <p className="bookmark-meta">
                    {classLabel(item.classTitle, medium)} • {subjectLabel(item.subject, medium)}
                  </p>
                  <h3>{chapterTitle({ title: item.chapterTitle }, medium)}</h3>
                  <p>{chapterMeta({ meta: item.meta }, medium)}</p>
                </div>
                <div className="bookmark-item-actions">
                  <button className="note-btn note-btn-primary" type="button" onClick={() => onOpenBookmark(item)}>
                    {text.open}
                  </button>
                  <button className="note-btn note-btn-secondary" type="button" onClick={() => onToggleBookmark(item)}>
                    {text.remove}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="bookmark-empty">{text.emptyBookmarks}</p>
        )}
      </div>
    </main>
  );
}
