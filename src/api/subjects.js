import { queryString, request } from './client.js';

export const subjectsApi = {
  classes: (params = {}, token) =>
    request(`/academics/classes/${queryString({ page_size: 100, ...params })}`, { token }),
  subjects: (params = {}, token) =>
    request(`/academics/subjects/${queryString({ page_size: 100, ...params })}`, { token }),
  classSubjects: (uuid) => request(`/academics/classes/${uuid}/subjects/`),
  subjectOutline: (uuid) => request(`/academics/subjects/${uuid}/outline/`),
  bulkCreateClasses: (items, token) =>
    request('/academics/classes/bulk/', { method: 'POST', body: items, token }),
  bulkCreateSubjects: (items, token) =>
    request('/academics/subjects/bulk/', { method: 'POST', body: items, token }),
  createClass: (data, token) =>
    request('/academics/classes/', { method: 'POST', body: data, token }),
  createSubject: (data, token) =>
    request('/academics/subjects/', { method: 'POST', body: data, token }),
  updateClass: (uuid, data, token) =>
    request(`/academics/classes/${uuid}/`, { method: 'PUT', body: data, token }),
  updateSubject: (uuid, data, token) =>
    request(`/academics/subjects/${uuid}/`, { method: 'PUT', body: data, token }),
  deleteClass: (uuid, token) =>
    request(`/academics/classes/${uuid}/`, { method: 'DELETE', token }),
  deleteSubject: (uuid, token) =>
    request(`/academics/subjects/${uuid}/`, { method: 'DELETE', token }),
};
