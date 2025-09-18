export default function Landing(){
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="container max-w-6xl mx-auto flex items-center justify-between py-4">
          <div className="font-semibold tracking-wide text-slate-900">🛒 ProcurementsElite</div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#solutions" className="text-slate-700 hover:text-slate-900">Solutions</a>
            <a href="#features" className="text-slate-700 hover:text-slate-900">Features</a>
            <a href="#pricing" className="text-slate-700 hover:text-slate-900">Pricing</a>
            <a href="#contact" className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 shadow">Contact</a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="container max-w-6xl mx-auto py-16 md:py-24">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 max-w-3xl">
            Modern procurement that’s fast, controlled, and audit-ready.
          </h1>
          <p className="mt-5 text-slate-600 max-w-2xl">
            Intake once. Policy-driven approvals. Vendor controls. Budget visibility. Ditch the email ping-pong.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#contact" className="rounded-lg bg-blue-600 text-white px-5 py-2.5 hover:bg-blue-700 shadow">Talk to us</a>
            <a href="#features" className="rounded-lg border px-5 py-2.5 hover:bg-white/80">See features</a>
          </div>

          {/* Metrics */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
            <Metric k="Time to approve" v="2.1h" />
            <Metric k="Policy match" v="99%" />
            <Metric k="PO coverage" v="96%" />
            <Metric k="Vendors tracked" v="1,240" />
          </div>
        </div>
      </section>

      {/* SOLUTIONS */}
      <section id="solutions" className="container max-w-6xl mx-auto py-14">
        <h2 className="text-3xl font-semibold tracking-tight">Built for teams that buy</h2>
        <p className="text-slate-600 mt-1 max-w-2xl">Finance, IT, and Operations stay aligned with clear controls and visibility.</p>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <Card title="Finance" text="Budgets, POs, and invoice matching. See spend by category & vendor." />
          <Card title="IT & Security" text="Policy routing by vendor risk. Block/allow vendors with a click." />
          <Card title="Operations" text="Lightning intake and auto-routing. Fewer pings, faster approvals." />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="container max-w-6xl mx-auto py-10">
        <h2 className="text-3xl font-semibold tracking-tight">Everything in one flow</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <Feature title="Smart intake" text="One form for SaaS, hardware, services—with attachments and vendor pickers." />
          <Feature title="Policy routing" text="Rules by amount, category, vendor risk, cost center—no manual triage." />
          <Feature title="Approvals & audit" text="Sequential approvals with comments, timeline, and exportable audit log." />
          <Feature title="PO & invoice" text="Auto-carry request details to POs; upload invoices and receipts later." />
          <Feature title="Budgets" text="Live category/cost-center progress bars and vendor spend analytics." />
          <Feature title="Vendor controls" text="Block risky vendors, require extra approvals, and track renewals." />
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="container max-w-6xl mx-auto py-12">
        <h2 className="text-3xl font-semibold tracking-tight">Simple pricing</h2>
        <p className="text-slate-600 mt-1 max-w-2xl">Start free. Upgrade when your team needs more control.</p>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <Price name="Starter" price="$0" blurb="For small teams getting started" items={["Unlimited requests","Basic policies","Email support"]}/>
          <Price name="Growth" price="$99" blurb="For growing teams" items={["Advanced policies","PO & invoices","Vendor controls"]} highlight/>
          <Price name="Enterprise" price="Custom" blurb="For org-wide rollouts" items={["SSO/SAML","Custom approvals","Dedicated support"]}/>
        </div>
      </section>

      {/* CONTACT (Netlify Forms) */}
      <section id="contact" className="container max-w-6xl mx-auto py-14">
        <div className="gborder card-glow">
          <div className="inside p-6 md:p-8">
            <h2 className="text-2xl font-semibold">Tell us about your procurement needs</h2>
            <p className="text-slate-600 mt-1">We’ll reach out within one business day.</p>

            {/* Netlify form: shows in Netlify → Forms */}
            <form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" className="mt-6 grid md:grid-cols-2 gap-4">
              <input type="hidden" name="form-name" value="contact" />
              <p className="hidden">
                <label>Don’t fill this out: <input name="bot-field" /></label>
              </p>
              <input name="name" required className="rounded-lg border px-3 py-2" placeholder="Your name"/>
              <input name="email" required type="email" className="rounded-lg border px-3 py-2" placeholder="Your email"/>
              <input name="company" className="rounded-lg border px-3 py-2" placeholder="Company"/>
              <input name="team_size" className="rounded-lg border px-3 py-2" placeholder="Team size"/>
              <textarea name="message" className="md:col-span-2 rounded-lg border px-3 py-2 h-28" placeholder="What would you like to improve?"></textarea>
              <div className="md:col-span-2">
                <button className="rounded-lg bg-blue-600 text-white px-5 py-2.5 hover:bg-blue-700 shadow">Send message</button>
              </div>
            </form>

          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur">
        <div className="container max-w-6xl mx-auto py-6 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} ProcurementsElite</span>
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
function Card({title,text}){ return (
  <div className="card p-5">
    <div className="text-base font-semibold">{title}</div>
    <p className="text-sm text-slate-600 mt-2">{text}</p>
  </div>
);}
function Feature({title,text}){ return (
  <div className="card p-5">
    <div className="text-base font-semibold">{title}</div>
    <p className="text-sm text-slate-600 mt-2">{text}</p>
  </div>
);}
function Price({name,price,blurb,items,highlight}){
  return (
    <div className={`card p-6 ${highlight?'ring-2 ring-blue-500':''}`}>
      <div className="text-sm text-slate-500">{name}</div>
      <div className="text-3xl font-semibold mt-1">{price}</div>
      <p className="text-slate-600 mt-1">{blurb}</p>
      <ul className="text-sm text-slate-700 mt-3 space-y-1">
        {items.map((i,idx)=><li key={idx}>• {i}</li>)}
      </ul>
      <a href="#contact" className="inline-block mt-4 rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">Get in touch</a>
    </div>
  );
}
