import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, UserPlus } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { apiPost } from "../lib/api";

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

const supportTiles = [
  {
    icon: UserPlus,
    title: "Invite your team",
    description: "Admins add finance, approver, buyer, and requester roles from Workspace Settings.",
  },
  {
    icon: KeyRound,
    title: "Need a reset?",
    description: "Your workspace admin can trigger a password reset in seconds.",
  },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { token, user } = await apiPost("/api/auth/login", { email, password });
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/app", { replace: true });
    } catch {
      setErr("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to keep requests, vendors, and approvals moving."
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
              autoComplete="current-password"
              className={inputClass}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className={buttonClass}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div className="grid gap-3 sm:grid-cols-2">
          {supportTiles.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 rounded-xl bg-white p-2 text-blue-600 shadow-sm">
                  <Icon size={18} />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">{title}</p>
                  <p className="text-xs leading-relaxed text-slate-500">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-slate-500">
          New to Procurement Manager?{" "}
          <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-700">
            Create an account
          </Link>
        </p>
      </>
    </AuthLayout>
  );
}
