import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Shield, Zap, Workflow, LineChart, CreditCard } from "lucide-react";

const fade = (d=0)=>({ initial:{opacity:0,y:10}, whileInView:{opacity:1,y:0,transition:{duration:.45,delay:d}}, viewport:{once:true} });

export default function Landing(){
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="container flex items-center justify-between py-4">
          <div className="font-semibold tracking-wide text-slate-900">🛒 Procurement</div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-slate-700 hover:text-slate-900">Features</a>
            <a href="#how" className="text-slate-700 hover:text-slate-900">How it works</a>
            <a href="#pricing" className="text-slate-700 hover:text-slate-900">Pricing</a>
            <Link to="/login" className="text-blue-700">Log in</Link>
            <Link to="/signup" className="rounded-lg bg-brand-600 text-white px-4 py-2 hover:bg-brand-700 shadow-card">Get started</Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="container py-14 md:py-20">
          <motion.h1 {...fade(.05)} className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-900 max-w-3xl">
            Procurement that routes itself — fast approvals, tight controls.
          </motion.h1>
          <motion.p {...fade(.15)} className="mt-4 text-slate-600 max-w-2xl">
            Intake once. Policy-driven approvals. Vendor controls. Budget visibility. All without the email ping-pong.
          </motion.p>
          <motion.div {...fade(.25)} className="mt-6 flex flex-wrap gap-3">
            <Link to="/signup" className="rounded-lg bg-brand-600 text-white px-5 py-2.5 hover:bg-brand-700 shadow-card">Create free account</Link>
            <Link to="/app/requests" className="rounded-lg border px-5 py-2.5 hover:bg-white/80">Try the app</Link>
          </motion.div>

          {/* Metrics strip */}
          <motion.div {...fade(.35)} className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
            <Metric k="Time to approve" v="2.1h" />
            <Metric k="PO coverage" v="96%" />
            <Metric k="Policy match" v="99%" />
            <Metric k="Vendors tracked" v="1,240" />
          </motion.div>
        </div>
      </section>

      {/* Brand strip (placeholder logos) */}
      <section className="container py-8">
        <div className="text-xs uppercase tracking-wider text-slate-500 mb-3">Trusted by modern teams</div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 opacity-70">
          {["Acme","Northwind","Globex","Umbrella","Stark","Wayne"].map(n=>(
            <div key={n} className="gborder"><div className="inside flex items-center justify-center h-12 text-sm text-slate-600">{n}</div></div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="container py-10">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Everything in one flow</h2>
        <p className="text-slate-600 mt-1">Intake → Policy → Approvals → PO/Invoice → Audit & Insights</p>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <Feature icon={<Zap className="text-brand-600" />} title="Lightning intake" text="One form for SaaS, hardware, and services. Attach quotes and pick vendors." />
          <Feature icon={<Workflow className="text-mint-500" />} title="Policy routing" text="Rules by amount, category, vendor risk, cost center — auto-select approvers." />
          <Feature icon={<Shield className="text-iris-500" />} title="Controls that scale" text="Block risky vendors, enforce budgets, and require multi-step approvals." />
          <Feature icon={<CreditCard className="text-brand-600" />} title="PO & invoice" text="Auto-carry request details to POs; upload invoices and receipts later." />
          <Feature icon={<LineChart className="text-mint-500" />} title="Budget visibility" text="Live category/cost-center progress bars and vendor spend analytics." />
          <Feature icon={<CheckCircle2 className="text-iris-500" />} title="Audit ready" text="Every action logged with actor, timestamp, and metadata for export." />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="container py-12">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">How it works</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <Step n="1" title="Submit" text="Requester fills the intake (title, amount, category, vendor, attachments)." />
          <Step n="2" title="Route" text="Policy picks approvers automatically (manager → finance → security)." />
          <Step n="3" title="Purchase" text="Final approval triggers PO; reconcile with invoices/receipts later." />
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="container py-12">
        <div className="gborder card-glow">
          <div className="inside p-6 md:p-8 text-center">
            <h3 className="text-xl font-semibold">Start free • No credit card</h3>
            <p className="text-slate-600 mt-1">Invite your team and set your first policy in minutes.</p>
            <div className="mt-5 flex justify-center gap-3">
              <Link to="/signup" className="rounded-lg bg-brand-600 text-white px-5 py-2.5 hover:bg-brand-700">Get started</Link>
              <Link to="/login" className="rounded-lg border px-5 py-2.5 hover:bg-white/80">Log in</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur">
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

function Metric({k,v}) {
  return (
    <div className="gborder"><div className="inside card p-4 text-center">
      <div className="text-xs text-slate-500">{k}</div>
      <div className="text-2xl font-bold">{v}</div>
    </div></div>
  );
}
function Feature({icon, title, text}) {
  return (
    <motion.div {...{initial:{opacity:0,y:8}, whileInView:{opacity:1,y:0,transition:{duration:.35}}, viewport:{once:true}}} className="card p-5">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-lg bg-brand-50 flex items-center justify-center">{icon}</div>
        <div className="text-base font-semibold">{title}</div>
      </div>
      <p className="text-sm text-slate-600 mt-2">{text}</p>
    </motion.div>
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
