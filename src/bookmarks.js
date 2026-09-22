const BOOKMARKS_KEY = 'studynotes-bookmarks';

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function bookmarkId(item) {
  return `${item.classTitle}|${item.subject}|${item.chapterTitle}`;
}

export function readBookmarks(email) {
  if (!email) return [];
  return readAll()[email] || [];
}

export function isBookmarked(bookmarks, item) {
  const id = item.id || bookmarkId(item);
  return bookmarks.some((entry) => entry.id === id);
}

export function toggleBookmark(email, item) {
  const all = readAll();
  const current = all[email] || [];
  const id = bookmarkId(item);
  const exists = current.some((entry) => entry.id === id);
  const next = exists
    ? current.filter((entry) => entry.id !== id)
    : [{ ...item, id, savedAt: Date.now() }, ...current];
  all[email] = next;
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(all));
  return { bookmarks: next, added: !exists };
}
