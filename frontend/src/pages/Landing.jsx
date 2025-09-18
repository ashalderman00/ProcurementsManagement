export default function Landing() {
  const stats = [
    { label: "Average approval time", value: "2.1h" },
    { label: "Policy match", value: "99%" },
    { label: "PO coverage", value: "96%" },
    { label: "Spend under management", value: "$1.2B" },
  ];

  const solutions = [
    {
      title: "Finance",
      body:
        "Consolidated budgets, PO orchestration, and accrual-ready reporting so close never slips.",
    },
    {
      title: "IT & Security",
      body:
        "Policy routing by vendor risk, dynamic questionnaires, and a living system of record for every supplier.",
    },
    {
      title: "Operations",
      body:
        "Guided intake, auto-notifications, and rich insights to keep stakeholders aligned without chasing updates.",
    },
  ];

  const features = [
    {
      title: "Unified intake",
      copy:
        "Route SaaS, hardware, and services through a single front door with conditional logic and attachments.",
      icon: "🎯",
    },
    {
      title: "Embedded policy",
      copy:
        "Thresholds by spend, region, and vendor tier keep governance invisible yet always-on.",
      icon: "🛡️",
    },
    {
      title: "Approvals with context",
      copy:
        "Decision makers see supplier health, contracts, and budget impact in one secure view.",
      icon: "🧭",
    },
    {
      title: "PO & invoice sync",
      copy:
        "Generate POs in seconds and mirror updates back to ERP—no more spreadsheet gymnastics.",
      icon: "🔁",
    },
    {
      title: "Budget telemetry",
      copy:
        "Live burn-down, variance alerts, and executive dashboards purpose-built for procurement leaders.",
      icon: "📊",
    },
    {
      title: "Vendor lifecycle",
      copy:
        "Track renewals, obligations, and compliance artifacts with automated reminders and ownership.",
      icon: "🔐",
    },
  ];

  const steps = [
    {
      title: "Intake",
      description:
        "Requesters answer only what’s needed. Playbooks choose paths by spend, vendor risk, and category.",
    },
    {
      title: "Collaborate",
      description:
        "Finance, IT, and Legal work in a shared workspace with structured approvals and clear accountability.",
    },
    {
      title: "Activate",
      description:
        "Generate POs, route contracts, and sync data back to ERP, Slack, and the tools you already rely on.",
    },
    {
      title: "Measure",
      description:
        "Out-of-the-box reporting surfaces savings, cycle time, and policy adherence for every business unit.",
    },
  ];

  const testimonials = [
    {
      name: "Maya Patel",
      role: "VP of Finance, Northwind",
      quote:
        "ProcurementsElite gave us an operating system for spend. Our team closes the books in hours, not days.",
    },
    {
      name: "Noah Ramirez",
      role: "Head of IT, Astra Labs",
      quote:
        "The policy routing is the real differentiator. Vendors never slip through without the right controls anymore.",
    },
    {
      name: "Lucia Greer",
      role: "Director of Operations, Haven Homes",
      quote:
        "Stakeholders have complete visibility. Adoption was instant because the experience feels crafted for them.",
    },
  ];

  const plans = [
    {
      name: "Starter",
      price: "$0",
      blurb: "For teams formalizing procurement",
      items: ["Unlimited requests", "Standard workflows", "Email support"],
    },
    {
      name: "Growth",
      price: "$149",
      blurb: "For scaling organizations",
      items: ["Advanced policy engine", "ERP & Slack sync", "Vendor lifecycle tracking"],
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      blurb: "For global procurement leaders",
      items: ["SSO & SCIM", "Dedicated success", "Custom data residency"],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-page text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/70 backdrop-blur-lg">
        <div className="shell flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="brand-mark">PE</div>
            <span className="font-semibold text-lg tracking-tight">ProcurementsElite</span>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#solutions" className="hover:text-slate-900 transition">Solutions</a>
            <a href="#features" className="hover:text-slate-900 transition">Features</a>
            <a href="#pricing" className="hover:text-slate-900 transition">Pricing</a>
            <a
              href="#contact"
              className="rounded-full bg-blue-600 text-white px-4 py-2 shadow-sm shadow-blue-500/30 hover:bg-blue-700 transition"
            >
              Talk to an expert
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="hero relative overflow-hidden">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-orb hero-orb--one" aria-hidden="true" />
          <div className="hero-orb hero-orb--two" aria-hidden="true" />

          <div className="shell relative z-10 py-20 lg:py-28">
            <div className="grid gap-16 lg:grid-cols-[1.1fr,1fr] items-center">
              <div>
                <div className="tag">Procurement operating system</div>
                <h1 className="section-title text-slate-900 mt-6">
                  Procurement that feels orchestrated, not cobbled together.
                </h1>
                <p className="section-lead mt-5 text-slate-600">
                  ProcurementsElite unifies intake, policy, approvals, and supplier management so every purchase is fast,
                  compliant, and insight-rich.
                </p>
                <ul className="mt-6 space-y-3 text-base text-slate-700">
                  <li className="flex items-start gap-3">
                    <span className="checkmark">✓</span>
                    <span>Dynamic playbooks that adapt to spend thresholds, risk profiles, and business rules.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="checkmark">✓</span>
                    <span>Shared workspaces for Finance, IT, and Legal with full history and accountability.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="checkmark">✓</span>
                    <span>Real-time visibility into budgets, renewals, and vendor health for executives.</span>
                  </li>
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="#contact"
                    className="rounded-full bg-blue-600 text-white px-6 py-3 shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition"
                  >
                    Request a strategy session
                  </a>
                  <a
                    href="#features"
                    className="rounded-full border border-slate-300 px-6 py-3 text-slate-700 hover:border-slate-400 hover:text-slate-900 transition"
                  >
                    Explore the platform
                  </a>
                </div>
                <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {stats.map((stat) => (
                    <Metric key={stat.label} k={stat.label} v={stat.value} />
                  ))}
                </div>
              </div>

              <div className="glass-panel p-6 sm:p-7 lg:p-8">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <div>
                    <p className="font-semibold text-slate-900">Request R-2814</p>
                    <p className="text-xs text-slate-500">Annual renewal • SaaS • Marketing</p>
                  </div>
                  <span className="badge">In review</span>
                </div>
                <div className="mt-6 space-y-4 text-sm">
                  <div className="glass-row">
                    <div>
                      <p className="row-label">Requester</p>
                      <p className="row-value">Amelia Chen</p>
                    </div>
                    <span className="status-pill status-pill--approved">Approved</span>
                  </div>
                  <div className="glass-row">
                    <div>
                      <p className="row-label">Finance</p>
                      <p className="row-value">Budget headroom: $42k</p>
                    </div>
                    <span className="status-pill">Next</span>
                  </div>
                  <div className="glass-row">
                    <div>
                      <p className="row-label">Security</p>
                      <p className="row-value">Risk rating: Low • SOC 2 Type II</p>
                    </div>
                    <span className="status-pill status-pill--approved">Approved</span>
                  </div>
                  <div className="glass-row">
                    <div>
                      <p className="row-label">Legal</p>
                      <p className="row-value">Contract review scheduled • Tuesday 2:00pm</p>
                    </div>
                    <span className="status-pill">Pending</span>
                  </div>
                </div>
                <div className="mt-6 rounded-xl bg-slate-900 text-white p-4 shadow-lg">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">Insights</p>
                  <p className="text-base font-medium mt-2">Cycle time trending 32% faster this quarter.</p>
                  <p className="text-sm text-white/70 mt-2">
                    Stakeholders stay aligned with nudges in Slack and a shared audit trail.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-16">
          <div className="shell text-center">
            <div className="tag tag--soft">Trusted by modern procurement teams</div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-sm uppercase tracking-[0.3em] text-slate-400">
              <span className="brand-pill">AtlasBio</span>
              <span className="brand-pill">Veridian</span>
              <span className="brand-pill">HorizonWorks</span>
              <span className="brand-pill">Northwind</span>
              <span className="brand-pill">Astra Labs</span>
              <span className="brand-pill">Haven Homes</span>
            </div>
          </div>
        </section>

        <section id="solutions" className="section">
          <div className="shell">
            <SectionHeading
              title="Built for teams who buy, safeguard, and enable"
              lead="Finance, IT, and Operations stay in lockstep with a shared source of truth for every request."
            />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {solutions.map((solution) => (
                <SolutionCard key={solution.title} {...solution} />
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="section section--dark relative overflow-hidden">
          <div className="section-gradient" aria-hidden="true" />
          <div className="shell relative z-10">
            <SectionHeading
              title="Everything you need to orchestrate procurement"
              lead="From intake to renewals, ProcurementsElite is designed to be the control tower your organization relies on."
              tone="light"
              align="center"
            />
            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <FeatureTile key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="shell grid gap-12 lg:grid-cols-[1fr,1.2fr] items-center">
            <div>
              <SectionHeading
                title="Procurement, perfectly choreographed"
                lead="Every request follows a transparent path so stakeholders always know what’s next and why."
              />
              <div className="mt-10 p-6 rounded-2xl bg-white shadow-lg shadow-slate-900/5 border border-slate-200">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Playbook spotlight</p>
                <h3 className="text-xl font-semibold mt-3 text-slate-900">Global SaaS rollouts</h3>
                <p className="text-slate-600 mt-3">
                  Auto-invite IT security, sync approved vendors from ERP, and capture renewal owners the moment a request is
                  logged. No more surprises at renewal.
                </p>
              </div>
            </div>
            <div className="timeline">
              {steps.map((step, index) => (
                <Step key={step.title} index={index + 1} {...step} />
              ))}
            </div>
          </div>
        </section>

        <section className="section bg-slate-100/60">
          <div className="shell">
            <SectionHeading
              title="Leaders choose ProcurementsElite to scale with confidence"
              lead="See how high-growth companies modernized procurement operations without sacrificing governance."
              align="center"
            />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <Testimonial key={testimonial.name} {...testimonial} />
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="section">
          <div className="shell">
            <SectionHeading
              title="Simple plans that grow with your organization"
              lead="Start with the essentials, then unlock advanced automation and controls as your procurement muscle matures."
              align="center"
            />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <PriceCard key={plan.name} {...plan} />
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="section">
          <div className="shell">
            <div className="gborder card-glow">
              <div className="inside p-8 md:p-10">
                <SectionHeading
                  title="Tell us about your procurement goals"
                  lead="Partner with our team to tailor ProcurementsElite to your processes, systems, and stakeholders."
                />

                <form
                  name="contact"
                  method="POST"
                  data-netlify="true"
                  netlify-honeypot="bot-field"
                  className="mt-10 grid gap-5 md:grid-cols-2"
                >
                  <input type="hidden" name="form-name" value="contact" />
                  <p className="hidden">
                    <label>
                      Don’t fill this out: <input name="bot-field" />
                    </label>
                  </p>
                  <input name="name" required className="input" placeholder="Your name" />
                  <input name="email" required type="email" className="input" placeholder="Work email" />
                  <input name="company" className="input" placeholder="Company" />
                  <input name="team_size" className="input" placeholder="Team size" />
                  <textarea
                    name="message"
                    className="input md:col-span-2 h-32"
                    placeholder="What would you like to improve?"
                  />
                  <div className="md:col-span-2 flex flex-wrap items-center gap-4">
                    <button className="rounded-full bg-blue-600 text-white px-6 py-3 shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition">
                      Send message
                    </button>
                    <p className="text-sm text-slate-500">
                      We respond within one business day. Prefer email? <a href="mailto:hello@procurementselite.com" className="link">hello@procurementselite.com</a>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="shell text-center">
            <div className="tag tag--soft">Next step</div>
            <h2 className="section-title mt-4 text-slate-900">Ready to give your procurement team superpowers?</h2>
            <p className="section-lead mt-4 text-slate-600">
              Let’s design an intake-to-renewal experience your stakeholders will love.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <a
                href="#contact"
                className="rounded-full bg-slate-900 text-white px-6 py-3 shadow-lg shadow-slate-900/30 hover:bg-slate-800 transition"
              >
                Book a conversation
              </a>
              <a href="#features" className="rounded-full border border-slate-300 px-6 py-3 hover:border-slate-400 transition">
                Download the brief
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur">
        <div className="shell py-6 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} ProcurementsElite. Crafted for strategic procurement teams.</span>
          <span className="flex gap-4">
            <a href="/privacy" className="hover:underline">
              Privacy
            </a>
            <a href="/terms" className="hover:underline">
              Terms
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({ title, lead, align = "left", tone = "dark" }) {
  const alignmentClass = align === "center" ? "text-center mx-auto" : "text-left";
  const widthClass = align === "center" ? "max-w-3xl" : "max-w-2xl";
  const leadClass = tone === "light" ? "text-slate-300" : "text-slate-600";
  const titleTone = tone === "light" ? "text-white" : "text-slate-900";

  return (
    <div className={`${alignmentClass} ${widthClass}`}>
      <h2 className={`section-title ${titleTone}`}>{title}</h2>
      {lead && <p className={`section-lead mt-4 ${leadClass}`}>{lead}</p>}
    </div>
  );
}

function Metric({ k, v }) {
  return (
    <div className="stat-card">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{k}</p>
      <p className="text-2xl font-semibold text-slate-900 mt-2">{v}</p>
    </div>
  );
}

function SolutionCard({ title, body }) {
  return (
    <div className="card h-full p-6 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-center gap-3">
        <div className="dot" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>
      <p className="text-slate-600 mt-4 leading-relaxed">{body}</p>
    </div>
  );
}

function FeatureTile({ icon, title, copy }) {
  return (
    <div className="feature-tile">
      <div className="feature-icon">{icon}</div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-slate-200/80 leading-relaxed">{copy}</p>
    </div>
  );
}

function Step({ index, title, description }) {
  return (
    <div className="timeline-step">
      <div className="timeline-index">{index}</div>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-slate-600 mt-2 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function Testimonial({ name, role, quote }) {
  return (
    <blockquote className="quote-card">
      <p>“{quote}”</p>
      <footer className="quote-footer">
        <span className="quote-name">{name}</span>
        <span className="quote-role">{role}</span>
      </footer>
    </blockquote>
  );
}

function PriceCard({ name, price, blurb, items, highlight }) {
  return (
    <div className={`price-card ${highlight ? "price-card--highlight" : ""}`}>
      <div className="price-card-header">
        <span className="price-name">{name}</span>
        <span className="price-value">{price}</span>
        <p className="price-blurb">{blurb}</p>
      </div>
      <ul className="price-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <a href="#contact" className="price-cta">
        Talk to sales
      </a>
    </div>
  );
}
