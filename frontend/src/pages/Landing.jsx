import { useState } from "react";

const stats = [
  { label: "Requests in flight", value: "24" },
  { label: "Approvals pending", value: "6" },
  { label: "Renewals this quarter", value: "8" },
  { label: "Budget coverage", value: "97%" },
];

const focus = [
  "Finalize Helios CRM renewal with Finance before the 3:00 PM freeze.",
  "Align Nova Analytics security questionnaire responses with IT.",
  "Draft scorecard talking points for Monday's supplier QBRs.",
];

const briefing = {
  date: "Wednesday, 17 July",
  focus:
    "Morning priorities focus on quarter close approvals and prepping supplier reviews. Share blockers in #procurement-ops before stand-up.",
  items: [
    { label: "Approvals", value: "6 awaiting signature" },
    { label: "Sourcing", value: "3 events collaborating" },
    { label: "Renewals", value: "8 inside 90-day window" },
  ],
  reminders: [
    "Send executive digest by 4:00 PM for Finance leadership.",
    "Upload Nova Analytics security questionnaire for Security.",
    "Log supplier feedback from marketing offsite in the directory.",
  ],
};

const roles = [
  {
    id: "admin",
    name: "Admin",
    summary:
      "Keep the workspace aligned with policy, security, and integrations so teams can trust every update.",
    focus: [
      "Review overnight automation logs and reassign any exceptions.",
      "Publish workflow changes to the announcement banner before 10:00 AM.",
      "Confirm ERP and CLM syncs completed successfully for yesterday's approvals.",
    ],
    checklist: [
      "Access requests: 3 awaiting provisioning.",
      "Automation health: no failures in the last 24 hours.",
      "Data exports: schedule Q3 snapshot for Friday.",
    ],
    resources: [
      { title: "Workspace settings", description: "Manage routing rules, intake paths, and risk controls." },
      { title: "Integration monitor", description: "View ERP & CLM sync history and upcoming pushes." },
      { title: "Release notes", description: "Share weekly updates so every role knows what changed." },
    ],
    notes: "Use the /ops Slack command to capture urgent configuration changes during off-hours.",
  },
  {
    id: "finance",
    name: "Finance",
    summary:
      "Track commitments against plan, steward approvals, and keep budget owners informed without chasing updates.",
    focus: [
      "Validate funding coverage for new intake before the month-end freeze.",
      "Review forecast variance on high-impact purchases with business partners.",
      "Watch renewal negotiations for shifts that affect accruals.",
    ],
    checklist: [
      "Pending approvals: 3 requests over $50k due today.",
      "Forecast: Q3 outlook refreshed this morning.",
      "Renewal watchlist: 2 items flagged for negotiation support.",
    ],
    resources: [
      { title: "Budget dashboard", description: "Live view of spend commitments and variance by cost center." },
      { title: "Approval console", description: "Assess capital vs. operating budgets with contract context." },
      { title: "Renewal calendar", description: "Coordinate early with budget owners on 90-day horizons." },
    ],
    notes: "Share escalation notes in the #finance-approvals channel for executive visibility.",
  },
  {
    id: "buyer",
    name: "Buyer",
    summary:
      "Coordinate sourcing cycles, supplier onboarding, and negotiation outcomes so stakeholders stay confident.",
    focus: [
      "Progress open sourcing events with clear owner updates.",
      "Capture negotiation outcomes and attach supporting documents.",
      "Share supplier performance notes ahead of quarterly reviews.",
    ],
    checklist: [
      "Active sourcing: 5 events with milestones due this week.",
      "Supplier onboarding: 2 packages waiting on tax documentation.",
      "Risk follow-ups: Security review pending for Nova Analytics.",
    ],
    resources: [
      { title: "Sourcing workspace", description: "Track milestones, tasks, and decision logs in one place." },
      { title: "Supplier directory", description: "Profiles, contacts, and performance indicators." },
      { title: "Document vault", description: "Templates and executed agreements for quick reuse." },
    ],
    notes: "Log call notes directly on the supplier record to keep Finance in sync.",
  },
  {
    id: "approver",
    name: "Approver",
    summary:
      "Review requests with context from Finance, Security, and Legal so decisions happen quickly and transparently.",
    focus: [
      "Check today's queue sorted by due date before noon.",
      "Leave guidance inline so requesters know how to proceed.",
      "Confirm compliance with policy thresholds and risk posture.",
    ],
    checklist: [
      "Approvals due today: 4 awaiting signature.",
      "Policy reminder: Travel over $25k requires CFO tag.",
      "Escalations: none reported overnight.",
    ],
    resources: [
      { title: "Approval console", description: "Budget, risk, and contract context in one review screen." },
      { title: "Policy library", description: "Search guardrails by category or spend threshold." },
      { title: "Delegation settings", description: "Assign coverage when you're out of office." },
    ],
    notes: "Use the approve-and-comment action when conditions apply so the requester captures next steps.",
  },
  {
    id: "requester",
    name: "Requester",
    summary:
      "Start new purchases, monitor progress, and prepare renewals with clarity on next steps.",
    focus: [
      "Submit intake forms with business impact and funding details.",
      "Respond quickly to clarifications from Procurement or Security.",
      "Plan renewals 90 days out with vendor health context.",
    ],
    checklist: [
      "Requests in review: 2 awaiting procurement feedback.",
      "Outstanding documents: Upload the Helios CRM security checklist.",
      "Renewal planner: Marketing automation contract due in 75 days.",
    ],
    resources: [
      { title: "Start a request", description: "Guided intake that suggests preferred suppliers and templates." },
      { title: "Track my requests", description: "Real-time updates, comments, and file sharing." },
      { title: "Renewal planner", description: "Timeline and owners for recurring spend commitments." },
    ],
    notes: "Bookmark the intake guide to confirm which data points speed up reviews.",
  },
];

const toneStyles = {
  good: "border-emerald-200/70 bg-emerald-50 text-emerald-700",
  caution: "border-amber-200/80 bg-amber-50 text-amber-800",
  neutral: "border-slate-200/80 bg-slate-100 text-slate-600",
};

const workstreams = [
  {
    name: "Intake & triage",
    owner: "Procurement desk",
    status: "On track",
    tone: "good",
    summary: "24 active requests • 5 awaiting clarification from requesters.",
    checklist: [
      "Publish daily queue snapshot after the 9:30 AM stand-up.",
      "Review automation exceptions flagged overnight.",
      "Highlight any critical vendor shifts in the announcements banner.",
    ],
    next: "Daily stand-up at 9:30 AM with Procurement & Finance.",
  },
  {
    name: "Sourcing & evaluation",
    owner: "Buyers & stakeholders",
    status: "Needs attention",
    tone: "caution",
    summary: "3 sourcing events approaching decision deadlines this week.",
    checklist: [
      "Finalize data warehouse RFP scoring with Analytics.",
      "Review renewal pricing for Helios CRM with Legal.",
      "Confirm stakeholder attendance for Thursday's negotiation review.",
    ],
    next: "Commercial review with Finance and Legal on Thursday at 2:00 PM.",
  },
  {
    name: "Approvals & contracting",
    owner: "Approvers & Legal",
    status: "In motion",
    tone: "neutral",
    summary: "6 approvals waiting for executive signatures • 2 contracts redlining.",
    checklist: [
      "Confirm CFO coverage for requests over $250k.",
      "Update PO numbers for completed negotiations.",
      "Log redline status updates for shared visibility.",
    ],
    next: "Legal office hours today at 2:00 PM for quick reviews.",
  },
  {
    name: "Supplier care",
    owner: "Admin & Buyers",
    status: "Stable",
    tone: "good",
    summary: "Top 10 supplier scorecards drafted • zero high-risk incidents.",
    checklist: [
      "Publish security attestation reminders to upcoming renewals.",
      "Log Q2 support escalations for follow-up actions.",
      "Confirm QBR deck inputs with Operations by Friday.",
    ],
    next: "Supplier risk workshop scheduled for Tuesday at 11:00 AM.",
  },
];

const rhythm = [
  {
    title: "Intake",
    description: "Requesters select the right path with conditional questions so Procurement receives complete context upfront.",
  },
  {
    title: "Align",
    description: "Procurement triages, assigns owners, and invites Finance, IT, Security, and Legal in one shared workspace.",
  },
  {
    title: "Decide",
    description: "Approvers review budgets, risk, and contract details without leaving the workflow and capture rationale.",
  },
  {
    title: "Close & learn",
    description: "Finance finalizes POs, renewals are scheduled, and insights roll into dashboards for steering committees.",
  },
];

const guides = [
  {
    title: "Daily start checklist",
    description: "Spend five minutes reviewing dashboards, clearing intake, and syncing on blockers before the stand-up.",
    audience: "All roles",
    time: "5 min read",
    location: "Guides › Daily ritual",
  },
  {
    title: "Submitting a request",
    description: "Ensure business impact, funding, and stakeholder details are captured so approvals move smoothly.",
    audience: "Requesters",
    time: "3 min read",
    location: "Guides › Intake",
  },
  {
    title: "Approving with context",
    description: "Review policy thresholds, vendor risk, and spend coverage quickly with inline recommendations.",
    audience: "Approvers",
    time: "4 min read",
    location: "Guides › Decision making",
  },
  {
    title: "Managing renewals",
    description: "Build 90-day plans with suppliers, align budget owners, and capture negotiation notes for the next cycle.",
    audience: "Buyers & Finance",
    time: "6 min read",
    location: "Guides › Renewals",
  },
];

const resources = [
  {
    title: "Policy center",
    description: "All procurement policies, thresholds, and RACI charts in one searchable space.",
    tag: "Reference",
  },
  {
    title: "Operational calendar",
    description: "Month-by-month view of stand-ups, reviews, renewals, and executive touchpoints.",
    tag: "Schedule",
  },
  {
    title: "Supplier scorecards",
    description: "Latest QBR insights, health indicators, and action items per supplier.",
    tag: "Suppliers",
  },
  {
    title: "Analytics hub",
    description: "Spend, savings, and compliance dashboards with drill-down filters by business unit.",
    tag: "Insights",
  },
];

export default function Landing() {
  const [activeRoleId, setActiveRoleId] = useState(roles[0].id);
  const activeRole = roles.find((role) => role.id === activeRoleId) ?? roles[0];

  return (
    <div className="min-h-screen flex flex-col bg-page text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/70 backdrop-blur-lg">
        <div className="shell flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="brand-mark">PM</div>
            <span className="font-semibold text-lg tracking-tight">Procurement Manager</span>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-7">
            <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
              <a href="#overview" className="hover:text-slate-900 transition">
                Overview
              </a>
              <a href="#roles" className="hover:text-slate-900 transition">
                Roles
              </a>
              <a href="#workstreams" className="hover:text-slate-900 transition">
                Workstreams
              </a>
              <a href="#guides" className="hover:text-slate-900 transition">
                Guides
              </a>
              <a href="#resources" className="hover:text-slate-900 transition">
                Resources
              </a>
            </nav>
            <div className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              <label htmlFor="roleView" className="pl-0.5">
                Role view
              </label>
              <select
                id="roleView"
                value={activeRoleId}
                onChange={(event) => setActiveRoleId(event.target.value)}
                className="min-w-[200px] rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium tracking-normal text-slate-700 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section id="overview" className="hero relative overflow-hidden">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-orb hero-orb--one" aria-hidden="true" />
          <div className="hero-orb hero-orb--two" aria-hidden="true" />

          <div className="shell relative z-10 py-20 lg:py-24">
            <div className="grid gap-16 lg:grid-cols-[1.1fr,1fr] items-start">
              <div>
                <div className="tag">Procurement Manager workspace</div>
                <h1 className="section-title text-slate-900 mt-6">
                  Control center for procurement operations
                </h1>
                <p className="section-lead mt-5 text-slate-600 max-w-2xl">
                  Keep Finance, Buyers, Approvers, Admins, and Requesters aligned with a shared plan of record and clear daily priorities.
                </p>
                <FocusList items={focus} />
                <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {stats.map((stat) => (
                    <Metric key={stat.label} k={stat.label} v={stat.value} />
                  ))}
                </div>
              </div>

              <DailyBrief briefing={briefing} />
            </div>
          </div>
        </section>

        <section id="roles" className="section">
          <div className="shell">
            <SectionHeading
              title="Switch to the view that matches your role"
              lead="Each seat has a tailored checklist, focus areas, and quick links so every team member can pick up exactly where they left off."
            />
            <div className="mt-8">
              <label
                htmlFor="roleViewSection"
                className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400"
              >
                Role view
              </label>
              <select
                id="roleViewSection"
                value={activeRoleId}
                onChange={(event) => setActiveRoleId(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 md:w-80"
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <RoleDetail role={activeRole} />
          </div>
        </section>

        <section id="workstreams" className="section bg-slate-100/60">
          <div className="shell grid gap-12 lg:grid-cols-[1.2fr,0.8fr] items-start">
            <div>
              <SectionHeading
                title="Current workstreams at a glance"
                lead="Use these snapshots to understand workload, where support is needed, and the next checkpoints across the team."
              />
              <div className="mt-10 space-y-6">
                {workstreams.map((stream) => (
                  <WorkstreamCard key={stream.name} {...stream} />
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-xl shadow-slate-900/10 backdrop-blur-sm lg:p-8">
              <h3 className="text-lg font-semibold text-slate-900">Procurement rhythm</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Share this overview with new teammates or stakeholders so they know what to expect from intake through renewal.
              </p>
              <div className="mt-6 space-y-4">
                {rhythm.map((step, index) => (
                  <RhythmStep key={step.title} index={index + 1} {...step} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="guides" className="section">
          <div className="shell">
            <SectionHeading
              title="How to use Procurement Manager"
              lead="Quick references curated for each team reinforce the workflow without overwhelming detail."
            />
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {guides.map((guide) => (
                <GuideCard key={guide.title} {...guide} />
              ))}
            </div>
          </div>
        </section>

        <section id="resources" className="section bg-slate-50/80">
          <div className="shell">
            <SectionHeading
              title="Reference library"
              lead="Bookmark these core spaces to reach policies, analytics, and supplier insights in seconds."
              align="center"
            />
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {resources.map((resource) => (
                <ResourceCard key={resource.title} {...resource} />
              ))}
            </div>
          </div>
        </section>

        <section className="section pt-0">
          <div className="shell">
            <div className="rounded-3xl border border-slate-900/20 bg-slate-900 px-8 py-8 text-white shadow-2xl shadow-slate-900/30 lg:flex lg:items-center lg:justify-between lg:gap-12">
              <div className="max-w-xl">
                <h3 className="text-xl font-semibold">Need to escalate or share feedback?</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  Operations monitors the workspace throughout the day. Reach out if you hit a blocker or want to suggest an improvement.
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-3 text-sm lg:mt-0 lg:items-end">
                <a
                  href="mailto:operations@procurementmanager.com"
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-semibold text-white transition hover:bg-white/15"
                >
                  operations@procurementmanager.com
                </a>
                <span className="text-white/60">Slack: #procurement-ops</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur">
        <div className="shell py-6 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Procurement Manager Workspace. Internal use only.</span>
          <span className="flex gap-4">
            <a href="/runbook" className="hover:underline">
              Runbook
            </a>
            <a href="/status" className="hover:underline">
              System status
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

function FocusList({ items }) {
  return (
    <div className="mt-8 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Today's focus</p>
      <ul className="mt-4 space-y-3 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-slate-400/80" />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DailyBrief({ briefing }) {
  return (
    <div className="glass-panel p-6 sm:p-7 lg:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Daily brief</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{briefing.date}</p>
        </div>
        <span className="badge badge--calm">Updated 08:10</span>
      </div>
      <p className="mt-6 text-sm leading-relaxed text-slate-600">{briefing.focus}</p>
      <dl className="mt-6 space-y-3">
        {briefing.items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/75 px-4 py-3 shadow-sm shadow-slate-900/5"
          >
            <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{item.label}</dt>
            <dd className="text-sm font-medium text-slate-900">{item.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-7 rounded-2xl border border-white/60 bg-slate-900 px-5 py-4 text-white shadow-lg shadow-slate-900/25">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">Reminders</p>
        <ul className="mt-3 space-y-2 text-sm text-white/80">
          {briefing.reminders.map((note) => (
            <li key={note} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/60" />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RoleDetail({ role }) {
  return (
    <div className="mt-10 rounded-3xl border border-slate-200/80 bg-white/90 p-7 shadow-xl shadow-slate-900/10 backdrop-blur-sm md:p-9">
      <div className="flex flex-col gap-4">
        <span className="inline-flex w-max items-center rounded-full border border-slate-200/80 bg-slate-100/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          {role.name} workspace
        </span>
        <p className="text-lg font-medium text-slate-900">{role.summary}</p>
        {role.notes && (
          <p className="rounded-2xl border border-amber-200/70 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800 shadow-sm">
            {role.notes}
          </p>
        )}
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Focus today</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {role.focus.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-slate-300" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Checklist</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {role.checklist.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm shadow-slate-900/5"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Quick links</h3>
          <div className="mt-4 space-y-3">
            {role.resources.map((resource) => (
              <div
                key={resource.title}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-4 shadow-sm shadow-slate-900/5"
              >
                <p className="text-sm font-semibold text-slate-900">{resource.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{resource.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkstreamCard({ name, owner, status, tone, summary, checklist, next }) {
  const toneClass = toneStyles[tone] ?? toneStyles.neutral;

  return (
    <article className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-xl shadow-slate-900/10 backdrop-blur-sm lg:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
          <p className="text-sm text-slate-500">Lead: {owner}</p>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] shadow-sm ${toneClass}`}
        >
          {status}
        </span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">{summary}</p>
      <ul className="mt-5 space-y-3 text-sm text-slate-600">
        {checklist.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-slate-300" />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 shadow-sm shadow-slate-900/5">
        <span className="font-semibold text-slate-900">Next checkpoint:</span> {next}
      </div>
    </article>
  );
}

function RhythmStep({ index, title, description }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm shadow-slate-900/5">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
        {index}
      </div>
      <div>
        <h4 className="text-base font-semibold text-slate-900">{title}</h4>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function GuideCard({ title, description, audience, time, location }) {
  return (
    <article className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-xl shadow-slate-900/10 backdrop-blur-sm">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
        <span>{audience}</span>
        <span>{time}</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{location}</p>
    </article>
  );
}

function ResourceCard({ title, description, tag }) {
  return (
    <article className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white/95 via-white/90 to-slate-50/80 p-6 shadow-xl shadow-slate-900/10 backdrop-blur-sm">
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        {tag}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p>
    </article>
  );
}

