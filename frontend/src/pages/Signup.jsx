import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../lib/auth";

const inputClass =
  "w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200/50";
const labelClass = "text-sm font-medium text-slate-600";
const buttonClass = [
  "w-full",
  "rounded-2xl",
  "bg-gradient-to-r",
  "from-blue-600",
  "via-indigo-500",
  "to-blue-600",
  "py-3",
  "text-sm",
  "font-semibold",
  "text-white",
  "shadow-lg",
  "shadow-blue-500/25",
  "transition",
  "hover:from-blue-600",
  "hover:to-indigo-600",
  "focus:outline-none",
  "focus:ring-4",
  "focus:ring-blue-300/40",
  "disabled:cursor-not-allowed",
  "disabled:opacity-80",
].join(" ");

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup: register } = useAuth();

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
      await register(email, password, "admin");
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
    <AuthLayout title="Create account">
      <>
        {err ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-600 shadow-sm">
            {err}
          </div>
        ) : null}
        <form onSubmit={submit} className="space-y-6">
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
          <button type="submit" disabled={loading} className={buttonClass}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
            Log in
          </Link>
        </p>
      </>
    </AuthLayout>
  );
}
