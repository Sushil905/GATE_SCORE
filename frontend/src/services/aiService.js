import { api, authHeaders } from './api.js';

export function askDoubt(token, payload) {
  return api('/ai/chat', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(typeof payload === 'string' ? { question: payload } : payload)
  });
}

export function createStudyPlan(token, payload) {
  return api('/ai/study-plan', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}

export function createPracticeQuestions(token, payload) {
  return api('/ai/generate-questions', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}

export function getAiResourceRecommendations(token, weakSubjects) {
  return api('/ai/recommend', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ weakSubjects })
  });
}
