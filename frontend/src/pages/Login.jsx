import { useState } from "react";
import { apiPost } from "../lib/api";

export default function Login() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [err,setErr]=useState("");

  async function submit(e){
    e.preventDefault();
    setErr("");
    try {
      const { token, user } = await apiPost("/api/auth/login", { email, password });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      location.href = "/app";
    } catch {
      setErr("Invalid email or password");
    }
  }

  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl border border-slate-200 p-6 mt-10">
      <h2 className="text-lg font-semibold mb-2">Log in</h2>
      {err && <p className="text-red-600 mb-2">{err}</p>}
      <form onSubmit={submit} className="space-y-2">
        <input className="w-full rounded-lg border px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full rounded-lg border px-3 py-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full rounded-lg bg-blue-600 text-white py-2 hover:bg-blue-700">Log in</button>
      </form>
      <p className="text-sm text-slate-600 mt-3">New? <a href="/signup" className="text-blue-600 underline">Create an account</a></p>
    </div>
  );
}
