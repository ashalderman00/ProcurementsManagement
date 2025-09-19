# ProcurementsManagement

A full-stack procurement management demo that pairs an Express API with a React (Vite) front end. The project illustrates approval workflows, purchase tracking and reporting for finance, requester, buyer, approver and admin roles.

## Prerequisites

Make sure the following tools are installed before you begin:

- [Node.js](https://nodejs.org/) **18.x or newer** (the frontend relies on Vite and modern ECMAScript features).
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) (ships with Node.js, use v9+).
- [PostgreSQL](https://www.postgresql.org/download/) **14+** with a user that can create databases.
- Optional: `psql` (command line client) or Docker if you prefer running PostgreSQL inside a container.

## Repository structure

```
.
├── backend/    # Express REST API, database migrations, workflow logic
├── frontend/   # React UI powered by Vite and Material UI
├── docs/       # Product requirements and design prototypes
└── README.md   # This guide
```

## 1. Install dependencies

Clone the repository and install dependencies for the root workspace plus both sub-projects:

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

> Tip: run the commands from the repository root. The `--prefix` flag keeps backend and frontend dependencies isolated in their own `node_modules` folders.

## 2. Configure environment variables

1. Copy `backend/.env` to a local file (for example `backend/.env.local`) and adjust the values as needed.
2. At a minimum set:
   - `DATABASE_URL` – PostgreSQL connection string (defaults to `postgres://postgres:postgres@localhost:5432/procurement_db`).
   - `JWT_SECRET` (optional but recommended) – secret key used to sign authentication tokens.
3. When running locally you can either rename the file back to `.env` or load it with your preferred tooling (e.g. `direnv`).

## 3. Prepare the database

1. Start PostgreSQL and create the application database if it does not already exist:
   ```bash
   createdb procurement_db
   ```
   Substitute the command with the equivalent for your operating system or managed database.
2. Apply all migrations:
   ```bash
   npm run migrate
   ```
3. (Optional) Populate demo data so you can explore the UI immediately:
   ```bash
   node backend/seed_demo.js
   ```
   This seeds categories, vendors and demo accounts. The credentials are:
   - Admin: `admin@demo.co` / `demo1234`
   - Approver: `approver@demo.co` / `demo1234`
   - Requester: `alex@demo.co` / `demo1234`

## 4. Run the app locally

Launch both servers with one command from the project root:

```bash
npm run dev
```

The script runs migrations (safe to re-run), starts the API on <http://localhost:4000> and Vite dev server on <http://localhost:5173>. The frontend is configured to call the API directly at `http://localhost:4000/api`.

If you prefer managing processes separately you can run `npm --prefix backend start` for the API and `npm --prefix frontend run dev` for the UI.

## 5. Run automated tests

Execute the full test suite (backend Jest tests and frontend Vitest tests) with:

```bash
npm test
```

> The current backend project ships with placeholder tests that exit immediately; the frontend contains unit tests for React components.

## Additional scripts

- `npm run lint` – Lints the backend codebase using ESLint.
- `npm run format` – Checks formatting for backend and frontend using Prettier.
- `npm run migrate` – Re-applies database migrations (safe to run after schema changes).

## Troubleshooting tips

- **Database connection errors:** double-check the `DATABASE_URL`, confirm PostgreSQL is listening on the expected host/port, and ensure SSL settings match your environment. Render.com style URLs require SSL; the backend auto-detects this.
- **Port conflicts:** if ports 4000 or 5173 are taken, stop the conflicting process or edit the `PORT` environment variable for the backend and `frontend/vite.config.js` for the frontend dev server.
- **Stale dependencies:** rerun the installation commands or delete the respective `node_modules` folder if you encounter module resolution errors after pulling new changes.
