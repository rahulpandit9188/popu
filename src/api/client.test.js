import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { academicsApi } from './client.js';
import { readSession, SESSION_KEY } from './sessionStorage.js';

const reply = (payload, status = 200) => new Response(JSON.stringify(payload), { status });
const invalid = () => reply({ code: 'token_not_valid', detail: 'Given token not valid for any token type' }, 401);

beforeEach(() => {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  };
  globalThis.window = new EventTarget();
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email: 'staff@example.com', access: 'old', refresh: 'refresh' }));
});

test('renews expired token and retries the multipart edit with its image intact', async () => {
  const body = new FormData();
  body.set('title', 'Updated note');
  body.set('image', new Blob(['image bytes'], { type: 'image/png' }), 'image.png');
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, ...options });
    if (url.endsWith('/token/refresh/')) return reply({ access: 'new', refresh: 'rotated' });
    return options.headers.Authorization === 'Bearer old' ? invalid() : reply({ data: { title: body.get('title') } });
  };
  const result = await academicsApi.updateNote('note-id', body, 'old');
  assert.equal(result.data.title, 'Updated note');
  assert.equal(requests.length, 3);
  assert.equal(requests[0].body, body);
  assert.equal(requests[2].body, body);
  assert.equal(requests[2].headers.Authorization, 'Bearer new');
  assert.equal(requests[2].headers['Content-Type'], undefined);
  assert.equal(readSession().refresh, 'rotated');
  await academicsApi.updateNote('note-id', body, 'old');
  assert.equal(requests.length, 4);
  assert.equal(requests[3].headers.Authorization, 'Bearer new');
});

test('renews an expired JWT before sending a protected request', async () => {
  const expiredPayload = Buffer.from(JSON.stringify({ exp: 1 })).toString('base64url');
  const expiredAccess = `header.${expiredPayload}.signature`;
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    email: 'staff@example.com',
    access: expiredAccess,
    refresh: 'refresh',
  }));
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, ...options });
    if (url.endsWith('/token/refresh/')) return reply({ access: 'new' });
    return reply({ data: {} });
  };

  await academicsApi.updateNote('note-id', { title: 'Updated' }, expiredAccess);

  assert.equal(requests.length, 2);
  assert.match(requests[0].url, /token\/refresh/);
  assert.equal(requests[1].headers.Authorization, 'Bearer new');
});

test('concurrent expired requests share one refresh request', async () => {
  let refreshes = 0;
  globalThis.fetch = async (url, options) => {
    if (url.endsWith('/token/refresh/')) {
      refreshes += 1;
      return reply({ access: 'new' });
    }
    return options.headers.Authorization === 'Bearer old' ? invalid() : reply({ data: {} });
  };
  await Promise.all([
    academicsApi.updateChapter('chapter-id', { title: 'Chapter' }, 'old'),
    academicsApi.updateNote('note-id', { title: 'Note' }, 'old'),
  ]);
  assert.equal(refreshes, 1);
});

test('expired refresh reports login required without replaying the edit', async () => {
  let edits = 0;
  globalThis.fetch = async (url) => {
    if (url.endsWith('/token/refresh/')) return invalid();
    edits += 1;
    return invalid();
  };
  await assert.rejects(academicsApi.updateNote('id', {}, 'old'), /Please login again/);
  assert.equal(edits, 1);
});

test('retry is bounded even if the renewed token is rejected', async () => {
  let calls = 0;
  globalThis.fetch = async (url) => {
    calls += 1;
    return url.endsWith('/token/refresh/') ? reply({ access: 'new' }) : invalid();
  };
  await assert.rejects(academicsApi.updateNote('id', {}, 'old'), /Please login again/);
  assert.equal(calls, 3);
});

test('refresh finishing after logout cannot restore the session or retry the edit', async () => {
  let edits = 0;
  globalThis.fetch = async (url) => {
    if (url.endsWith('/token/refresh/')) {
      localStorage.removeItem(SESSION_KEY);
      return reply({ access: 'new' });
    }
    edits += 1;
    return invalid();
  };
  await assert.rejects(academicsApi.updateNote('id', {}, 'old'), /Session changed/);
  assert.equal(readSession(), null);
  assert.equal(edits, 1);
});

test('permission failures do not trigger token refresh', async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return reply({ message: 'Permission denied' }, 403);
  };
  await assert.rejects(academicsApi.updateNote('id', {}, 'old'), /Permission denied/);
  assert.equal(calls, 1);
});
