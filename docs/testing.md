# Verification record - 2026-11-09

## Environment
Windows, Node.js 24.20.0, npm 11.19.0, PostgreSQL 18, headless Microsoft Edge. A new local-only PostgreSQL cluster on port 55439 and dedicated arrowstack_test database were created for verification. No existing database was used. The cluster and caches are ignored by Git.

## Completed checks
- Initial migration generated from the schema and applied successfully to an empty PostgreSQL database.
- Backend TypeScript check and compilation passed.
- Backend ESLint and Prettier formatting checks passed.
- 17 Vitest/Supertest integration tests passed with real PostgreSQL; no skipped tests.
- Frontend TypeScript and Vite production build passed.
- 2 Playwright browser tests passed: USER registration/login/reload/profile/logout, and development-admin provisioning/login/user listing/logout.
- Mobile login inspected at 390px width; no horizontal overflow.

Database tests verify malformed registration, role injection, normalized email, Argon2id storage, audit event creation, duplicates/unique constraints, wrong/unknown login credentials, refresh hash storage and cookie attributes, safe profile, USER denial, current ADMIN access, invalid pagination, missing/invalid/expired/wrong-audience JWTs, rotation and replay-family revocation, expired/unknown/missing refresh credentials, concurrent rotation, logout, session foreign keys, malformed JSON, unknown routes, and rate limiting.

Earlier fixes: Vitest 5 no longer exposes describe.sequential; use its default sequential suite. The first frontend compile needed vite/client CSS declarations. Vite/process workers required execution outside the restrictive process sandbox. Prisma 6 tooling audit findings prompted the move to aligned Prisma 7.10.1 packages and PostgreSQL driver adapter. TypeScript 6 was selected for compatibility with typescript-eslint's peer range.

## Dependency audit
Prisma-related high findings were resolved. The backend still reports four moderate findings through ESLint 10's minimatch 10 dependency (development tooling). No high/critical findings were reported in the latest audit. The typescript-eslint subtree uses a patched minimatch override, validated by lint. Do not run lint on attacker-controlled repository paths. Recheck upstream patches before submission. Frontend installation reported zero findings; rerun npm audit when preparing submission.

## Unexecuted checks and limits
- Docker image builds and Compose execution: Docker is not installed.
- Public HTTPS deployment, production proxy behavior, backups/restore, and multi-instance rate limiting: not executed.
- Independent penetration test and full accessibility audit: not executed.
- Browser tests cover primary user/admin flows, not every browser/device or all failure combinations.

Run commands and database cleanup safeguards are in README. Runtime test databases must be local and end in _test; tests delete their contents. Browser tests create disposable user/admin accounts and require TEST_DATABASE_URL to match the API database. No test credentials should be committed.

All verification servers and the isolated PostgreSQL cluster were stopped after checks. The project has no prefilled runtime .env or published demo accounts; follow README to configure your own local development environment. Offline npm output is not treated as a fresh advisory audit.
