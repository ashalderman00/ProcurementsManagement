import { Link } from "react-router-dom";

export default function Landing(){
  return (
    <div className="min-h-screen gradient-hero">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <div className="font-semibold tracking-wide">🛒 Procurement</div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-slate-700 hover:text-slate-900">Features</a>
            <a href="#how" className="text-slate-700 hover:text-slate-900">How it works</a>
            <a href="#pricing" className="text-slate-700 hover:text-slate-900">Pricing</a>
            <Link to="/login" className="text-blue-700">Log in</Link>
            <Link to="/signup" className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">Get started</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-14">
        <h1 className="section-title">Procurement that routes itself</h1>
        <p className="section-sub max-w-2xl">
          Intake once. Policy-driven approvals. Vendor controls. Budget visibility. All without the email ping-pong.
        </p>
        <div className="mt-6 flex gap-3">
          <Link to="/signup" className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">Create free account</Link>
          <Link to="/app/requests" className="rounded-lg border px-4 py-2 hover:bg-white/80">Try the app</Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-8">
        <h2 className="section-title">Everything in one flow</h2>
        <p className="section-sub">Intake → Policy → Approvals → PO/Invoice → Audit & Insights</p>
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <Feature title="Smart intake" text="One form for SaaS, hardware, services—with attachments and vendor pickers." />
          <Feature title="Policy routing" text="Rules by amount, category, vendor risk, cost center—no manual triage." />
          <Feature title="Approvals & audit" text="Sequential approvals with comments, timeline, and exportable audit log." />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container py-10">
        <h2 className="section-title">How it works</h2>
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <Step n="1" title="Submit request" text="Attach a quote, pick category & vendor, set amount." />
          <Step n="2" title="Policy runs" text="We compute approvers automatically and notify them." />
          <Step n="3" title="Ready to buy" text="Approved items generate PO. Upload invoice/receipt later." />
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="container py-12">
        <div className="card hover-card p-6 md:p-8 text-center">
          <h3 className="text-xl font-semibold">Start free • No credit card</h3>
          <p className="text-slate-600 mt-1">Invite your team and set your first policy in minutes.</p>
          <div className="mt-5 flex justify-center gap-3">
            <Link to="/signup" className="rounded-lg bg-blue-600 text-white px-5 py-2.5 hover:bg-blue-700">Get started</Link>
            <Link to="/login" className="rounded-lg border px-5 py-2.5 hover:bg-white/80">Log in</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur mt-10">
        <div className="container py-6 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Procurement Manager</span>
          <span className="flex gap-4">
            <a href="/privacy" className="hover:underline">Privacy</a>
            <a href="/terms" className="hover:underline">Terms</a>
          </span>
        </div>
      </footer>
    </div>
  );
}

function Feature({title, text}) {
  return (
    <div className="card hover-card p-5">
      <div className="text-base font-semibold">{title}</div>
      <p className="text-sm text-slate-600 mt-1">{text}</p>
    </div>
  );
}
function Step({n,title,text}) {
  return (
    <div className="card p-5">
      <div className="text-xs text-slate-500">Step {n}</div>
      <div className="font-semibold mt-1">{title}</div>
      <p className="text-sm text-slate-600 mt-1">{text}</p>
    </div>
  );
}
