import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { apiPost } from "../lib/api";

const inputClass =
  "w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20";
const labelClass = "text-sm font-medium text-slate-600";
const selectClass =
  "w-full appearance-none rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20";
const buttonClass =
  "w-full rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 py-3 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-80";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("requester");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (!email.includes("@")) {
      setErr("Enter a valid work email.");
      return;
    }
    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiPost("/api/auth/signup", { email, password, role });
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      navigate("/app", { replace: true });
    } catch (e) {
      const msg = String(e.message || "").includes("409")
        ? "That email is already registered."
        : "Sign up failed. Please try again.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your workspace"
      subtitle="Spin up Procurement Manager for your team in minutes. Invite approvers and start accepting requests right away."
    >
      <>
        {err ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-600 shadow-sm">
            {err}
          </div>
        ) : null}
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className={labelClass}>
              Work email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className={inputClass}
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              className={inputClass}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="role" className={labelClass}>
              Default role
            </label>
            <div className="relative">
              <select
                id="role"
                className={`${selectClass} pr-10`}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="requester">Requester — submit purchase requests</option>
                <option value="approver">Approver — review and approve spend</option>
                <option value="admin">Admin — configure policies and vendors</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">▾</span>
            </div>
          </div>
          <button type="submit" disabled={loading} className={buttonClass}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500">
          Already using Procurement Manager?{" "}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
            Log in
          </Link>
        </p>
      </>
    </AuthLayout>
  );
}
