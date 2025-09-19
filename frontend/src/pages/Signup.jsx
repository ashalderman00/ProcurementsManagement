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

const workspaceRoles = [
  {
    title: "Finance",
    badge: "💼",
    description: "Keep budgets, accruals, and approvals aligned.",
  },
  {
    title: "Approver",
    badge: "✅",
    description: "Review context-rich requests and sign off fast.",
  },
  {
    title: "Buyer",
    badge: "🛍️",
    description: "Coordinate sourcing and vendor onboarding in one place.",
  },
  {
    title: "Requester",
    badge: "✉️",
    description: "Submit needs with guided intake and live status checks.",
  },
];

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
    <AuthLayout
      title="Create your workspace"
      subtitle="You're creating the admin workspace owner account. Invite your team after setup."
    >
      <>
        {err ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-600 shadow-sm">
            {err}
          </div>
        ) : null}
        <form onSubmit={submit} className="space-y-6">
          <div className="flex items-start gap-3 rounded-2xl border border-blue-200/80 bg-blue-50/80 p-4 text-sm text-blue-800">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-lg shadow-sm">⭐</span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-blue-900">Administrator sign-up</p>
              <p className="text-xs leading-relaxed text-blue-700/80">
                You'll invite finance, approver, buyer, and requester teammates once you're inside the workspace.
              </p>
            </div>
          </div>
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
        <section className="space-y-4 rounded-[28px] border border-slate-200/70 bg-white/80 px-5 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Roles you'll add next</p>
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Workspace</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {workspaceRoles.map(({ title, description, badge }) => (
              <div
                key={title}
                className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-lg shadow-sm">{badge}</span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">{title}</p>
                  <p className="text-xs leading-relaxed text-slate-500">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
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
