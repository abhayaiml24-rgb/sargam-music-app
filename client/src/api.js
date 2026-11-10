const BASE = import.meta.env.VITE_API_URL || '/api';

export const getToken = () => localStorage.getItem('sargam_token');
export const setToken = (t) => (t ? localStorage.setItem('sargam_token', t) : localStorage.removeItem('sargam_token'));

async function request(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error("Can't reach the server. Check your connection and try again.");
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body: body ?? {} }),
  put: (p) => request(p, { method: 'PUT' }),
  patch: (p, body) => request(p, { method: 'PATCH', body }),
  del: (p) => request(p, { method: 'DELETE' }),
};
