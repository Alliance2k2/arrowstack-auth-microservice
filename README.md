# Arrowstack Identity - Authentication & JWT Service

Task 1 of the Arrowstack internship. A TypeScript/Express API backed by PostgreSQL, with a React demonstration interface. Task 2 is a separate future repository.

## Features
Registration, Argon2id password verification, short-lived JWT access tokens, current-user profile, server-side USER/ADMIN permissions, paginated administrator listing, rotating refresh cookies, family revocation on replay/logout, audit records, validation, origin checks, rate limits, and safe errors.

## Local setup
Prerequisites: Node.js 24, npm, and PostgreSQL (verified locally with PostgreSQL 18). Create an empty development database using your PostgreSQL administration tools. No accounts or passwords are supplied by this repository.

```powershell
cd backend
npm ci
Copy-Item .env.example .env
```

Edit backend/.env with your own PostgreSQL URL and secret. Generate a secret with `node -e "console.log(require('node:crypto').randomBytes(64).toString('hex'))"`. Never commit it. Keep WEB_ORIGIN exactly `http://127.0.0.1:5173` for this workflow; localhost is a different origin.

```powershell
npm run db:generate
npm run db:migrate
npm run typecheck
npm run build
npm start
```

In a second terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Register your own disposable demo account with a password of at least 12 characters. No preconfigured accounts exist. Stop servers with Ctrl+C. Changes to backend TypeScript require rebuilding and restarting; `npm run dev` watches compilation only.

API health: http://127.0.0.1:3000/api/v1/health. Database readiness: /api/v1/ready. Swagger UI: /api/docs. OpenAPI JSON: /api/openapi.json. Swagger cookie operations still require the configured Origin and custom header; use the frontend for browser demonstrations.

## Development administrator
Build the backend. In its terminal, set ADMIN_EMAIL and ADMIN_PASSWORD environment variables to a new email and a unique password of at least 16 characters, then run `npm run admin:create`. Remove both environment variables afterward. This command only runs with NODE_ENV=development, creates a new account, and refuses duplicates. Public registration cannot create administrators.

## Checks
Backend: `npm run typecheck`, `npm run build`, `npm run lint`, `npm run format:check`.
Frontend: `npm run build`.

For destructive integration tests, create a separate local database whose name ends in `_test`, apply migrations to it using DATABASE_URL, then set TEST_DATABASE_URL to that same database and run `npm test` from backend. Tests refuse non-local hosts and database names without this suffix. They delete all users, sessions, and audit records in that dedicated test database. Never point tests at a database containing work you need.

Browser tests: with backend and frontend already running against a disposable database, set TEST_DATABASE_URL to the same local _test database used by the API, then run `npm run test:e2e` from frontend. They create disposable accounts. Chromium must be installed with `npx playwright install chromium`, or set PLAYWRIGHT_CHANNEL=msedge to use installed Edge.

## Docker local demonstration
Docker is optional. Copy the root .env.example to .env and replace both placeholders with random hex values (avoids URL-escaping issues). Run `docker compose up --build` at project root. Open http://127.0.0.1:8080. This Compose configuration is explicitly local development, not a public production deployment. It runs migrations before starting the API and preserves database data in a volume. See docs/deployment.md.

## Repository
- backend/src: configuration, Express API, authentication rules, Prisma client, OpenAPI, and dev admin command.
- backend/prisma: schema and versioned SQL migration.
- backend/tests: real PostgreSQL integration tests.
- frontend/src: React UI and API client; no persistent browser token storage.
- frontend/tests: browser flow verification.
- docs: design, security, testing evidence, lessons, and submission checklist.

See docs/testing.md for actual verification outcomes and remaining limitations. The project is not considered submission-ready until all remaining checklist items have evidence.
