import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

const defaultHero = {
  eyebrow: "Procurement OS",
  heading: "Keep purchasing flowing without friction",
  description:
    "Procurement Manager centralizes intake, approvals, and vendor data so teams can move faster with confidence.",
  highlights: [
    {
      icon: CheckCircle2,
      title: "Track every request",
      description: "Live status updates keep stakeholders aligned and accountable.",
    },
    {
      icon: ShieldCheck,
      title: "Stay in policy",
      description: "Guardrails for onboarding, budgets, and approvals keep spend compliant.",
    },
    {
      icon: Sparkles,
      title: "Automate the busywork",
      description: "Guided forms and automation eliminate back-and-forth with requesters.",
    },
  ],
};

export default function AuthLayout({ title, subtitle, children, hero = defaultHero }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-16 h-[420px] w-[420px] rounded-full bg-blue-500/30 blur-3xl" />
        <div className="absolute -bottom-24 left-1/2 h-[540px] w-[540px] -translate-x-1/2 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -right-24 top-16 h-[400px] w-[400px] rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.1),_transparent_55%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <aside className="hidden w-full max-w-[460px] flex-col justify-between px-14 py-16 lg:flex xl:max-w-[520px] xl:px-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[11px] font-medium uppercase tracking-[0.35em] text-slate-200/80">
              {hero.eyebrow}
            </div>
            <h2 className="mt-8 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              {hero.heading}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-slate-200/80">{hero.description}</p>
            {hero.highlights?.length ? (
              <ul className="mt-12 space-y-6">
                {hero.highlights.map(({ icon: Icon, title: highlightTitle, description }, index) => (
                  <li key={highlightTitle ?? index} className="flex items-start gap-4">
                    <span className="mt-0.5 rounded-2xl bg-white/10 p-2 text-sky-200">
                      <Icon size={18} />
                    </span>
                    <div className="space-y-1">
                      <h3 className="text-base font-medium text-slate-50">{highlightTitle}</h3>
                      <p className="text-sm leading-relaxed text-slate-200/70">{description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="mt-20 space-y-3 text-xs uppercase tracking-[0.3em] text-slate-300/70">
            <span>Trusted by modern operations teams</span>
            <div className="flex flex-wrap gap-3 text-[0.8rem] tracking-normal text-slate-200/80">
              <span className="rounded-full border border-white/15 px-3 py-1">Northwind Ops</span>
              <span className="rounded-full border border-white/15 px-3 py-1">Acme Supply</span>
              <span className="rounded-full border border-white/15 px-3 py-1">Evergreen Labs</span>
            </div>
          </div>
        </aside>

        <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-8">
          <div className="w-full max-w-md">
            <div className="rounded-[32px] border border-white/20 bg-white/95 p-10 text-slate-900 shadow-[0_40px_140px_-40px_rgba(37,99,235,0.6)] backdrop-blur">
              <div className="flex items-center gap-3 text-slate-600">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 via-sky-500 to-indigo-500 text-lg text-white shadow-lg shadow-blue-500/40">
                  🛒
                </span>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.42em] text-slate-400">Procurement</span>
                  <div className="text-lg font-semibold text-slate-900">Manager</div>
                </div>
              </div>

              <div className="mt-10 space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
                {subtitle ? (
                  <p className="text-sm leading-relaxed text-slate-500">{subtitle}</p>
                ) : null}
              </div>

              <div className="mt-10 space-y-6">{children}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
