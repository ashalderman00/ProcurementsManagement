import { useState } from 'react';

const navLinks = [
  { label: 'Overview', href: '/#overview' },
  { label: 'Program', href: '/#program' },
  { label: 'Roles', href: '/#roles' },
  { label: 'Resources', href: '/#resources' },
  { label: 'Access', href: '/#access' },
];

const checklistSections = [
  {
    id: 'context',
    title: 'Clarify the request',
    description:
      'Give reviewers the story, urgency, and stakeholders behind the purchase.',
    items: [
      {
        id: 'problem',
        label: 'Problem statement or objective this request addresses',
      },
      {
        id: 'sponsor',
        label: 'Business sponsor and directly responsible individual',
        detail:
          'Include name, title, and contact so Procurement can loop them in quickly.',
      },
      {
        id: 'impact',
        label: 'Teams or processes impacted by the decision',
        detail: 'Call out integrations or dependencies that need coordination.',
        importance: 'recommended',
      },
      {
        id: 'timeline',
        label: 'Target go-live or deadline and any immovable dates',
      },
      {
        id: 'outcomes',
        label: 'How success will be measured once the solution is live',
        importance: 'recommended',
      },
    ],
  },
  {
    id: 'financials',
    title: 'Lock in budget details',
    description: 'Confirm where the spend lands and who approves it.',
    items: [
      {
        id: 'spend',
        label: 'Estimated total contract value (first year and full term)',
      },
      {
        id: 'budget-owner',
        label: 'Budget owner or cost center with confirmation funds exist',
      },
      {
        id: 'category',
        label: 'Procurement category, GL code, or project code to charge',
      },
      {
        id: 'approvers',
        label: 'Delegation of authority path and known approvers',
      },
      {
        id: 'renewal',
        label: 'Contract term length and renewal or cancellation notice period',
        importance: 'recommended',
      },
    ],
  },
  {
    id: 'vendor',
    title: 'Prepare vendor diligence',
    description:
      'Surface the risk posture so security, legal, and compliance can act quickly.',
    items: [
      {
        id: 'vendor',
        label: 'Preferred supplier or shortlisted vendors with contacts',
      },
      {
        id: 'alternatives',
        label: 'Alternatives reviewed or justification for a sole-source choice',
        importance: 'recommended',
      },
      {
        id: 'data',
        label: 'Data classification and systems the vendor will access or integrate',
      },
      {
        id: 'requirements',
        label: 'Security, privacy, or compliance requirements that must be met',
      },
      {
        id: 'documentation',
        label: 'Latest security questionnaire, SOC/ISO reports, or DPAs on file',
        importance: 'optional',
        detail: 'Upload directly to the request when they are available.',
      },
    ],
  },
  {
    id: 'execution',
    title: 'Plan delivery and handoff',
    description:
      'Make sure owners, timing, and transition plans are in place before approvals begin.',
    items: [
      {
        id: 'owner',
        label: 'Implementation lead and ongoing vendor relationship owner',
      },
      {
        id: 'partners',
        label: 'IT, security, legal, and finance partners notified of the request',
      },
      {
        id: 'training',
        label: 'Enablement or rollout plan for impacted teams',
        importance: 'recommended',
      },
      {
        id: 'support',
        label: 'Support model or vendor SLAs after go-live',
      },
      {
        id: 'metrics',
        label: 'Plan for monitoring adoption, spend, and outcomes post-launch',
        importance: 'optional',
      },
    ],
  },
];

const readinessHighlights = [
  'Reviewers receive complete budget and risk context on the first pass.',
  'Approvers can focus on decisions instead of chasing missing details.',
  'Renewal and vendor owners are identified before contracts are signed.',
];

const totalChecklistItems = checklistSections.reduce(
  (count, section) => count + section.items.length,
  0
);

export default function IntakeChecklist() {
  const [completedItems, setCompletedItems] = useState(() => new Set());

  const percentComplete = totalChecklistItems
    ? Math.round((completedItems.size / totalChecklistItems) * 100)
    : 0;
  const progressLabel = `${completedItems.size} of ${totalChecklistItems} items ready`;

  function toggleItem(id) {
    setCompletedItems((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function resetChecklist() {
    setCompletedItems(new Set());
  }

  return (
    <div className="page checklist-page">
      <header className="site-header" id="top">
        <div className="shell nav-shell">
          <a className="brand" href="/">
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
          className="checklist-hero"
          aria-labelledby="intake-checklist-title"
        >
          <div className="shell">
            <div className="checklist-hero-content">
              <span className="checklist-eyebrow">Intake enablement</span>
              <h1 id="intake-checklist-title">Intake readiness checklist</h1>
              <p>
                Make sure every request enters Procurement Manager with the
                budget, risk, and delivery details partners expect. Share this
                checklist with requesters before they submit.
              </p>
              <div className="checklist-progress-card">
                <div className="checklist-progress-meta" aria-live="polite">
                  <span>{progressLabel}</span>
                  <span>{percentComplete}%</span>
                </div>
                <div
                  className="checklist-progress-track"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percentComplete}
                  aria-valuetext={progressLabel}
                >
                  <div
                    className="checklist-progress-fill"
                    style={{ width: `${percentComplete}%` }}
                  />
                </div>
                {completedItems.size ? (
                  <button
                    type="button"
                    className="checklist-reset"
                    onClick={resetChecklist}
                  >
                    Reset checklist
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section
          className="checklist-content"
          aria-labelledby="checklist-sections-heading"
        >
          <div className="shell checklist-shell">
            <div className="checklist-sections">
              <h2 id="checklist-sections-heading" className="checklist-heading">
                What to capture before intake
              </h2>
              {checklistSections.map((section) => {
                const sectionCompleted = section.items.reduce(
                  (count, item, index) =>
                    completedItems.has(`${section.id}-${item.id ?? index}`)
                      ? count + 1
                      : count,
                  0
                );

                return (
                  <section
                    key={section.id}
                    className="checklist-section"
                    aria-labelledby={`section-${section.id}`}
                  >
                    <div className="checklist-section-head">
                      <h3 id={`section-${section.id}`}>{section.title}</h3>
                      <p>{section.description}</p>
                      <span className="checklist-section-progress">
                        {sectionCompleted} of {section.items.length} ready
                      </span>
                    </div>
                    <ul className="checklist-items">
                      {section.items.map((item, index) => {
                        const itemId = `${section.id}-${item.id ?? index}`;
                        const isChecked = completedItems.has(itemId);
                        const importance = item.importance ?? 'required';
                        const badgeLabel =
                          importance === 'recommended'
                            ? 'Recommended'
                            : importance === 'optional'
                            ? 'Optional'
                            : null;

                        return (
                          <li
                            key={itemId}
                            className={`checklist-item${
                              isChecked ? ' is-complete' : ''
                            }`}
                          >
                            <label className="checklist-item-label">
                              <input
                                type="checkbox"
                                className="checklist-checkbox"
                                checked={isChecked}
                                onChange={() => toggleItem(itemId)}
                              />
                              <div className="checklist-item-content">
                                <div className="checklist-item-row">
                                  <span className="checklist-item-title">
                                    {item.label}
                                  </span>
                                  {badgeLabel ? (
                                    <span
                                      className={`checklist-badge ${
                                        importance === 'recommended'
                                          ? 'is-recommended'
                                          : 'is-optional'
                                      }`}
                                    >
                                      {badgeLabel}
                                    </span>
                                  ) : null}
                                </div>
                                {item.detail ? (
                                  <p className="checklist-item-detail">
                                    {item.detail}
                                  </p>
                                ) : null}
                              </div>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
            </div>
            <aside className="checklist-aside" aria-label="Enablement guidance">
              <div className="checklist-callout">
                <h3>How to use this checklist</h3>
                <p>
                  Drop the link into intake forms, onboarding docs, or Slack
                  reminders. Aligning on expectations up front keeps requests
                  moving without Procurement chasing fundamentals.
                </p>
              </div>
              <div className="checklist-callout">
                <h3>What complete looks like</h3>
                <ul>
                  {readinessHighlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
