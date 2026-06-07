const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:4000/api'
    : 'https://dira-news.onrender.com/api');

async function parseResponse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.error?.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export async function adminRequest(path, options = {}) {
  const headers = {
    ...(options.body ? { 'content-type': 'application/json' } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    credentials: 'include',
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
