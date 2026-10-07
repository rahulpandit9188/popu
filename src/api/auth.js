import { request } from './client.js';

export const authApi = {
  register: (data) =>
    request('/authentication/register/', { method: 'POST', body: data }),
  login: (data) =>
    request('/authentication/login/', { method: 'POST', body: data }),
  logout: (refresh) =>
    request('/authentication/logout/', {
      method: 'POST',
      body: { refresh },
    }),
};
