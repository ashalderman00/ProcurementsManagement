# Guided Demo Walkthrough

This runbook gives facilitators a scripted tour of the Procurement Management demo so new teammates can learn the core workflows in about 20 minutes. It uses the seeded sample data and switches personas so participants experience intake, approvals, vendor management, and configuration tasks.

## Learning goals

By the end of the session the audience should:

- Understand how a requester submits a purchase, attaches context, and tracks status end-to-end.
- Observe how approvers review items, record decisions, and see a full audit trail.
- Explore how admins manage vendors and fine-tune routing rules without leaving the workspace.
- Know where to find orientation resources and metrics before inviting stakeholders to the product.

## Environment preparation

1. **Install dependencies** (once per machine):
   ```bash
   npm install
   npm --prefix backend install
   npm --prefix frontend install
   ```
2. **Configure environment variables.** Copy `backend/.env` to a local override (for example `.env.local`) and update the `DATABASE_URL` if you are not using the default Postgres connection. Optionally set `JWT_SECRET` for signed sessions.
3. **Apply migrations and seed demo data** so the walkthrough has realistic content:
   ```bash
   npm run migrate
   node backend/seed_demo.js
   ```
4. **Start the demo servers** from the repository root. The script launches the API on port `4000` and the Vite UI on port `5173`.
   ```bash
   npm run dev
   ```
5. **Demo login accounts** created by the seed script:

   | Persona | Role | Email | Password | Highlights |
   |---------|------|-------|----------|------------|
   | Requester | requester | `alex@demo.co` | `demo1234` | Creates requests and uploads files |
   | Approver | approver | `approver@demo.co` | `demo1234` | Clears the approvals queue |
   | Admin | admin | `admin@demo.co` | `demo1234` | Adjusts vendors and rules |

Keep `backend/seed_demo.js` handy if you need to reset data between runs.

## Suggested run of show (≈20 minutes)

Each section below includes a story beat, call-outs, and the persona you should impersonate. Encourage attendees to follow along in their own browser tabs when possible.

### 1. Welcome & orientation (2 minutes)

- **Persona:** Facilitator (logged out)
- **Path:** Visit `http://localhost:5173/`
- **Call-outs:**
  - The marketing landing page pulls hero metrics, focus signals, and persona-driven role views directly from `/api/marketing/landing` so leaders see real data immediately.
  - Highlight navigation links to the intake checklist and access instructions so new team members know where to start.
  - Mention that self-service signup and login links live in the top-right for quick onboarding.

Transition by explaining that you will now play the requester who submits a new purchase.

### 2. Requester submits a purchase (6 minutes)

- **Persona:** Requester (`alex@demo.co`)
- **Path:** Sign in → go to **Requests** → click **New request**
- **Call-outs:**
  - On the dashboard, emphasize the live request counters and recent activity list powered by `/api/requests`.
  - Walk through the request drawer: title, amount, category dropdown, and optional file upload for quotes or receipts.
  - Submit the form and point out the toast confirmation and refreshed table row with status `pending`.
  - Open the request from the list to show the detail drawer with Overview, Files, Comments, and Timeline tabs; upload a document or leave a quick note so audit entries appear later.

Explain that the request is now awaiting an approver’s decision.

### 3. Approver reviews and decides (4 minutes)

- **Persona:** Approver (`approver@demo.co`)
- **Path:** Sign out → sign back in as approver → open **Approvals**
- **Call-outs:**
  - Pending items load automatically, showing title, amount, and action buttons.
  - Demonstrate the confirmation modal when choosing **Approve** or **Deny**, and complete the approval to remove the item from the queue.
  - Switch to the request detail again (as the requester or approver) to show how the Timeline tab now includes the approval action.

### 4. Admin tunes the workspace (5 minutes)

- **Persona:** Admin (`admin@demo.co`)
- **Path:** Sign in as admin → browse **Vendors** and **Settings**
- **Call-outs:**
  - On the Vendors page, search for `Apple`, open the drawer, adjust notes or toggle the status to show inline vendor maintenance.
  - From the Settings → Approval Rules view, create or edit a rule to illustrate how finance teams define routing based on amount, category, vendor, and approval stages.
  - Emphasize that updates happen without leaving the workspace, keeping procurement policies in sync with intake.

Close the admin segment by summarizing how configuration changes feed back into the requester and approver experiences.

### 5. Optional bonus moments (as time allows)

- Preview the **Resources → Intake checklist** to reinforce what requesters should prepare before submitting work.
- Show the marketing landing page’s **Role views** to discuss stakeholder responsibilities with leadership.
- Mention the Purchase Orders list (`/app/purchase-orders`) if you want to tease future roadmap conversations.

## Resetting the demo

- To return to the seeded state, stop the dev servers and rerun:
  ```bash
  npm run migrate
  node backend/seed_demo.js
  ```
- To remove uploaded files between sessions, delete the `backend/uploads` directory.
- Encourage facilitators to create and approve a fresh request before each audience to keep the dashboard lively.

## Facilitation tips

- Keep persona switches explicit so viewers understand which role is on screen.
- Narrate the business outcome (faster intake, clear audit trail, centralized vendor data) alongside the UI clicks.
- Invite observers to try a request on their own browser during the admin segment so they experience the workflow firsthand.
- End by sharing the seeded credentials or invite them to sign up using their own email if they want to continue exploring.
