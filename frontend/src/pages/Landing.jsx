import { useState } from "react";

const navLinks = [
  { label: "Overview", href: "#overview" },
  { label: "Operating model", href: "#model" },
  { label: "Role handbook", href: "#roles" },
  { label: "Guides", href: "#guides" },
  { label: "Access", href: "#access" },
];

const heroMetrics = [
  { label: "Active suppliers", value: "214" },
  { label: "Avg. cycle time", value: "3.7 days" },
  { label: "Policy coverage", value: "99.4%" },
];

const operatingModel = [
  {
    title: "Intake & triage",
    summary:
      "Every request lands in one surface with business context, budget, and risk posture captured at the start.",
    points: [
      "Adaptive forms collect what finance, legal, and IT require.",
      "Requestors see preferred suppliers and negotiated terms up front.",
      "Ownership, spend type, and urgency tags are auto-classified for routing.",
    ],
  },
  {
    title: "Approvals & collaboration",
    summary:
      "Policy-based routing keeps finance, legal, security, and executives aligned without side threads.",
    points: [
      "Sequenced approvals mirror your delegation of authority.",
      "Context packs summarise variance, contract status, and risk in plain view.",
      "Comments, redlines, and decisions are preserved in the request dossier.",
    ],
  },
  {
    title: "Vendor desk & renewals",
    summary:
      "Procurement Manager maintains the live vendor record: obligations, health signals, and renewal runway.",
    points: [
      "Critical documents and owners are versioned within each supplier profile.",
      "Renewal windows raise playbooks for savings and stakeholder prep.",
      "Performance, spend, and risk metrics stay ready for audit.",
    ],
  },
];

const rituals = [
  {
    time: "08:45",
    title: "Daily digest",
    description: "Operations receives a morning brief of new intake, blockers, and overnight approvals to triage.",
  },
  {
    time: "11:00",
    title: "Stakeholder sync",
    description: "Finance, legal, and IT review escalations directly inside the shared request workspace.",
  },
  {
    time: "15:30",
    title: "Renewal sweep",
    description: "Procurement checks the renewal radar for 30/60/90-day notices and assigns prep owners.",
  },
  {
    time: "Friday",
    title: "Program review",
    description: "Admins publish metrics, exceptions, and automation updates to leadership and the teams they support.",
  },
];

const roleViews = [
  {
    id: "admin",
    label: "Admin",
    headline: "Keep automations and access healthy",
    summary:
      "Admins govern configurations, integrations, and permissions so every team sees a consistent procurement surface.",
    responsibilities: [
      "Monitor automation runs and resolve any intake or approval failures.",
      "Audit ERP, HRIS, and SSO connections each week for sync accuracy.",
      "Document configuration changes and notify stakeholders of updates.",
    ],
    cadence: [
      "Daily: check the operations dashboard for warnings.",
      "Weekly: refresh playbooks and templates with policy adjustments.",
      "Quarterly: review access and archiving with security.",
    ],
    tools: [
      "Automation monitor",
      "Configuration register",
      "Access review workspace",
    ],
  },
  {
    id: "finance",
    label: "Finance",
    headline: "Steer spend with live visibility",
    summary:
      "Finance partners confirm budget coverage, forecast impact, and vendor obligations before approvals advance.",
    responsibilities: [
      "Validate cost center and GL coding on new intake before month-end.",
      "Highlight variance risks and collaborate with budget owners on mitigation.",
      "Track committed spend against forecast using the live commitments view.",
    ],
    cadence: [
      "Daily: clear approvals that meet policy and funding guardrails.",
      "Weekly: reconcile commitments and accruals with accounting.",
      "Monthly: review renewal savings opportunities with procurement.",
    ],
    tools: [
      "Commitments ledger",
      "Approval console",
      "Variance brief",
    ],
  },
  {
    id: "buyer",
    label: "Buyer",
    headline: "Advance sourcing with structured collaboration",
    summary:
      "Buyers manage vendor evaluations, diligence, and negotiations with transparent milestones for stakeholders.",
    responsibilities: [
      "Keep sourcing workrooms updated with timeline, owners, and decisions.",
      "Coordinate legal and security deliverables directly within the request.",
      "Record supplier performance data for quarterly business reviews.",
    ],
    cadence: [
      "Daily: update request status and outstanding supplier actions.",
      "Weekly: sync with finance on negotiation leverage and savings.",
      "Quarterly: refresh preferred vendor recommendations.",
    ],
    tools: [
      "Sourcing workroom",
      "Supplier directory",
      "Document vault",
    ],
  },
  {
    id: "approver",
    label: "Approver",
    headline: "Decide quickly with complete context",
    summary:
      "Approvers receive concise briefs—budget, risk, legal status—so they can decide confidently without back-and-forth.",
    responsibilities: [
      "Review the approval brief and flag follow-ups directly in the thread.",
      "Ensure delegation coverage during travel or quarter-end windows.",
      "Log conditions or caveats so procurement can operationalise them.",
    ],
    cadence: [
      "Daily: clear pending approvals grouped by priority.",
      "Weekly: align with procurement on escalations or policy updates.",
      "Quarterly: refresh delegation rules and decision matrices.",
    ],
    tools: [
      "Approval brief",
      "Policy library",
      "Delegation planner",
    ],
  },
  {
    id: "requester",
    label: "Requester",
    headline: "Submit and track work with clarity",
    summary:
      "Requesters provide the business case, collaborate on follow-ups, and monitor progress without leaving the workspace.",
    responsibilities: [
      "Complete guided intake with supporting documentation and stakeholders.",
      "Respond promptly to clarification requests from procurement or security.",
      "Plan renewals early with reminders and budget coordination.",
    ],
    cadence: [
      "As needed: start intake before contracts expire or spend occurs.",
      "During review: stay available in the request thread for context.",
      "Post approval: confirm delivery and record supplier feedback.",
    ],
    tools: [
      "Guided request",
      "Tracking board",
      "Renewal planner",
    ],
  },
];

const quickGuides = [
  {
    title: "Procurement Manager orientation",
    description: "Short walkthrough of the workspace layout, intake, and approvals for new teammates.",
    action: "Open the overview",
  },
  {
    title: "Intake quality checklist",
    description: "Checklist requesters can follow to ensure finance, legal, and IT have what they need on day one.",
    action: "Download checklist",
  },
  {
    title: "Quarterly renewal planning",
    description: "Template to coordinate renewal prep, benchmarks, and negotiation notes across teams.",
    action: "Review the template",
  },
];

const accessSteps = [
  {
    title: "Launch the workspace",
    description:
      "Procurement Manager lives at workspace.procurementmanager.com. Sign in with company SSO from any managed device.",
    meta: "SSO required",
    action: { label: "Sign in", href: "/login", tone: "primary" },
  },
  {
    title: "Request workspace access",
    description:
      "New collaborators can request access by emailing the admin team with their cost center, manager, and required role.",
    meta: "Under 1 business day",
    action: {
      label: "Email admin team",
      href: "mailto:admin@procurementmanager.com",
      tone: "ghost",
    },
  },
  {
    title: "Complete orientation",
    description:
      "Before submitting your first request, complete the 20-minute orientation that covers intake, approvals, and vendor dossiers.",
    meta: "Orientation",
    action: { label: "Open orientation guide", href: "#guides", tone: "link" },
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
            <span className="brand-mark" aria-hidden="true" />
            <span>Procurement Manager</span>
          </a>
          <nav className="nav-links" aria-label="Primary">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <a className="nav-cta" href="#access">
            Sign in
          </a>
        </div>
      </header>

      <main>
        <section className="hero" id="overview" aria-labelledby="hero-title">
          <div className="shell hero-shell">
            <div className="hero-grid">
              <div className="hero-copy">
                <span className="kicker hero-kicker">Procurement Manager</span>
                <h1 className="hero-title" id="hero-title">
                  The operations surface for procurement teams
                </h1>
                <p className="hero-description">
                  Procurement Manager keeps intake, approvals, and vendor management in one glassy control center for finance,
                  legal, security, and operations. It is the internal workspace your teams rely on—not a marketing site.
                </p>
                <div className="hero-actions">
                  <a className="button primary" href="#access">
                    Launch workspace
                  </a>
                  <a className="button ghost" href="#access">
                    Request access
                  </a>
                </div>
                <dl className="hero-metrics">
                  {heroMetrics.map((metric) => (
                    <div className="metric" key={metric.label}>
                      <dt>{metric.value}</dt>
                      <dd>{metric.label}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <aside className="hero-visual" aria-hidden="true">
                <div className="rule-card">
                  <div className="rule-header">
                    <div className="rule-owner">
                      <span className="avatar">AV</span>
                      <div className="owner-text">
                        <span className="owner-role">Manager</span>
                        <span className="owner-name">Amelia Vaughn</span>
                      </div>
                    </div>
                    <span className="rule-tag">Admin</span>
                  </div>
                  <div className="rule-flow">
                    <span className="flow-node" />
                    <span className="flow-line" />
                    <span className="flow-node" />
                    <span className="flow-line dashed" />
                    <span className="flow-node" />
                  </div>
                  <div className="rule-body">
                    <div className="rule-condition">
                      <span className="chip muted">If the</span>
                      <span className="chip">Amount</span>
                      <span className="chip muted">is above</span>
                      <span className="chip highlight">$500</span>
                    </div>
                    <div className="rule-require">
                      <span className="chip muted">Require</span>
                      <span className="chip role finance">Finance team</span>
                      <span className="chip role it">IT team</span>
                    </div>
                    <button type="button" className="add-rule">
                      + Add rule
                    </button>
                  </div>
                </div>
                <div className="notifications-card">
                  <div className="notification primary">
                    <div className="notification-header">
                      <span className="notification-app teams">Teams</span>
                      <span className="notification-status">Syncing…</span>
                    </div>
                    <p className="notification-title">Nathan requested spend</p>
                    <div className="notification-actions">
                      <button type="button">Approve</button>
                      <button type="button">Decline</button>
                    </div>
                  </div>
                  <div className="notification stack">
                    <div className="notification-header">
                      <span className="notification-app workspace">Workspace</span>
                      <span className="notification-status">In review</span>
                    </div>
                    <p className="notification-title">Shannon requested spend</p>
                    <div className="notification-actions">
                      <button type="button">Approve</button>
                      <button type="button">Decline</button>
                    </div>
                  </div>
                  <div className="integration-chip oracle">Oracle NetSuite</div>
                  <div className="integration-chip workday">Workday</div>
                  <div className="integration-chip okta">Okta SSO</div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="operating" id="model" aria-labelledby="operating-heading">
          <div className="shell">
            <div className="section-heading">
              <span className="kicker">Operating model</span>
              <h2 id="operating-heading">How Procurement Manager is structured</h2>
              <p>
                A concise view of the surfaces, rituals, and guardrails that keep procurement predictable. Share this with new
                teammates so they understand what lives where.
              </p>
            </div>
            <div className="operating-grid">
              {operatingModel.map((item) => (
                <article className="operating-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
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

        <section className="rituals" aria-labelledby="rituals-heading">
          <div className="shell">
            <div className="section-heading">
              <span className="kicker">Rhythm of work</span>
              <h2 id="rituals-heading">Daily and weekly cadences</h2>
              <p>
                Keep the team aligned on what happens when. Use this cadence to plan staffing, office hours, and leadership
                visibility.
              </p>
            </div>
            <div className="timeline" role="list">
              {rituals.map((item) => (
                <div className="timeline-row" role="listitem" key={item.title}>
                  <div className="timeline-marker">
                    <span className="timeline-dot" />
                    <span className="timeline-time">{item.time}</span>
                  </div>
                  <div className="timeline-content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="roles" id="roles" aria-labelledby="roles-heading">
          <div className="shell">
            <div className="section-heading">
              <span className="kicker">Role handbook</span>
              <h2 id="roles-heading">What each team owns inside Procurement Manager</h2>
              <p>
                Select your role to review responsibilities, cadence, and the workspaces you will live in day to day.
              </p>
            </div>
            <div className="role-selector">
              <label htmlFor="role-select">Role</label>
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
            </div>
            <article className="role-panel" aria-live="polite">
              <div className="role-header">
                <h3>{activeRole.headline}</h3>
                <p>{activeRole.summary}</p>
              </div>
              <div className="role-columns">
                <div className="role-column">
                  <h4>Responsibilities</h4>
                  <ul>
                    {activeRole.responsibilities.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="role-column">
                  <h4>Cadence</h4>
                  <ul>
                    {activeRole.cadence.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="role-column">
                  <h4>Key surfaces</h4>
                  <ul>
                    {activeRole.tools.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="guides" id="guides" aria-labelledby="guides-heading">
          <div className="shell">
            <div className="section-heading">
              <span className="kicker">Guides</span>
              <h2 id="guides-heading">Resources to onboard or refresh</h2>
              <p>
                Quick references to share with new hires or stakeholders joining the program. Save them to your internal wiki or
                procurement channel.
              </p>
            </div>
            <div className="guide-grid">
              {quickGuides.map((guide) => (
                <article className="guide-card" key={guide.title}>
                  <h3>{guide.title}</h3>
                  <p>{guide.description}</p>
                  <button type="button" className="text-button">
                    {guide.action}
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="access" id="access" aria-labelledby="access-heading">
          <div className="shell">
            <div className="section-heading">
              <span className="kicker">Access & onboarding</span>
              <h2 id="access-heading">How to get into Procurement Manager</h2>
              <p>
                A short primer for teammates who already operate the program—where to sign in, how to request access, and what
                to review before managing intake.
              </p>
            </div>
            <div className="access-grid">
              {accessSteps.map((step) => (
                <article className="access-card" key={step.title}>
                  <div className="access-card-header">
                    <h3>{step.title}</h3>
                    {step.meta ? <span className="access-meta">{step.meta}</span> : null}
                  </div>
                  <p>{step.description}</p>
                  {step.action ? (
                    step.action.tone === "link" ? (
                      <a className="text-button" href={step.action.href}>
                        {step.action.label}
                      </a>
                    ) : (
                      <a
                        className={`button ${step.action.tone === "ghost" ? "ghost" : "primary"}`}
                        href={step.action.href}
                      >
                        {step.action.label}
                      </a>
                    )
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
