import { api, authHeaders } from './api.js';

export function getResources() {
  return api('/resources');
}

export function addResource(token, payload) {
  return api('/resources/add', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}
