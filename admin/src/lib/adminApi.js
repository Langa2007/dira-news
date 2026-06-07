const API_BASE_URL = 'https://dira-news.onrender.com/api';

async function parseResponse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.error?.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export async function adminRequest(path, options = {}) {
  const token = options.token || (typeof window !== 'undefined' ? window.localStorage.getItem('dira-access-token') : null);
  const headers = {
    ...(options.body ? { 'content-type': 'application/json' } : {}),
    ...(token ? { authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  return parseResponse(response);
}

export async function adminLogin({ email, password }) {
  return adminRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
    token: null
  });
}

export { API_BASE_URL };
