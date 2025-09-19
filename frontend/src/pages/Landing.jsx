import { useState } from "react";

const navLinks = [
  { label: "Overview", href: "#overview" },
  { label: "Platform", href: "#platform" },
  { label: "Workflow", href: "#workflow" },
  { label: "Roles", href: "#roles" },
  { label: "Playbooks", href: "#playbooks" },
];

const heroMetrics = [
  { label: "Cycle time reduction", value: "42%" },
  { label: "Policy adherence", value: "99.2%" },
  { label: "Savings surfaced", value: "$3.8M" },
];

const heroSignals = [
  "Structured intake collects business case, budget, and risk data automatically.",
  "Smart approvals orchestrate finance, legal, and security in a single thread.",
  "Supplier intelligence keeps obligations, renewals, and spend ready for audit.",
];

const heroPreview = [
  {
    name: "Notion annual renewal",
    meta: "Finance review • due tomorrow",
    amount: "$48.9K",
    status: "On track",
    tone: "positive",
  },
  {
    name: "Google Cloud expansion",
    meta: "Executive approval • forecast +3%",
    amount: "$320K",
    status: "Needs input",
    tone: "warning",
  },
  {
    name: "Loom growth plan",
    meta: "Security questionnaire • waiting on vendor",
    amount: "$18.5K",
    status: "Blocked",
    tone: "neutral",
  },
];

const trustedLogos = ["Amplitude", "Asana", "Linear", "Figma", "Webflow", "Miro"];

const pillars = [
  {
    title: "Universal intake surface",
    description:
      "Employees start every purchase in one workspace so procurement sees demand the moment it emerges.",
    bullets: [
      "Dynamic forms adapt by vendor, spend type, and urgency.",
      "Budgets, contracts, and risk requirements pre-fill from your systems.",
      "Preferred suppliers and negotiated terms appear in-line for faster selections.",
    ],
  },
  {
    title: "Autonomous approvals",
    description:
      "Approvals route automatically based on spend thresholds, policy, and jurisdiction without manual reminders.",
    bullets: [
      "Finance, legal, and security collaborate inside the same context thread.",
      "Delegation logic covers out-of-office scenarios with confidence.",
      "Stakeholders receive one-click summaries with the data they need to sign off.",
    ],
  },
  {
    title: "Supplier & renewal command",
    description:
      "Procurement Manager maintains a live dossier for every vendor—from performance trends to renewal runway.",
    bullets: [
      "Centralized obligations, documents, and points of contact.",
      "Renewal heatmaps highlight savings opportunities ahead of negotiations.",
      "Audit-ready trails for contracts, approvals, and risk artifacts.",
    ],
  },
];

const platformHighlights = [
  {
    label: "Finance in the flow",
    title: "Source-to-pay connected to ERP",
    description:
      "Actuals, commitments, and amortization sync bi-directionally so finance sees the true picture of spend.",
    points: [
      "Integrations with ERP, HRIS, and collaboration suites stay in lockstep.",
      "Budget owners get instant context on variances and forecast impact.",
    ],
  },
  {
    label: "Collaboration built-in",
    title: "Legal and security review without the chase",
    description:
      "Bring legal, IT, and risk teams into the same surface to comment, attach documents, and certify requirements.",
    points: [
      "Version-controlled contract workspace with clause libraries.",
      "Security and compliance questionnaires tracked alongside requests.",
    ],
  },
  {
    label: "Policy instrumentation",
    title: "Governance that scales with growth",
    description:
      "Guardrails turn policy into code so every intake follows approved pathways.",
    points: [
      "Thresholds adjust by business unit, geography, and currency.",
      "Exception handling captures rationale and escalations automatically.",
    ],
  },
];

const workflow = [
  {
    id: "01",
    title: "Intake & discovery",
    description:
      "Guided forms capture context, business impact, and required documentation while surfacing the right suppliers.",
    bullets: [
      "Pre-built templates for software, services, and hardware purchases.",
      "Automated diligence triggers for security, privacy, and compliance.",
    ],
  },
  {
    id: "02",
    title: "Approvals & negotiation",
    description:
      "Sequential approvals kick off with finance, legal, and executive reviewers receiving the same, live dossier.",
    bullets: [
      "Negotiation notes and benchmark data stay visible to every stakeholder.",
      "SLA timers keep cycle times accountable across teams.",
    ],
  },
  {
    id: "03",
    title: "Supplier onboarding",
    description:
      "Vendor setup flows, contract storage, and risk attestations are automated and auditable.",
    bullets: [
      "Collect banking, tax, and insurance documentation in one motion.",
      "Track implementation tasks and owners with real-time status.",
    ],
  },
  {
    id: "04",
    title: "Renewal intelligence",
    description:
      "Procurement Manager surfaces renewals, consumption data, and savings playbooks ahead of every milestone.",
    bullets: [
      "Collaborative renewal briefs alert budget owners at 120/90/60-day windows.",
      "Spend benchmarks and utilization analytics guide negotiations.",
    ],
  },
];

const roleViews = [
  {
    id: "admin",
    label: "Admin",
    headline: "Keep the control plane clean",
    summary:
      "Admins orchestrate automations, integrations, and access so the procurement program runs flawlessly.",
    priorities: [
      "Monitor automation health to ensure every intake and approval flow stays green.",
      "Publish weekly release notes so stakeholders understand policy or workflow updates.",
      "Audit ERP, HRIS, and SSO connections for sync accuracy.",
    ],
    toolkit: [
      {
        label: "Automation monitor",
        description: "Exception alerts, run history, and rollback controls in one dashboard.",
      },
      {
        label: "Configuration register",
        description: "Trace changes across intake forms, approval rules, and routing assignments.",
      },
      {
        label: "Access reviews",
        description: "Provisioning snapshots and attestation status for auditors.",
      },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    headline: "Steer spend with total visibility",
    summary:
      "Finance partners see real-time commitments, approvals, and forecast impact without waiting for spreadsheets.",
    priorities: [
      "Validate budget coverage before approvals hit the month-end freeze.",
      "Surface variance risks to budget owners with supporting context.",
      "Model savings scenarios from renewal and sourcing playbooks.",
    ],
    toolkit: [
      {
        label: "Live commitments view",
        description: "Actuals, accruals, and pipeline aligned to cost centers and projects.",
      },
      {
        label: "Approval console",
        description: "Finance thresholds and policies embedded into every request.",
      },
      {
        label: "Savings analyzer",
        description: "Benchmark data and utilization insight ready for negotiation prep.",
      },
    ],
  },
  {
    id: "buyer",
    label: "Buyer",
    headline: "Run sourcing like a pro team",
    summary:
      "Buyers collaborate with stakeholders and vendors using structured milestones and documentation.",
    priorities: [
      "Advance sourcing events with transparent status for business partners.",
      "Coordinate diligence and contract reviews with clear owners and due dates.",
      "Capture supplier performance data for quarterly reviews.",
    ],
    toolkit: [
      {
        label: "Sourcing workrooms",
        description: "Milestones, scorecards, and negotiation history in one place.",
      },
      {
        label: "Supplier directory",
        description: "Performance trends, contacts, and obligations for every vendor.",
      },
      {
        label: "Document vault",
        description: "Statements of work, MSAs, and redlines with full version control.",
      },
    ],
  },
  {
    id: "approver",
    label: "Approver",
    headline: "Decide with confidence",
    summary:
      "Approvers receive concise context—budget, risk, contract status—so they can act quickly and defensibly.",
    priorities: [
      "Clear approvals by priority with variance and compliance indicators surfaced.",
      "Record conditions, questions, and follow-ups directly in the approval trail.",
      "Ensure delegation coverage during travel or quarter-end crunches.",
    ],
    toolkit: [
      {
        label: "Approval brief",
        description: "Single-page summary with financials, stakeholders, and outstanding tasks.",
      },
      {
        label: "Policy library",
        description: "Search guardrails by spend type, geography, and threshold.",
      },
      {
        label: "Delegation planner",
        description: "Assign coverage and monitor SLA adherence across teams.",
      },
    ],
  },
  {
    id: "requester",
    label: "Requester",
    headline: "Start and track work effortlessly",
    summary:
      "Employees initiate purchases with clarity on requirements, progress, and partners.",
    priorities: [
      "Submit complete requests with business context and supporting documentation.",
      "Respond quickly to clarifications from procurement or security.",
      "Plan renewals early with reminders and budget alignment.",
    ],
    toolkit: [
      {
        label: "Guided request",
        description: "Step-by-step intake that highlights preferred vendors and policy cues.",
      },
      {
        label: "Tracking board",
        description: "Real-time status, comments, and deliverables shared with stakeholders.",
      },
      {
        label: "Renewal planner",
        description: "Timeline of upcoming renewals with owners and prep tasks.",
      },
    ],
  },
];

const playbooks = [
  {
    title: "Procurement operating guide",
    description: "A 30-60-90 plan to stand up Procurement Manager and align stakeholders.",
    action: "Open guide",
  },
  {
    title: "Month-end close ritual",
    description: "Checklist for reconciling commitments, approvals, and accruals every month.",
    action: "Review checklist",
  },
  {
    title: "Renewal preparation kit",
    description: "Templates to brief budget owners and capture vendor performance ahead of negotiations.",
    action: "Download kit",
  },
];

export default function Landing() {
  const [selectedRole, setSelectedRole] = useState(roleViews[0].id);
  const activeRole = roleViews.find((role) => role.id === selectedRole) ?? roleViews[0];

  return (
    <div className="page">
      <header className="site-header" id="top">
        <div className="shell nav-shell">
          <a className="brand" href="#top">
            <span>Procurement Manager</span>
          </a>
          <nav className="nav-links" aria-label="Primary">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <a className="nav-cta" href="#contact">
            Speak with procurement
          </a>
        </div>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="shell hero-shell">
            <div className="hero-grid">
              <div className="hero-copy">
                <span className="kicker hero-kicker">Procurement Manager</span>
                <h1 className="hero-title" id="hero-title">
                  Procurement built with Ramp precision
                </h1>
                <p className="hero-description">
                  Command intake, approvals, and suppliers from one pane of glass. Procurement Manager gives your team the same
                  rigor Ramp uses to run its own spend program.
                </p>
                <ul className="hero-list">
                  {heroSignals.map((signal) => (
                    <li key={signal}>{signal}</li>
                  ))}
                </ul>
                <div className="hero-actions">
                  <a className="button primary" href="#contact">
                    Request a walkthrough
                  </a>
                  <a className="button secondary" href="#playbooks">
                    Download program guide
                  </a>
                </div>
                <div className="hero-metrics">
                  {heroMetrics.map((metric) => (
                    <div className="metric" key={metric.label}>
                      <span className="metric-value">{metric.value}</span>
                      <span className="metric-label">{metric.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <aside className="hero-preview" aria-label="Procurement queue preview">
                <div className="preview-header">
                  <div>
                    <span className="preview-title">Active requests</span>
                    <p className="preview-subtitle">Live queue synced with finance &amp; legal</p>
                  </div>
                  <span className="preview-pill">Realtime</span>
                </div>
                <ul className="preview-list">
                  {heroPreview.map((item) => (
                    <li className="preview-row" key={item.name}>
                      <div className="preview-main">
                        <span className="preview-name">{item.name}</span>
                        <span className="preview-meta">{item.meta}</span>
                      </div>
                      <div className="preview-meta-group">
                        <span className="preview-amount">{item.amount}</span>
                        <span className={`preview-status ${item.tone}`}>{item.status}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="preview-footer">
                  <div>
                    <span className="preview-footer-label">Savings surfaced this quarter</span>
                    <span className="preview-footer-value">$940K</span>
                  </div>
                  <span className="preview-trend positive">▲ 18% vs prior quarter</span>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="trusted" aria-label="Trusted by leading teams">
          <div className="shell trusted-shell">
            <span className="trusted-label">Trusted by procurement teams at</span>
            <div className="trusted-logos">
              {trustedLogos.map((logo) => (
                <span key={logo}>{logo}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="overview" id="overview" aria-labelledby="overview-heading">
          <div className="shell">
            <div className="section-heading">
              <span className="kicker">Overview</span>
              <h2 id="overview-heading">A control center for modern procurement</h2>
              <p>
                Roll out the same discipline Ramp uses internally—streamlined intake, automated approvals, and renewal intelligence
                designed for operators.
              </p>
            </div>
            <div className="pillars-grid">
              {pillars.map((pillar) => (
                <article className="pillar-card" key={pillar.title}>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.description}</p>
                  <ul>
                    {pillar.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="platform" id="platform" aria-labelledby="platform-heading">
          <div className="shell">
            <div className="section-heading">
              <span className="kicker">Platform</span>
              <h2 id="platform-heading">Everything connects back to your systems</h2>
              <p>
                Procurement Manager eliminates swivel-chair work by syncing with finance, legal, and security tools from intake to
                renewal.
              </p>
            </div>
            <div className="platform-grid">
              {platformHighlights.map((item) => (
                <article className="platform-card" key={item.title}>
                  <span className="platform-label">{item.label}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <ul>
                    {item.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="workflow" id="workflow" aria-labelledby="workflow-heading">
          <div className="shell">
            <div className="section-heading">
              <span className="kicker">Workflow</span>
              <h2 id="workflow-heading">Built for the full procurement lifecycle</h2>
              <p>
                From the first request to renewal, every phase is orchestrated with stakeholders, documentation, and accountability
                in view.
              </p>
            </div>
            <div className="workflow-grid">
              {workflow.map((step) => (
                <article className="workflow-step" key={step.id}>
                  <span className="workflow-id" aria-hidden="true">
                    {step.id}
                  </span>
                  <div className="workflow-content">
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                    <ul>
                      {step.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="roles" id="roles" aria-labelledby="roles-heading">
          <div className="shell">
            <div className="section-heading">
              <span className="kicker">Roles</span>
              <h2 id="roles-heading">Designed for every stakeholder</h2>
              <p>
                Select a persona to see the priorities, rituals, and tools available to your team inside Procurement Manager.
              </p>
            </div>
            <div className="role-controls">
              <div className="role-tabs" role="tablist" aria-label="Procurement personas">
                {roleViews.map((role) => {
                  const isActive = role.id === selectedRole;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      role="tab"
                      className={`role-tab${isActive ? " is-active" : ""}`}
                      aria-selected={isActive}
                      aria-controls={`role-panel-${role.id}`}
                      id={`role-tab-${role.id}`}
                      onClick={() => setSelectedRole(role.id)}
                    >
                      {role.label}
                    </button>
                  );
                })}
              </div>
              <label className="role-select-label" htmlFor="role-select">
                <span className="sr-only">Select a role</span>
                <select
                  id="role-select"
                  className="role-select"
                  value={selectedRole}
                  onChange={(event) => setSelectedRole(event.target.value)}
                >
                  {roleViews.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <article
              className="role-panel"
              role="tabpanel"
              id={`role-panel-${activeRole.id}`}
              aria-labelledby={`role-tab-${activeRole.id}`}
            >
              <div className="role-header">
                <h3>{activeRole.headline}</h3>
                <p>{activeRole.summary}</p>
              </div>
              <div className="role-body">
                <div className="role-column">
                  <h4>Weekly priorities</h4>
                  <ul>
                    {activeRole.priorities.map((priority) => (
                      <li key={priority}>{priority}</li>
                    ))}
                  </ul>
                </div>
                <div className="role-column">
                  <h4>Workspace toolkit</h4>
                  <ul className="toolkit-list">
                    {activeRole.toolkit.map((tool) => (
                      <li key={tool.label}>
                        <div className="tool-card">
                          <span className="tool-title">{tool.label}</span>
                          <p>{tool.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="playbooks" id="playbooks" aria-labelledby="playbooks-heading">
          <div className="shell">
            <div className="section-heading">
              <span className="kicker">Playbooks</span>
              <h2 id="playbooks-heading">Guides to launch and scale the program</h2>
              <p>
                Use the Ramp procurement playbooks to onboard teams, run month-end, and prep renewals without building from
                scratch.
              </p>
            </div>
            <div className="playbook-grid">
              {playbooks.map((playbook) => (
                <article className="playbook-card" key={playbook.title}>
                  <h3>{playbook.title}</h3>
                  <p>{playbook.description}</p>
                  <button type="button" className="text-button">
                    {playbook.action}
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="final-cta" id="contact" aria-labelledby="contact-heading">
          <div className="shell">
            <div className="final-cta-card">
              <div className="final-cta-copy">
                <span className="kicker final-kicker">Next step</span>
                <h2 id="contact-heading">Partner with the procurement desk</h2>
                <p>
                  Schedule a working session with the Procurement Manager team to see your data flows, policy guardrails, and
                  stakeholder rituals come to life.
                </p>
                <ul>
                  <li>Tailored walkthrough with admin, finance, and procurement leads.</li>
                  <li>Integration review across ERP, HRIS, CLM, and collaboration tools.</li>
                  <li>Implementation plan aligned to your quarter-end milestones.</li>
                </ul>
              </div>
              <div className="final-cta-actions">
                <a className="button primary" href="mailto:operations@procurementmanager.com">
                  operations@procurementmanager.com
                </a>
                <a className="button tertiary" href="#top">
                  View product overview again
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
