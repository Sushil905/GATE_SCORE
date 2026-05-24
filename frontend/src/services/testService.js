import { api, authHeaders } from './api.js';

export function getTest(id = 1) {
  return api(`/tests/${id}`);
}

export function submitMockTest(token, testId, answers, meta = {}) {
  return api('/tests/submit', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ testId, answers, ...meta })
  });
}

export function submitGeneratedMockTest(token, payload) {
  return api('/tests/generated/submit', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}
