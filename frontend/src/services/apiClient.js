// Use relative URLs in development so requests go through the Vite proxy,
// which avoids CORS issues. In production, set VITE_API_URL to the full URL.
const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

// API_HOST is used for file download URLs (e.g., /uploads/file.pdf)
// In dev, use relative path so Vite proxies it; in production, point to the backend.
const API_HOST = (
  import.meta.env.VITE_API_HOST ||
  (API_URL.startsWith('http') ? API_URL.replace(/\/api$/, '') : '')
).replace(/\/+$/, '');

const toUrl = (path = '') => `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;

const request = async (path, { method = 'GET', data, token, isFormData, signal } = {}) => {
  const headers = {};
  let body = undefined;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (isFormData) {
    body = data;
  } else if (typeof data !== 'undefined') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(data);
  }

  const response = await fetch(toUrl(path), {
    method,
    headers,
    body,
    credentials: 'include',
    signal,
  });

  const text = await response.text();
  let json = {};
  if (text) {
    try {
      json = JSON.parse(text);
    } catch (error) {
      throw new Error('Received malformed JSON from server');
    }
  }

  if (!response.ok) {
    const message = json?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.details = json?.details;
    throw error;
  }

  return json;
};

const apiClient = {
  get: (path, options = {}) => request(path, { ...options, method: 'GET' }),
  post: (path, data, options = {}) =>
    request(path, { ...options, method: 'POST', data, isFormData: options.isFormData }),
  patch: (path, data, options = {}) => request(path, { ...options, method: 'PATCH', data }),
  del: (path, options = {}) => request(path, { ...options, method: 'DELETE' }),
};

export { apiClient, API_URL, API_HOST };
