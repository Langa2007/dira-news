const DEPLOYED_BACKEND_URL = 'https://dira-news.onrender.com';

function cleanBaseUrl(value) {
  return String(value || '').trim().replace(/\/$/, '');
}

function apiBaseUrl() {
  const explicitApiUrl = cleanBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

  if (explicitApiUrl) {
    return explicitApiUrl;
  }

  const backendUrl = cleanBaseUrl(process.env.NEXT_PUBLIC_BACKEND_URL) || DEPLOYED_BACKEND_URL || 'http://localhost:4000';
  return `${backendUrl}/api`;
}

function socketBaseUrl() {
  return cleanBaseUrl(process.env.NEXT_PUBLIC_SOCKET_URL) || cleanBaseUrl(process.env.NEXT_PUBLIC_BACKEND_URL) || DEPLOYED_BACKEND_URL || '';
}

const API_BASE_URL = apiBaseUrl();
const SOCKET_BASE_URL = socketBaseUrl();

export { API_BASE_URL, SOCKET_BASE_URL };
