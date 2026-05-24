import { api } from './api.js';

export function loginUser(payload) {
  return api('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
}

export function registerUser(payload) {
  return api('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
}
