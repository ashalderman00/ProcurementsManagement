import { useEffect, useState } from 'react';
import { apiGet } from '../lib/api';

const navLinks = [
  { label: 'Program', href: '#program' },
  { label: 'Roles', href: '#roles' },
  { label: 'Access', href: '#access' },
];

const ROLE_VIEW_TEMPLATE = [
  {
    id: 'admin',
    label: 'Admin',
    headline: 'Keep the workspace healthy',
    summary:
      'Admins maintain automations, integrations, and access so every team works from the same source of truth.',
    responsibilities: [
      'Monitor automation runs and resolve sync failures before business hours.',
      'Audit ERP, HRIS, and SSO connections weekly for accuracy.',
      'Document configuration changes and communicate to stakeholders.',
    ],
    cadence: [
      'Daily: review the health console for warnings.',
      'Weekly: align with security on access changes.',
      'Quarterly: certify retention and archival policies.',
    ],
    tools: ['Automation monitor', 'Configuration register', 'Access review'],
  },
  {
    id: 'finance',
    label: 'Finance',
    headline: 'Steer spend with live visibility',
    summary:
      'Finance ensures budget coverage, forecasts impact, and keeps commitments aligned to plan.',
    responsibilities: [
      'Validate cost center and GL coding on new intake.',
      'Highlight variance risks and partner with budget owners.',
      'Track committed spend and accruals using the live ledger.',
    ],
    cadence: [
      'Daily: clear approvals that meet guardrails.',
      'Weekly: reconcile commitments with accounting.',
      'Monthly: review renewal savings opportunities.',
    ],
    tools: ['Commitments ledger', 'Approval console', 'Variance brief'],
  },
  {
    id: 'buyer',
    label: 'Buyer',
    headline: 'Move sourcing work forward',
    summary:
      'Buyers manage diligence, negotiations, and stakeholder updates with a single shared timeline.',
    responsibilities: [
      'Keep request status current with supplier and stakeholder actions.',
      'Coordinate legal and security deliverables in the dossier.',
      'Capture performance notes for quarterly business reviews.',
    ],
    cadence: [
      'Daily: update progress and outstanding tasks.',
      'Weekly: align with finance on leverage and savings.',
      'Quarterly: refresh preferred supplier recommendations.',
    ],
    tools: ['Sourcing workroom', 'Supplier directory', 'Document vault'],
  },
  {
    id: 'approver',
    label: 'Approver',
    headline: 'Decide quickly with context',
    summary:
      'Approvers receive a concise brief—budget, risk, legal status—so decisions are fast and defensible.',
    responsibilities: [
      'Review the approval brief and flag follow-ups inside the record.',
      'Ensure delegation coverage during travel and quarter-close.',
      'Log conditions so procurement can operationalise them.',
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
    headline: 'Submit and follow with clarity',
    summary:
      'Requesters provide business cases, respond to clarifications, and track progress without leaving the workspace.',
    responsibilities: [
      'Complete guided intake with supporting documentation and stakeholders.',
      'Respond promptly to questions from procurement or security.',
      'Plan renewals early with the reminders and budget coordination tools.',
    ],
    cadence: [
      'As needed: start intake before spend occurs.',
      'During review: stay active in the request thread.',
      'Post approval: confirm delivery and capture feedback.',
    ],
    tools: ['Guided request', 'Tracking board', 'Renewal planner'],
  },
];

function cloneRoleTemplate() {
  return ROLE_VIEW_TEMPLATE.map((role) => normalizeRoleView(role)).filter(
    Boolean
  );
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

const programPillars = [
  {
    title: 'Intake discipline',
    summary:
      'Guided intake captures business context, budgets, and risk posture before a request is routed.',
    points: [
      'Adaptive forms surface preferred suppliers and negotiated terms.',
      'Critical fields validate instantly so no rework is required.',
      'Stakeholders see a clean dossier from the first submission.',
    ],
  },
  {
    title: 'Approvals in sequence',
    summary:
      'Routing mirrors the delegation of authority so decisions move quickly without side channels.',
    points: [
      'Finance, legal, and IT collaborate in-line with full context.',
      'Exceptions and comments are preserved with the approval record.',
      'Dashboards highlight blockers before they impact the business.',
    ],
  },
  {
    title: 'Vendor lifecycle',
    summary:
      'Supplier profiles hold contracts, obligations, performance, and renewal timelines in one workspace.',
    points: [
      'Owners receive renewal runway alerts with playbooks attached.',
      'Risk and compliance attestations stay audit-ready.',
      'Quarterly business reviews are fed with live performance data.',
    ],
  },
];

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

export default function Landing() {
  const [roleViews, setRoleViews] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [landingDataError, setLandingDataError] = useState(false);
  const [usingFallbackRoles, setUsingFallbackRoles] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadLanding() {
      try {
        const data = await apiGet('/api/marketing/landing');
        if (ignore) return;
        const rolesSource = Array.isArray(data.roleViews) ? data.roleViews : [];
        const normalizedRoles = rolesSource
          .map((role) => normalizeRoleView(role))
          .filter(Boolean);
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
        setRoleViews(cloneRoleTemplate());
        setUsingFallbackRoles(true);
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
    roleViews.find((role) => role.id === selectedRole) ??
    (roleViews.length ? roleViews[0] : null);
  const roleHelperId = usingFallbackRoles ? 'role-helper-text' : undefined;

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
        <section
          className="program"
          id="program"
          aria-labelledby="program-heading"
        >
          <div className="shell">
            <div className="section-heading">
              <span className="kicker">Program foundations</span>
              <h2 id="program-heading">How the workspace runs</h2>
              <p>
                Share this structure with new teammates. It keeps the program
                predictable and shows where each part of the lifecycle lives.
              </p>
            </div>
            <div className="program-grid">
              {programPillars.map((pillar) => (
                <article className="program-card" key={pillar.title}>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.summary}</p>
                  <ul>
                    {pillar.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="roles" id="roles" aria-labelledby="roles-heading">
          <div className="shell">
            <div className="section-heading">
              <span className="kicker">Role handbook</span>
              <h2 id="roles-heading">
                Choose your view of Procurement Manager
              </h2>
              <p>
                Select a role to see priorities, cadence, and the workspaces
                each team uses every day.
              </p>
            </div>
            <div className="role-selector">
              <label className="role-label" htmlFor="role-select">
                Role
              </label>
              <select
                id="role-select"
                className="role-select"
                value={selectedRole ?? ''}
                onChange={(event) =>
                  setSelectedRole(
                    event.target.value ? event.target.value : null
                  )
                }
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

        <section
          className="access"
          id="access"
          aria-labelledby="access-heading"
        >
          <div className="shell">
            <div className="section-heading">
              <span className="kicker">Access & onboarding</span>
              <h2 id="access-heading">Get into Procurement Manager</h2>
              <p>
                A short checklist for teammates joining the workspace. Share
                this page instead of a long orientation deck, and use the intake
                readiness checklist to set expectations for requesters.
              </p>
            </div>
            <div className="access-grid">
              {accessSteps.map((step) => (
                <article className="access-card" key={step.title}>
                  <div className="access-card-header">
                    <h3>{step.title}</h3>
                    {step.meta ? (
                      <span className="access-meta">{step.meta}</span>
                    ) : null}
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
