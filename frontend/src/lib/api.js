// frontend/src/lib/api.js

// Use VITE_API_BASE in prod, empty in dev (Vite proxy)
const RAW_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE && import.meta.env.VITE_API_BASE.trim()) || "";

// Safe join: handles trailing/leading slashes and avoids double /api/api
function splitSegments(value) {
  return String(value || '')
    .split('/')
    .filter(Boolean);
}

function dropOverlap(baseSegments, pathSegments) {
  if (!baseSegments.length || !pathSegments.length) return pathSegments;
  const extras = [...pathSegments];
  const maxOverlap = Math.min(baseSegments.length, extras.length);
  for (let overlap = maxOverlap; overlap > 0; overlap -= 1) {
    const baseSlice = baseSegments.slice(baseSegments.length - overlap);
    const pathSlice = extras.slice(0, overlap);
    const matches = baseSlice.every((segment, idx) => segment === pathSlice[idx]);
    if (matches) {
      return extras.slice(overlap);
    }
  }
  return extras;
}

function join(base, path) {
  const rawBase = String(base ?? '').trim();
  if (!rawBase) return String(path ?? ''); // dev: use relative to Vite proxy
  const rawPath = String(path ?? '');

  const normalizedBase = rawBase.replace(/\/+$/, '');
  const normalizedPath = rawPath.trim().replace(/^\/+/, '');

  if (!normalizedPath) {
    if (normalizedBase) return normalizedBase;
    return rawBase.startsWith('/') ? '/' : '';
  }

  const pathSegments = splitSegments(normalizedPath);

  try {
    const baseUrl = new URL(normalizedBase);
    const baseSegments = splitSegments(baseUrl.pathname);
    const extras = dropOverlap(baseSegments, pathSegments);
    const combined = [...baseSegments, ...extras].join('/');
    const suffix = combined ? `/${combined}` : '';
    return `${baseUrl.origin}${suffix}`;
  } catch {
    const baseSegments = splitSegments(normalizedBase);
    const extras = dropOverlap(baseSegments, pathSegments);
    const combinedSegments = [...baseSegments, ...extras];
    const joined = combinedSegments.join('/');
    if (!joined) {
      return rawBase.startsWith('/') ? '/' : normalizedBase;
    }
    const leading = rawBase.startsWith('/') ? '/' : '';
    return leading ? `${leading}${joined}` : joined;
  }
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
