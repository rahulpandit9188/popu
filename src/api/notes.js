import { queryString, request } from './client.js';

export const notesApi = {
  notes: (params = {}, token) =>
    request(`/academics/notes/${queryString({ page_size: 100, ...params })}`, { token }),
  topicNotes: (uuid) => request(`/academics/topics/${uuid}/notes/${queryString({ page_size: 20 })}`),
  topicQuestions: (uuid) => request(`/academics/topics/${uuid}/practice-questions/`),
  search: (q) => request(`/academics/search/${queryString({ q })}`),
  formulas: (params = {}) => request(`/academics/formulas/${queryString(params)}`),
  practiceQuestions: (params = {}, token) =>
    request(`/academics/practice-questions/${queryString(params)}`, { token }),
  tests: (params = {}) => request(`/academics/tests/${queryString(params)}`),
  bookmarks: (token) => request('/academics/bookmarks/', { token }),
  saveBookmark: (data, token) => request('/academics/bookmarks/', { method: 'POST', body: data, token }),
  deleteBookmark: (uuid, token) => request(`/academics/bookmarks/${uuid}/`, { method: 'DELETE', token }),
  progress: (params, token) => request(`/academics/progress/${queryString(params)}`, { token }),
  updateProgress: (data, token) => request('/academics/progress/update/', { method: 'POST', body: data, token }),
  updateGoal: (data, token) => request('/academics/progress/goal/', { method: 'POST', body: data, token }),
  importContent: (data, token) => request('/academics/content/import/', { method: 'POST', body: data, token }),
  importQuestions: (body, token) => request('/academics/practice-questions/import/', { method: 'POST', body, token }),
  uploadImage: (body, token) => request('/academics/uploads/', { method: 'POST', body, token }),
  reorderBlocks: (uuid, blockIds, token) =>
    request(`/academics/notes/${uuid}/reorder/`, { method: 'PATCH', body: { block_ids: blockIds }, token }),
  createQuestion: (data, token) => request('/academics/practice-questions/', { method: 'POST', body: data, token }),
  updateQuestion: (uuid, data, token) =>
    request(`/academics/practice-questions/${uuid}/`, { method: 'PUT', body: data, token }),
  deleteQuestion: (uuid, token) =>
    request(`/academics/practice-questions/${uuid}/`, { method: 'DELETE', token }),
  createTest: (data, token) => request('/academics/tests/', { method: 'POST', body: data, token }),
  bulkCreateNotes: (items, token) =>
    request('/academics/notes/bulk/', { method: 'POST', body: items, token }),
  createNote: (data, token) =>
    request('/academics/notes/', { method: 'POST', body: data, token }),
  updateNote: (uuid, data, token) =>
    request(`/academics/notes/${uuid}/`, { method: 'PUT', body: data, token }),
  deleteNote: (uuid, token) =>
    request(`/academics/notes/${uuid}/`, { method: 'DELETE', token }),
};
