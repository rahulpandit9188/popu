import { queryString, request } from './client.js';

export const chaptersApi = {
  chapters: (params = {}, token) =>
    request(`/academics/chapters/${queryString({ page_size: 100, ...params })}`, { token }),
  bulkCreateChapters: (items, token) =>
    request('/academics/chapters/bulk/', { method: 'POST', body: items, token }),
  createChapter: (data, token) =>
    request('/academics/chapters/', { method: 'POST', body: data, token }),
  updateChapter: (uuid, data, token) =>
    request(`/academics/chapters/${uuid}/`, { method: 'PUT', body: data, token }),
  deleteChapter: (uuid, token) =>
    request(`/academics/chapters/${uuid}/`, { method: 'DELETE', token }),
  objectiveTest: (uuid) => request(`/academics/chapters/${uuid}/objective-test/`),
  submitObjectiveTest: (uuid, answers) =>
    request(`/academics/chapters/${uuid}/objective-test/`, { method: 'POST', body: { answers } }),
};
