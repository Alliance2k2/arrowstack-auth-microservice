# Progress and work log

## 2026-11-09 - Checkpoint 1: Architecture and organization
Completed: inspected both supplied PDFs, dashboard screenshot, master prompt, and workspace. Created the Task 1 folder skeleton, requirements, architecture, preliminary database/API/security designs, decision log, roadmap, and first exercise.

The initial workspace contained only the two PDF files. Those originals were preserved.

Not implemented: application code, database models, migrations, dependency manifests, Docker, frontend, or tests. No package versions selected. No Git repository initialized, external account created, or public deployment performed.

Validation: file and folder presence checks; application tests unexecuted because no application exists.

Next: learner reviews Lesson 1 and attempts the architecture exercise; then introduce language basics, initialize backend tooling, and build one tested health endpoint.

## 2026-11-09 - Checkpoint 2: JavaScript and Node foundations
Installed tools observed: Node v24.20.0, npm 11.19.0, Git 2.55.0.windows.3.
Added a private backend package manifest with an ES-module learning script, sample async lookup, Python comparison lesson, and learner exercise. No external dependencies installed. No server or database implemented. Git initialization remains for the Git lesson.
Validation: executed npm run lesson:basics and checked both found-user and missing-user outputs; see the checkpoint report for actual results. Authentication tests remain unexecuted because authentication does not exist.

## 2026-11-09 - Checkpoint 3: Lean backend and TypeScript
Removed the two temporary learning scripts and all scaffold .gitkeep files; removed empty directories. Historical lessons describe earlier checkpoints, not current runnable scripts. Added Express health endpoint, listener, strict TypeScript config, dependencies and lockfile. Updated README with current commands. Runtime and compiler verification are reported with this checkpoint. No authentication, database, frontend, or deployment is complete.
`nCheckpoint 3 results: npm run typecheck passed; npm run build passed; live HTTP smoke assertions passed for health JSON/status and unknown-route 404. No database or authentication tests were run.

## 2026-11-09 - Task 1 implementation checkpoint
Added PostgreSQL schema/migration, Prisma driver adapter, registration/login/profile, roles, refresh rotation/replay-family revocation/logout, safe audit events, validated environment, security middleware, development-only administrator provisioning, OpenAPI/Swagger, React interface and API integration, 17 database-backed API tests, 2 browser tests, Dockerfiles/Compose, format/lint configuration, and updated documentation/demo/checklist.
Initialized a local Git repository; no commits, remote publication, LinkedIn posting, or public deployment performed. No empty scaffold directories retained. See testing.md for actual results, dependency findings, and unexecuted Docker/production checks. Do not label the whole internship complete: Task 2 remains separate and unimplemented.

Verification cleanup: stopped API, Vite, headless browser, and isolated PostgreSQL test cluster. Local PostgreSQL files, dependency caches, compiled output, and browser artifacts are ignored by Git. No runtime secrets were written into tracked files.
`n## 2026-11-10 - Interface polish`nAdded current-page navigation indicators, a separate account Overview, clearer shared-device session wording, stronger small-text contrast, system fonts, and navigation targets at least 44px tall. Profile retains identity details. Production frontend build passed. Live Edge checks passed for distinct content, active navigation, login/logout, no browser exceptions, and no horizontal overflow at 320/390/768/1440px. A disposable review account was deleted afterward; existing user accounts were preserved.
