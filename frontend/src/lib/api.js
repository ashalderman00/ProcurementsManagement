// frontend/src/lib/api.js
const API_BASE =
  import.meta.env.VITE_API_BASE && import.meta.env.VITE_API_BASE.trim() !== ""
    ? import.meta.env.VITE_API_BASE
    : ""; // dev: use Vite proxy

function authHeader() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { ...authHeader() } });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPatch(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiUpload(path, file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { ...authHeader() },
    body: fd
  });
  if (!res.ok) throw new Error(`UPLOAD ${path} failed: ${res.status}`);
  return res.json();
}
