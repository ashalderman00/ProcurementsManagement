CREATE TABLE IF NOT EXISTS marketing_role_profiles (
  id SERIAL PRIMARY KEY,
  role_id TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  headline TEXT NOT NULL,
  summary TEXT NOT NULL,
  responsibilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  cadence JSONB NOT NULL DEFAULT '[]'::jsonb,
  tools JSONB NOT NULL DEFAULT '[]'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO marketing_role_profiles
  (role_id, label, headline, summary, responsibilities, cadence, tools, display_order)
VALUES
  (
    'admin',
    'Admin',
    'Keep the workspace healthy',
    'Admins maintain automations, integrations, and access so every team works from the same source of truth.',
    '["Monitor automation runs and resolve sync failures before business hours.","Audit ERP, HRIS, and SSO connections weekly for accuracy.","Document configuration changes and communicate to stakeholders."]'::jsonb,
    '["Daily: review the health console for warnings.","Weekly: align with security on access changes.","Quarterly: certify retention and archival policies."]'::jsonb,
    '["Automation monitor","Configuration register","Access review"]'::jsonb,
    10
  ),
  (
    'finance',
    'Finance',
    'Steer spend with live visibility',
    'Finance ensures budget coverage, forecasts impact, and keeps commitments aligned to plan.',
    '["Validate cost center and GL coding on new intake.","Highlight variance risks and partner with budget owners.","Track committed spend and accruals using the live ledger."]'::jsonb,
    '["Daily: clear approvals that meet guardrails.","Weekly: reconcile commitments with accounting.","Monthly: review renewal savings opportunities."]'::jsonb,
    '["Commitments ledger","Approval console","Variance brief"]'::jsonb,
    20
  ),
  (
    'buyer',
    'Buyer',
    'Move sourcing work forward',
    'Buyers manage diligence, negotiations, and stakeholder updates with a single shared timeline.',
    '["Keep request status current with supplier and stakeholder actions.","Coordinate legal and security deliverables in the dossier.","Capture performance notes for quarterly business reviews."]'::jsonb,
    '["Daily: update progress and outstanding tasks.","Weekly: align with finance on leverage and savings.","Quarterly: refresh preferred supplier recommendations."]'::jsonb,
    '["Sourcing workroom","Supplier directory","Document vault"]'::jsonb,
    30
  ),
  (
    'approver',
    'Approver',
    'Decide quickly with context',
    'Approvers receive a concise brief—budget, risk, legal status—so decisions are fast and defensible.',
    '["Review the approval brief and flag follow-ups inside the record.","Ensure delegation coverage during travel and quarter-close.","Log conditions so procurement can operationalise them."]'::jsonb,
    '["Daily: clear pending approvals grouped by priority.","Weekly: sync with procurement on escalations.","Quarterly: refresh delegation rules and playbooks."]'::jsonb,
    '["Approval brief","Policy library","Delegation planner"]'::jsonb,
    40
  ),
  (
    'requester',
    'Requester',
    'Submit and follow with clarity',
    'Requesters provide business cases, respond to clarifications, and track progress without leaving the workspace.',
    '["Complete guided intake with supporting documentation and stakeholders.","Respond promptly to questions from procurement or security.","Plan renewals early with the reminders and budget coordination tools."]'::jsonb,
    '["As needed: start intake before spend occurs.","During review: stay active in the request thread.","Post approval: confirm delivery and capture feedback."]'::jsonb,
    '["Guided request","Tracking board","Renewal planner"]'::jsonb,
    50
  )
ON CONFLICT (role_id) DO UPDATE
SET
  label = EXCLUDED.label,
  headline = EXCLUDED.headline,
  summary = EXCLUDED.summary,
  responsibilities = EXCLUDED.responsibilities,
  cadence = EXCLUDED.cadence,
  tools = EXCLUDED.tools,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();
