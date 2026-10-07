export { resolveApiUrl, request, queryString } from './client.js';
export { authApi } from './auth.js';
export { subjectsApi } from './subjects.js';
export { chaptersApi } from './chapters.js';
export { notesApi } from './notes.js';

import { subjectsApi } from './subjects.js';
import { chaptersApi } from './chapters.js';
import { notesApi } from './notes.js';

/** Combined academics surface for existing callers. */
export const academicsApi = {
  ...subjectsApi,
  ...chaptersApi,
  ...notesApi,
};
