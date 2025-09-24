export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-900">
      <div className="w-full max-w-md">
        <div className="rounded-[28px] border border-slate-200 bg-white p-10 shadow-xl">
          <div className="mb-8 text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-400">Procurement Manager</span>
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
            {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
          </div>

          <div className="mt-8 space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
