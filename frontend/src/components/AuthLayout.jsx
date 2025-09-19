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
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-[-18%] h-[520px] w-[520px] rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute right-[-12%] top-20 h-[440px] w-[440px] rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute bottom-[-25%] left-1/2 h-[540px] w-[540px] -translate-x-1/2 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-12 sm:px-8 lg:flex-row lg:items-center lg:gap-14 lg:px-12">
        <aside className="hidden w-full max-w-[480px] flex-col gap-12 lg:flex">
          <div className="rounded-[32px] border border-white/60 bg-white/80 p-12 shadow-[0_32px_120px_-60px_rgba(15,23,42,0.45)] backdrop-blur">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-slate-100 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">
              {hero.eyebrow}
            </div>
            <h2 className="mt-8 text-4xl font-semibold leading-tight text-slate-900 sm:text-[2.75rem]">
              {hero.heading}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-slate-600">{hero.description}</p>
            {hero.highlights?.length ? (
              <ul className="mt-12 space-y-6">
                {hero.highlights.map(({ icon: Icon, title: highlightTitle, description }, index) => (
                  <li key={highlightTitle ?? index} className="flex items-start gap-4">
                    <span className="mt-0.5 rounded-2xl bg-blue-50 p-2 text-blue-600">
                      <Icon size={18} />
                    </span>
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-slate-900">{highlightTitle}</h3>
                      <p className="text-sm leading-relaxed text-slate-600">{description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-8 text-xs uppercase tracking-[0.3em] text-slate-400 backdrop-blur">
            <span className="block text-[0.7rem] font-semibold text-slate-500">Trusted by modern operations teams</span>
            <div className="mt-4 flex flex-wrap gap-3 text-[0.82rem] tracking-normal text-slate-500">
              <span className="rounded-full border border-slate-200/60 px-3 py-1">Northwind Ops</span>
              <span className="rounded-full border border-slate-200/60 px-3 py-1">Acme Supply</span>
              <span className="rounded-full border border-slate-200/60 px-3 py-1">Evergreen Labs</span>
            </div>
          </div>
        </aside>

        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">
            <div className="rounded-[32px] border border-white/80 bg-white/95 p-10 text-slate-900 shadow-[0_40px_120px_-50px_rgba(15,23,42,0.35)] backdrop-blur">
              <div className="flex items-center gap-3 text-slate-500">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-500 to-sky-500 text-lg text-white shadow-lg shadow-blue-500/30">
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
