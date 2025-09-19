import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const workspaceRoles = [
  {
    title: "Finance",
    description: "Review intake for budget coverage, manage accruals, and steward approvals tied to spend policy.",
  },
  {
    title: "Approver",
    description: "Give fast, contextual decisions with a complete brief and clear audit trail of conditions.",
  },
  {
    title: "Buyer",
    description: "Coordinate sourcing tasks, vendor diligence, and stakeholder updates from one shared record.",
  },
  {
    title: "Requester",
    description: "Submit guided requests, attach business context, and follow progress without chasing updates.",
  },
];

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const res = await apiPost("/api/auth/signup", { email, password, role: "admin" });
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
      subtitle="You're creating the administrator account that will configure Procurement Manager for your organisation."
    >
      <>
        {err ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-600 shadow-sm">
            {err}
          </div>
        ) : null}
        <form onSubmit={submit} className="space-y-5">
          <div className="rounded-2xl border border-blue-200/80 bg-blue-50/80 px-4 py-4 text-sm text-blue-700">
            <p className="font-medium">This sign-up is for workspace admins.</p>
            <p className="mt-2 text-blue-800/80">
              Once inside, you can invite finance, approver, buyer, and requester teammates so they have the right access levels.
            </p>
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
        <div className="space-y-4 rounded-[28px] border border-slate-200/70 bg-white/70 px-5 py-6 text-sm text-slate-600 shadow-sm">
          <p className="text-slate-700">
            After you finish onboarding, use the Roles & Access section to add specialised teammates.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {workspaceRoles.map(({ title, description }) => (
              <div key={title} className="rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 py-3">
                <p className="text-sm font-semibold text-slate-700">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
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
