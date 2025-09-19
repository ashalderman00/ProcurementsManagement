// frontend/src/lib/api.js

// Use VITE_API_BASE in prod, empty in dev (Vite proxy)
const RAW_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE && import.meta.env.VITE_API_BASE.trim()) || "";

// Safe join: handles trailing/leading slashes and avoids double /api/api
function join(base, path) {
  if (!base) return path; // dev: use relative to Vite proxy
  const b = base.replace(/\/+$/,'');
  const p = String(path || '').replace(/^\/+/, '');
  return `${b}/${p}`;
}

function authHeader() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function parseOrText(res) {
  const txt = await res.text().catch(()=> '');
  try { return JSON.parse(txt); } catch { return { _raw: txt }; }
}

export async function apiGet(path) {
  const url = join(RAW_BASE, path);
  const res = await fetch(url, { headers: { ...authHeader() } });
  if (!res.ok) throw new Error(`GET ${url} ${res.status} ${res.statusText} :: ${JSON.stringify(await parseOrText(res))}`);
  return res.json();
}

export async function apiPost(path, body) {
  const url = join(RAW_BASE, path);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${url} ${res.status} ${res.statusText} :: ${JSON.stringify(await parseOrText(res))}`);
  return res.json();
}

export async function apiPatch(path, body) {
  const url = join(RAW_BASE, path);
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${url} ${res.status} ${res.statusText} :: ${JSON.stringify(await parseOrText(res))}`);
  return res.json();
}

export async function apiUpload(path, file) {
  const url = join(RAW_BASE, path);
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(url, {
    method: "POST",
    headers: { ...authHeader() },
    body: fd
  });
  if (!res.ok) throw new Error(`UPLOAD ${url} ${res.status} ${res.statusText} :: ${JSON.stringify(await parseOrText(res))}`);
  return res.json();
}

export async function apiDelete(path) {
  const url = join(RAW_BASE, path);
  const res = await fetch(url, {
    method: "DELETE",
    headers: { ...authHeader() },
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(
      `DELETE ${url} ${res.status} ${res.statusText} :: ${JSON.stringify(await parseOrText(res))}`
    );
  }
  if (res.status === 204) return null;
  const text = await res.text().catch(() => '');
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { _raw: text };
  }
}
