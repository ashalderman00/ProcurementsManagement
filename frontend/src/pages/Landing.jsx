import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../lib/api';

const navLinks = [
  { label: 'Overview', href: '#overview' },
  { label: 'Focus', href: '#focus' },
  { label: 'Work orders', href: '#work-order' },
  { label: 'Roles', href: '#roles' },
  { label: 'Access', href: '#access' },
];

const HERO_METRIC_TEMPLATE = [
  { label: 'Spend under management', value: '$0' },
  { label: 'Median cycle time', value: '—' },
  { label: 'Policy adherence', value: '—' },
];

const FOCUS_TEMPLATE = [
  {
    label: 'New intake',
    value: '0 requests',
    meta: 'Live metrics will appear once workspace data syncs.',
  },
  {
    label: 'Approvals today',
    value: '0 decisions',
    meta: 'Approvers will show here once activity starts.',
  },
  {
    label: 'Renewals in 30 days',
    value: '0 vendors',
    meta: 'Renewal alerts populate after the first approvals.',
  },
];

const WORKSPACE_STREAMS = [
  {
    title: 'Intake triage',
    summary: 'Keep new submissions moving by clarifying scope and assigning owners.',
    points: [
      'Review the intake queue and respond to questions from requesters.',
      'Surface preferred suppliers or pricing to reduce turnaround time.',
      'Export the pipeline to share demand levels with stakeholders.',
    ],
  },
  {
    title: 'Approval execution',
    summary: 'Track pending approvals and document policy decisions in-line.',
    points: [
      'Use the approval brief to confirm budget, risk, and contract context.',
      'Log comments or conditions directly in the request thread.',
      'Notify owners when a stage is blocked or requires escalation.',
    ],
  },
  {
    title: 'Supplier lifecycle',
    summary: 'Manage work orders, contracts, and scorecards from each vendor record.',
    points: [
      'Attach contracts and security responses to the vendor dossier.',
      'Assign renewal owners and confirm reminders are in place.',
      'Record fulfilment notes so quarterly reviews stay accurate.',
    ],
  },
];

const WORK_ORDER_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const ROLE_VIEW_TEMPLATE = [
  {
    id: 'admin',
    label: 'Admin',
    headline: 'Keep automations and access running',
    summary:
      'Admins review integrations, automation runs, and access changes so the workspace stays reliable.',
    responsibilities: [
      'Resolve automation or sync failures before the business day begins.',
      'Audit ERP, HRIS, and SSO connections for drift or stale mappings.',
      'Document configuration changes and share updates with stakeholders.',
    ],
    cadence: [
      'Daily: clear automation warnings and confirm backups.',
      'Weekly: align with security on access adjustments.',
      'Quarterly: certify retention and archival policies.',
    ],
    tools: ['Automation monitor', 'Configuration register', 'Access review'],
  },
  {
    id: 'finance',
    label: 'Finance',
    headline: 'Control spend with live numbers',
    summary:
      'Finance partners validate budgets, track commitments, and surface savings opportunities.',
    responsibilities: [
      'Validate cost centre and GL coding on each submission.',
      'Review variance drivers with budget owners and update forecasts.',
      'Track committed spend and accruals from the live ledger.',
    ],
    cadence: [
      'Daily: clear approvals that meet policy guardrails.',
      'Weekly: reconcile commitments against accounting.',
      'Monthly: review renewal savings opportunities.',
    ],
    tools: ['Commitments ledger', 'Approval console', 'Variance brief'],
  },
  {
    id: 'buyer',
    label: 'Buyer',
    headline: 'Drive sourcing and supplier work',
    summary:
      'Buyers coordinate diligence, negotiations, and vendor updates from a shared workspace.',
    responsibilities: [
      'Keep request status current with supplier and stakeholder actions.',
      'Coordinate legal, security, and data reviews in the dossier.',
      'Capture performance notes for supplier business reviews.',
    ],
    cadence: [
      'Daily: update progress and outstanding tasks.',
      'Weekly: sync with finance on leverage and savings.',
      'Quarterly: refresh preferred supplier recommendations.',
    ],
    tools: ['Sourcing workroom', 'Supplier directory', 'Document vault'],
  },
  {
    id: 'approver',
    label: 'Approver',
    headline: 'Decide quickly with context',
    summary:
      'Approvers use concise briefs—budget, risk, legal status—to make decisions fast and transparently.',
    responsibilities: [
      'Review the approval brief and flag follow-ups inside the record.',
      'Ensure delegation coverage before travel or quarter-close.',
      'Log conditions for procurement to operationalise.',
    ],
    cadence: [
      'Daily: clear pending approvals grouped by priority.',
      'Weekly: sync with procurement on escalations.',
      'Quarterly: refresh delegation rules and playbooks.',
    ],
    tools: ['Approval brief', 'Policy library', 'Delegation planner'],
  },
  {
    id: 'requester',
    label: 'Requester',
    headline: 'Submit work with clarity',
    summary:
      'Requesters provide context, attach documentation, and monitor progress without extra follow-up.',
    responsibilities: [
      'Complete guided intake with supporting documents and stakeholders.',
      'Respond quickly to questions from procurement or security.',
      'Plan renewals early with reminders and budget coordination tools.',
    ],
    cadence: [
      'Before spend: start intake and confirm budgets.',
      'During review: stay active in the request thread.',
      'Post approval: confirm delivery and share feedback.',
    ],
    tools: ['Guided request', 'Tracking board', 'Renewal planner'],
  },
];

function cloneRoleTemplate() {
  return ROLE_VIEW_TEMPLATE.map((role) => normalizeRoleView(role)).filter(Boolean);
}

function normalizeRoleView(role) {
  if (!role) return null;
  const id = asTrimmedString(role.id) || asTrimmedString(role.role_id);
  const label = asTrimmedString(role.label);
  if (!id || !label) return null;

  const headline = asTrimmedString(role.headline) || label;
  const summary = asTrimmedString(role.summary);
  const responsibilities = Array.isArray(role.responsibilities)
    ? role.responsibilities.map(asTrimmedString).filter(Boolean)
    : [];
  const cadence = Array.isArray(role.cadence)
    ? role.cadence.map(asTrimmedString).filter(Boolean)
    : [];
  const tools = Array.isArray(role.tools)
    ? role.tools.map(asTrimmedString).filter(Boolean)
    : [];

  return {
    id,
    label,
    headline,
    summary,
    responsibilities,
    cadence,
    tools,
  };
}

function asTrimmedString(value) {
  if (typeof value === 'string') return value.trim();
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

const initialWorkOrderState = {
  title: '',
  details: '',
  requesterName: '',
  requesterEmail: '',
  priority: 'normal',
  dueDate: '',
};

export default function Landing() {
  const [heroMetrics, setHeroMetrics] = useState(HERO_METRIC_TEMPLATE);
  const [focusSignals, setFocusSignals] = useState(FOCUS_TEMPLATE);
  const [roleViews, setRoleViews] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [landingDataError, setLandingDataError] = useState(false);
  const [usingFallbackRoles, setUsingFallbackRoles] = useState(false);
  const [usingFallbackMetrics, setUsingFallbackMetrics] = useState(true);
  const [usingFallbackSignals, setUsingFallbackSignals] = useState(true);

  const [workOrderForm, setWorkOrderForm] = useState(initialWorkOrderState);
  const [workOrderSubmitting, setWorkOrderSubmitting] = useState(false);
  const [workOrderFeedback, setWorkOrderFeedback] = useState({ type: 'idle', message: '' });

  useEffect(() => {
    let ignore = false;
    async function loadLanding() {
      try {
        const data = await apiGet('/api/marketing/landing');
        if (ignore) return;

        const heroSource = Array.isArray(data.heroMetrics)
          ? data.heroMetrics.filter(Boolean)
          : [];
        if (heroSource.length) {
          setHeroMetrics(heroSource);
          setUsingFallbackMetrics(false);
        } else {
          setHeroMetrics(HERO_METRIC_TEMPLATE);
          setUsingFallbackMetrics(true);
        }

        const focusSource = Array.isArray(data.focusSignals)
          ? data.focusSignals.filter(Boolean)
          : [];
        if (focusSource.length) {
          setFocusSignals(focusSource);
          setUsingFallbackSignals(false);
        } else {
          setFocusSignals(FOCUS_TEMPLATE);
          setUsingFallbackSignals(true);
        }

        const rolesSource = Array.isArray(data.roleViews) ? data.roleViews : [];
        const normalizedRoles = rolesSource.map((role) => normalizeRoleView(role)).filter(Boolean);
        if (normalizedRoles.length) {
          setRoleViews(normalizedRoles);
          setUsingFallbackRoles(false);
        } else {
          setRoleViews(cloneRoleTemplate());
          setUsingFallbackRoles(true);
        }

        setLandingDataError(false);
      } catch (error) {
        if (ignore) return;
        console.error('Failed to load landing data', error);
        setHeroMetrics(HERO_METRIC_TEMPLATE);
        setFocusSignals(FOCUS_TEMPLATE);
        setRoleViews(cloneRoleTemplate());
        setUsingFallbackRoles(true);
        setUsingFallbackMetrics(true);
        setUsingFallbackSignals(true);
        setLandingDataError(true);
      }
    }
    loadLanding();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!roleViews.length) {
      if (selectedRole !== null) {
        setSelectedRole(null);
      }
      return;
    }
    const hasMatch = roleViews.some((role) => role.id === selectedRole);
    if (!hasMatch) {
      setSelectedRole(roleViews[0].id);
    }
  }, [roleViews, selectedRole]);

  const activeRole =
    roleViews.find((role) => role.id === selectedRole) ?? (roleViews.length ? roleViews[0] : null);
  const roleHelperId = usingFallbackRoles ? 'role-helper-text' : undefined;
  const heroNoticeId = landingDataError || usingFallbackMetrics ? 'hero-metric-helper' : undefined;
  const heroFocusHelperId = usingFallbackSignals ? 'hero-focus-helper' : undefined;
  const focusGridHelperId = usingFallbackSignals ? 'focus-grid-helper' : undefined;

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
      }).format(new Date()),
    []
  );

  const workOrderIsValid = useMemo(() => {
    return (
      workOrderForm.title.trim() &&
      workOrderForm.requesterName.trim() &&
      workOrderForm.requesterEmail.trim()
    );
  }, [workOrderForm]);

  function handleWorkOrderChange(event) {
    const { name, value } = event.target;
    setWorkOrderForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleWorkOrderSubmit(event) {
    event.preventDefault();
    if (workOrderSubmitting || !workOrderIsValid) return;
    setWorkOrderSubmitting(true);
    setWorkOrderFeedback({ type: 'idle', message: '' });
    try {
      const payload = {
        title: workOrderForm.title.trim(),
        details: workOrderForm.details.trim() ? workOrderForm.details.trim() : null,
        requesterName: workOrderForm.requesterName.trim(),
        requesterEmail: workOrderForm.requesterEmail.trim(),
        priority: workOrderForm.priority,
        dueDate: workOrderForm.dueDate ? workOrderForm.dueDate : null,
      };
      const created = await apiPost('/api/work-orders', payload);
      setWorkOrderFeedback({
        type: 'success',
        message: `Work order #${created.id} submitted. Procurement will follow up shortly.`,
      });
      setWorkOrderForm(initialWorkOrderState);
    } catch (error) {
      console.error('work-order.submit.failed', error);
      setWorkOrderFeedback({
        type: 'error',
        message: 'We could not submit the work order. Try again or email procurement@demo.co.',
      });
    } finally {
      setWorkOrderSubmitting(false);
    }
  }

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
          <div className="nav-actions">
            <a className="nav-link" href="/login">
              Sign in
            </a>
            <a className="nav-cta" href="/signup">
              Create account
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="overview" aria-labelledby="overview-heading">
          <div className="shell hero-shell">
            <div className="hero-layout">
              <div className="hero-copy">
                <span className="hero-eyebrow">Operations hub</span>
                <h1 className="hero-title" id="overview-heading">
                  Procurement workspace
                </h1>
                <p className="hero-description">
                  Manage intake, approvals, vendors, and work orders without juggling different tools.
                </p>
                <div className="hero-actions">
                  <a className="button primary" href="/app">
                    Open workspace
                  </a>
                  <a className="button outline" href="#work-order">
                    Submit work order
                  </a>
                </div>
              </div>
              <div className="hero-pane">
                <article className="brief-card">
                  <header className="brief-header">
                    <div>
                      <span className="brief-title">Today's checkpoints</span>
                      <span className="brief-date">{todayLabel}</span>
                    </div>
                  </header>
                  <ul className="brief-list" aria-describedby={heroFocusHelperId}>
                    {focusSignals.slice(0, 3).map((signal) => (
                      <li className="brief-item" key={signal.label}>
                        <span className="brief-label">{signal.label}</span>
                        <span className="brief-value">{signal.value}</span>
                        {signal.meta ? <span className="brief-meta">{signal.meta}</span> : null}
                      </li>
                    ))}
                  </ul>
                  <p className="brief-foot" aria-live="polite" id={heroFocusHelperId}>
                    {usingFallbackSignals
                      ? 'Live focus signals will appear once workspace data syncs.'
                      : 'Use the focus queue to keep work moving forward.'}
                  </p>
                </article>
              </div>
            </div>
            <dl className="hero-metrics" aria-live="polite" aria-describedby={heroNoticeId}>
              {heroMetrics.map((metric) => (
                <div className="metric" key={metric.label}>
                  <dt>{metric.value}</dt>
                  <dd>{metric.label}</dd>
                </div>
              ))}
            </dl>
            {heroNoticeId ? (
              <p id={heroNoticeId} className="fallback-helper" aria-live="polite">
                {landingDataError
                  ? "Live workspace metrics couldn't load, so you're seeing the standard benchmarks."
                  : 'Live workspace metrics are still syncing—showing standard benchmarks for now.'}
              </p>
            ) : null}
          </div>
        </section>

        <section className="program" id="streams" aria-labelledby="streams-heading">
          <div className="shell">
            <div className="section-heading">
              <span className="kicker">Workspace streams</span>
              <h2 id="streams-heading">Where to spend your time</h2>
              <p>These workflows keep procurement running smoothly and help new teammates ramp fast.</p>
            </div>
            <div className="program-grid">
              {WORKSPACE_STREAMS.map((stream) => (
                <article className="program-card" key={stream.title}>
                  <h3>{stream.title}</h3>
                  <p>{stream.summary}</p>
                  <ul>
                    {stream.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="focus" id="focus" aria-labelledby="focus-heading">
          <div className="shell">
            <div className="section-heading">
              <span className="kicker">Daily focus</span>
              <h2 id="focus-heading">What needs attention right now</h2>
              <p>Review the live signals to align the team on today's priorities.</p>
            </div>
            <div className="focus-grid" aria-describedby={focusGridHelperId}>
              {focusSignals.map((signal) => (
                <article className="focus-card" key={signal.label}>
                  <h3>{signal.label}</h3>
                  <p className="focus-value">{signal.value}</p>
                  {signal.meta ? <p className="focus-meta">{signal.meta}</p> : null}
                </article>
              ))}
            </div>
            {usingFallbackSignals ? (
              <p id={focusGridHelperId} className="fallback-helper" aria-live="polite">
                Live focus signals are unavailable, so we're showing baseline guidance.
              </p>
            ) : null}
          </div>
        </section>

        <section className="work-order" id="work-order" aria-labelledby="work-order-heading">
          <div className="shell">
            <div className="section-heading">
              <span className="kicker">Submit work</span>
              <h2 id="work-order-heading">Log a new work order</h2>
              <p>Send the intake team the details needed to triage your request without email back-and-forth.</p>
            </div>
            <div className="work-order-card">
              <form className="work-order-form" onSubmit={handleWorkOrderSubmit}>
                <div className="work-order-field">
                  <label htmlFor="work-order-title">Title</label>
                  <input
                    id="work-order-title"
                    name="title"
                    type="text"
                    required
                    value={workOrderForm.title}
                    onChange={handleWorkOrderChange}
                    placeholder="Example: Security review for ACME rollout"
                  />
                </div>
                <div className="work-order-field">
                  <label htmlFor="work-order-details">Details</label>
                  <textarea
                    id="work-order-details"
                    name="details"
                    value={workOrderForm.details}
                    onChange={handleWorkOrderChange}
                    placeholder="Share scope, stakeholders, links to documents, and any deadlines."
                  />
                </div>
                <div className="work-order-field-grid">
                  <div className="work-order-field">
                    <label htmlFor="work-order-priority">Priority</label>
                    <select
                      id="work-order-priority"
                      name="priority"
                      value={workOrderForm.priority}
                      onChange={handleWorkOrderChange}
                    >
                      {WORK_ORDER_PRIORITIES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="work-order-field">
                    <label htmlFor="work-order-dueDate">Target date</label>
                    <input
                      id="work-order-dueDate"
                      name="dueDate"
                      type="date"
                      value={workOrderForm.dueDate}
                      onChange={handleWorkOrderChange}
                    />
                  </div>
                </div>
                <div className="work-order-field-grid">
                  <div className="work-order-field">
                    <label htmlFor="work-order-requesterName">Requester name</label>
                    <input
                      id="work-order-requesterName"
                      name="requesterName"
                      type="text"
                      required
                      value={workOrderForm.requesterName}
                      onChange={handleWorkOrderChange}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="work-order-field">
                    <label htmlFor="work-order-requesterEmail">Requester email</label>
                    <input
                      id="work-order-requesterEmail"
                      name="requesterEmail"
                      type="email"
                      required
                      value={workOrderForm.requesterEmail}
                      onChange={handleWorkOrderChange}
                      placeholder="you@company.com"
                    />
                  </div>
                </div>
                {workOrderFeedback.message ? (
                  <p
                    className={`form-feedback ${
                      workOrderFeedback.type === 'success'
                        ? 'success'
                        : workOrderFeedback.type === 'error'
                        ? 'error'
                        : ''
                    }`}
                    role="status"
                  >
                    {workOrderFeedback.message}
                  </p>
                ) : null}
                <div className="work-order-actions">
                  <button
                    className="button primary"
                    type="submit"
                    disabled={!workOrderIsValid || workOrderSubmitting}
                  >
                    {workOrderSubmitting ? 'Submitting…' : 'Submit work order'}
                  </button>
                </div>
              </form>
              <aside className="work-order-hints">
                <h3>What happens next</h3>
                <ul>
                  <li>Procurement triages the work order and assigns an owner.</li>
                  <li>Updates post directly to the request so everyone stays aligned.</li>
                  <li>You'll get an email notification when the status changes.</li>
                </ul>
                <p className="work-order-meta">
                  Need help? Email <a href="mailto:procurement@demo.co">procurement@demo.co</a>.
                </p>
              </aside>
            </div>
          </div>
        </section>

        <section className="roles" id="roles" aria-labelledby="roles-heading">
          <div className="shell">
            <div className="section-heading">
              <span className="kicker">Role handbook</span>
              <h2 id="roles-heading">Choose your view of Procurement Manager</h2>
              <p>Select a role to see responsibilities, cadence, and the workspaces each team uses daily.</p>
            </div>
            <div className="role-selector">
              <label className="role-label" htmlFor="role-select">
                Role
              </label>
              <select
                id="role-select"
                className="role-select"
                value={selectedRole ?? ''}
                onChange={(event) => setSelectedRole(event.target.value ? event.target.value : null)}
                disabled={!roleViews.length}
                aria-describedby={roleHelperId}
              >
                {roleViews.length === 0 ? (
                  <option value="">Live data loading…</option>
                ) : (
                  roleViews.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.label}
                    </option>
                  ))
                )}
              </select>
            </div>
            {usingFallbackRoles ? (
              <p className="role-helper" id={roleHelperId} aria-live="polite">
                {landingDataError
                  ? "Live workspace data couldn't load, so you're seeing the standard program playbook."
                  : 'Live workspace data is still syncing—here is the standard program playbook for quick reference.'}
              </p>
            ) : null}
            <article className="role-panel" aria-live="polite">
              {activeRole ? (
                <>
                  <div className="role-header">
                    <h3>{activeRole.headline}</h3>
                    {activeRole.summary ? <p>{activeRole.summary}</p> : null}
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
                </>
              ) : (
                <div className="role-header">
                  <h3>Live role handbook unavailable</h3>
                  <p>
                    {landingDataError
                      ? "We couldn't load role guidance from the workspace. Try refreshing."
                      : 'Role guidance will appear once live data loads.'}
                  </p>
                </div>
              )}
            </article>
          </div>
        </section>

        <section className="access" id="access" aria-labelledby="access-heading">
          <div className="shell">
            <div className="section-heading">
              <span className="kicker">Access & onboarding</span>
              <h2 id="access-heading">Get into Procurement Manager</h2>
              <p>
                Share these steps with teammates joining the workspace so they can submit work orders and manage requests on day
                one.
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
                    step.action.tone === 'link' ? (
                      <a className="text-link" href={step.action.href}>
                        {step.action.label}
                      </a>
                    ) : (
                      <a
                        className={`button ${step.action.tone === 'outline' ? 'outline' : 'primary'}`}
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

const accessSteps = [
  {
    title: 'Create your account',
    description:
      'Use your company email to create a Procurement Manager account. Access is governed through SSO.',
    meta: 'Self-serve',
    action: { label: 'Create account', href: '/signup', tone: 'primary' },
  },
  {
    title: 'Sign in securely',
    description:
      'Sign in from any managed device using single sign-on. Multi-factor authentication is enforced by default.',
    meta: 'SSO',
    action: { label: 'Sign in', href: '/login', tone: 'outline' },
  },
  {
    title: 'Review intake checklist',
    description:
      'Align requesters on the budget, risk, and rollout details Procurement expects before they submit.',
    meta: 'Shared resource',
    action: {
      label: 'Open checklist',
      href: '/resources/intake-checklist',
      tone: 'link',
    },
  },
];
