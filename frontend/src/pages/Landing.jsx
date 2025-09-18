import { useState } from "react";

const stats = [
  { label: "Requests in motion", value: "24" },
  { label: "Avg cycle time", value: "5.4 days" },
  { label: "On-policy spend", value: "98%" },
];

const highlights = [
  {
    title: "Concise command surface",
    description:
      "A single briefing view keeps intake, approvals, suppliers, and renewals aligned for daily stand-ups.",
  },
  {
    title: "Governance as a service",
    description:
      "Policy guardrails, audit trails, and automation health are embedded so compliance is maintained without extra decks.",
  },
  {
    title: "Stakeholder ready",
    description:
      "Tailored routes equip admins, finance, buyers, approvers, and requesters with the context they need to deliver on time.",
  },
];

const briefing = {
  title: "Today's operating preview",
  focus:
    "Quarter-close approvals and supplier reviews are top priority. Surface blockers early in #procurement-ops.",
  updates: [
    { label: "Approvals", value: "6 awaiting executive signature" },
    { label: "Sourcing", value: "3 events in collaboration" },
    { label: "Renewals", value: "8 within 90-day window" },
  ],
  reminders: [
    "Send executive digest by 4:00 PM.",
    "Upload Nova Analytics security questionnaire.",
    "Log supplier feedback from marketing offsite.",
  ],
};

const routes = [
  {
    id: "admin",
    label: "Admin",
    title: "Admin route",
    headline: "Safeguard the workspace foundation.",
    description:
      "Keep guardrails, access, and integrations aligned so every update in Procurement Manager is trusted.",
    markers: [
      { label: "Automation health", detail: "0 overnight exceptions across intake flows" },
      { label: "Policy bulletin", detail: "Queue sync updates for Friday’s release note" },
      { label: "Systems sync", detail: "ERP + CLM reconciled at 06:00" },
    ],
    agenda: [
      "Review automation logs and reassign any exceptions before 09:30.",
      "Publish intake guardrail note to the announcement banner.",
      "Confirm access provisioning for the three new project teams.",
    ],
    resources: [
      {
        label: "Configuration register",
        description: "Change log for routing, risk rules, and automation.",
      },
      {
        label: "Integration monitor",
        description: "Live sync visibility into ERP and CLM handoffs.",
      },
      {
        label: "Access review queue",
        description: "Audit trail of approvals and provisioning status.",
      },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    title: "Finance route",
    headline: "Orchestrate spend with confidence.",
    description:
      "Track commitments against plan, steer approvals, and brief budget owners with zero guesswork.",
    markers: [
      { label: "Budget coverage", detail: "98% of intake aligned to funding" },
      { label: "Variance watch", detail: "Highlight marketing's +4% outlook" },
      { label: "Renewal runway", detail: "8 contracts inside 90 days" },
    ],
    agenda: [
      "Validate coverage for new intake before the month-end freeze.",
      "Reconcile forecast variance with business partners by noon.",
      "Flag renewal negotiations that affect accruals.",
    ],
    resources: [
      {
        label: "Budget dashboard",
        description: "Live commitments, burn rate, and variance by cost center.",
      },
      {
        label: "Approval console",
        description: "Capital vs. operating guardrails with contract context.",
      },
      {
        label: "Renewal calendar",
        description: "Coordinated runway across vendors and owners.",
      },
    ],
  },
  {
    id: "buyer",
    label: "Buyer",
    title: "Buyer route",
    headline: "Advance sourcing workstreams deliberately.",
    description:
      "Coordinate supplier evaluations, negotiations, and onboarding with context for every stakeholder.",
    markers: [
      { label: "Active sourcing", detail: "5 events with milestones due this week" },
      { label: "Onboarding queue", detail: "2 suppliers awaiting tax documentation" },
      { label: "Risk alignment", detail: "Security review pending for Nova Analytics" },
    ],
    agenda: [
      "Progress milestones on open sourcing events and update stakeholders.",
      "Capture negotiation outcomes and attach supporting documentation.",
      "Share supplier performance notes ahead of Monday's QBRs.",
    ],
    resources: [
      {
        label: "Sourcing workspace",
        description: "Timeline, owners, and scorecards in one view.",
      },
      {
        label: "Supplier directory",
        description: "360° profiles with performance trends and contacts.",
      },
      {
        label: "Document vault",
        description: "Templates and executed agreements ready for reuse.",
      },
    ],
  },
  {
    id: "approver",
    label: "Approver",
    title: "Approver route",
    headline: "Decide with full context.",
    description:
      "Review requests quickly with finance, legal, and risk posture surfaced automatically.",
    markers: [
      { label: "Approvals due", detail: "4 items awaiting executive signature" },
      { label: "Policy spotlight", detail: "Travel over $25k requires CFO co-sign" },
      { label: "Escalations", detail: "None reported overnight" },
    ],
    agenda: [
      "Prioritize today's queue sorted by due date before noon.",
      "Capture conditions and next steps directly in the approval comment.",
      "Confirm compliance thresholds and delegation coverage.",
    ],
    resources: [
      {
        label: "Approval console",
        description: "Budget, contract, and risk intel on one screen.",
      },
      {
        label: "Policy library",
        description: "Search guardrails by spend category and threshold.",
      },
      {
        label: "Delegation settings",
        description: "Assign coverage for absences or peak periods.",
      },
    ],
  },
  {
    id: "requester",
    label: "Requester",
    title: "Requester route",
    headline: "Move work forward with clarity.",
    description:
      "Start new purchases, monitor progress, and prep renewals with guided, transparent steps.",
    markers: [
      { label: "Requests in review", detail: "2 awaiting procurement feedback" },
      { label: "Documents outstanding", detail: "Upload Helios CRM security checklist" },
      { label: "Renewal planner", detail: "Marketing automation contract due in 75 days" },
    ],
    agenda: [
      "Complete intake forms with business impact and funding detail.",
      "Respond quickly to clarifications from procurement or security.",
      "Set renewal reminders 90 days before contracts expire.",
    ],
    resources: [
      {
        label: "Start a request",
        description: "Guided intake that suggests preferred suppliers and templates.",
      },
      {
        label: "Track my requests",
        description: "Real-time status, comments, and shared files.",
      },
      {
        label: "Renewal planner",
        description: "Visual runway with owners and handoffs.",
      },
    ],
  },
];

export default function Landing() {
  const [activeRoute, setActiveRoute] = useState(routes[0].id);
  const currentRoute = routes.find((route) => route.id === activeRoute) ?? routes[0];

  return (
    <div className="page">
      <section className="hero">
        <div className="shell hero-shell">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="kicker hero-kicker">Procurement Manager</span>
              <h1 className="hero-title">Procurement operations, composed and ready</h1>
              <p className="hero-description">
                Procurement Manager distills intake, approvals, and supplier health into a precise, executive-ready workspace
                your team works out of daily.
              </p>
              <div className="hero-actions">
                <a className="hero-link" href="#routes">
                  Review operating routes
                </a>
              </div>
              <div className="hero-metrics">
                {stats.map((stat) => (
                  <div className="hero-metric" key={stat.label}>
                    <span className="hero-metric-value">{stat.value}</span>
                    <span className="hero-metric-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <aside className="hero-card" aria-label="Daily briefing">
              <div className="hero-card-header">
                <span className="kicker hero-card-kicker">{briefing.title}</span>
                <p className="hero-card-focus">{briefing.focus}</p>
              </div>
              <div className="hero-card-grid">
                {briefing.updates.map((item) => (
                  <div className="hero-card-item" key={item.label}>
                    <span className="hero-card-label">{item.label}</span>
                    <span className="hero-card-value">{item.value}</span>
                  </div>
                ))}
              </div>
              <ul className="hero-card-list">
                {briefing.reminders.map((reminder) => (
                  <li key={reminder}>{reminder}</li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <section className="preview" aria-labelledby="preview-heading">
        <div className="shell">
          <div className="section-heading">
            <span className="kicker">Preview</span>
            <h2 id="preview-heading">What the team sees at a glance</h2>
            <p>
              Procurement Manager opens to a composed overview of the work that matters. No feature tours—just the signal your team
              needs.
            </p>
          </div>
          <div className="preview-grid">
            {highlights.map((highlight) => (
              <div className="preview-card" key={highlight.title}>
                <h3>{highlight.title}</h3>
                <p>{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="routes" id="routes" aria-labelledby="routes-heading">
        <div className="shell">
          <div className="section-heading">
            <span className="kicker">Operating routes</span>
            <h2 id="routes-heading">Choose the view that matches your role</h2>
            <p>
              Switch between routes to reveal curated priorities, signals, and references for each stakeholder inside Procurement
              Manager.
            </p>
          </div>
          <div className="route-controls">
            <div className="tablist" role="tablist" aria-label="Procurement routes">
              {routes.map((route) => {
                const tabId = `route-${route.id}`;
                const panelId = `route-panel-${route.id}`;
                const isActive = activeRoute === route.id;

                return (
                  <button
                    key={route.id}
                    id={tabId}
                    className={`tab-button${isActive ? " is-active" : ""}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={panelId}
                    onClick={() => setActiveRoute(route.id)}
                  >
                    {route.label}
                  </button>
                );
              })}
            </div>
            <label className="route-select-label" htmlFor="route-select">
              <span className="sr-only">Select procurement route</span>
              <select
                id="route-select"
                className="route-select"
                value={activeRoute}
                onChange={(event) => setActiveRoute(event.target.value)}
              >
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div
            className="route-panel"
            role="tabpanel"
            id={`route-panel-${currentRoute.id}`}
            aria-labelledby={`route-${currentRoute.id}`}
          >
            <div className="route-panel-header">
              <span className="panel-kicker">{currentRoute.title}</span>
              <h3>{currentRoute.headline}</h3>
              <p>{currentRoute.description}</p>
            </div>
            <div className="route-markers">
              {currentRoute.markers.map((marker) => (
                <div className="marker-card" key={marker.label}>
                  <span className="marker-label">{marker.label}</span>
                  <p>{marker.detail}</p>
                </div>
              ))}
            </div>
            <div className="route-columns">
              <div className="route-block">
                <h4>Today's agenda</h4>
                <ul className="panel-list">
                  {currentRoute.agenda.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="route-block">
                <h4>Key resources</h4>
                <ul className="resource-list">
                  {currentRoute.resources.map((resource) => (
                    <li key={resource.label}>
                      <div className="resource-card">
                        <span className="resource-title">{resource.label}</span>
                        <p>{resource.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="contact" aria-labelledby="contact-heading">
        <div className="shell">
          <div className="contact-card">
            <div>
              <span className="kicker">Operations desk</span>
              <h3 id="contact-heading">Need a tailored variation?</h3>
            </div>
            <p>
              Partner with the procurement operations desk to configure additional views, workflows, or integrations without losing
              the clarity of this command surface.
            </p>
            <div className="contact-meta">
              <span className="contact-email">operations@procurementmanager.com</span>
              <span className="contact-sla">Same-day response window</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
