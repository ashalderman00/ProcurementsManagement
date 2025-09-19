import { useState } from "react";
import { apiPost } from "../lib/api";

export default function Signup() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [role,setRole]=useState("requester");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  async function submit(e){
    e.preventDefault();
    setErr("");
    if (!email.includes("@")) return setErr("Enter a valid email.");
    if (password.length < 6) return setErr("Password must be at least 6 characters.");
    setLoading(true);
    try {
      const res = await apiPost("/api/auth/signup", { email, password, role });
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      location.href = "/app";
    } catch (e) {
      const msg = String(e.message||"").includes("409") ? "Email already in use." : "Sign up failed. Try again.";
      setErr(msg);
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl border border-slate-200 p-6 mt-10">
      <h2 className="text-lg font-semibold mb-2">Create account</h2>
      {err && <p className="text-red-600 mb-2">{err}</p>}
      <form onSubmit={submit} className="space-y-2">
        <input className="w-full rounded-lg border px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full rounded-lg border px-3 py-2" placeholder="Password (min 6)" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <select className="w-full rounded-lg border px-3 py-2" value={role} onChange={e=>setRole(e.target.value)}>
          <option value="requester">Requester</option>
          <option value="approver">Approver</option>
          <option value="admin">Admin</option>
        </select>
        <button disabled={loading} className="w-full rounded-lg bg-blue-600 text-white py-2 hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
      <p className="text-sm text-slate-600 mt-3">Have an account? <a href="/login" className="text-blue-600 underline">Log in</a></p>
    </div>
  );
}
