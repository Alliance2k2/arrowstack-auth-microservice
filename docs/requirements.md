# Requirements and acceptance checklist

## Assignment and scope
Active dashboard Task 1: Role-Based User Authentication & JWT Microservice.
Task 2: Full Stack Task Management System with Database, deferred to a separate repository.
Submission: at least two project repositories and two LinkedIn demo posts.

Primary users: ordinary users and administrators. Success means users can authenticate and access only permitted data, with reproducible setup and demonstrated security checks.

The following is the agreed master-prompt implementation scope, not a quotation of dashboard acceptance criteria.

- [x] Register with validated input; public registration always creates USER.
- [x] Log in with Argon2id password verification and generic authentication failures.
- [x] Retrieve the authenticated profile.
- [x] Issue expiring JWT access tokens; reject invalid or expired tokens.
- [x] Rotate refresh tokens and detect replay; revoke affected sessions.
- [x] Log out and invalidate refresh sessions.
- [x] Enforce ADMIN permissions on the server; document development admin provisioning.
- [x] Persist users, refresh sessions, and safe audit events in PostgreSQL with migrations and constraints.
- [x] Add validation, rate limiting, CORS, safe errors, security headers, and environment validation.
- [x] Integrate a responsive accessible React demonstration with the real API.
- [x] Test successful and unsuccessful flows, authorization, token lifecycle, and database constraints.
- [x] Supply OpenAPI documentation, Docker setup, reproducible instructions, evidence, and demo.

Out of scope: Task 2 implementation, payments, public deployment, and real production user data.

Implementation boxes describe delivered code/configuration, not production readiness. See testing.md for unexecuted checks and submission-checklist.md before handoff.
