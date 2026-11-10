# Decision log

## 2026-11-09: Assignment source
Use dashboard Task 1 and Task 2 titles; use common handbook engineering standards. The learner confirmed two submissions.

## 2026-11-09: Learning pace
The latest direct request prioritizes learning through small explained changes over generating the whole application. First checkpoint is architecture and folders. Do not automatically advance through the full master prompt in one turn.

## 2026-11-09: Backend first
Understand HTTP and persistence before React integration. Test features during implementation instead of postponing all testing.

## 2026-11-09: Stack and service boundaries
Use the requested TypeScript, Node.js/Express, PostgreSQL/Prisma, JWT, Argon2id, Zod, Vitest/Supertest, React/Vite, Docker, ESLint/Prettier, and OpenAPI. Versions are intentionally not chosen yet; verify compatibility at installation. Use one backend service with feature modules and a supporting frontend. No Vercel dependency or hosting commitment is needed.

## 2026-11-09: Repository layout
One project directory containing backend, frontend, docs, and tests. Backend-local tests belong under backend/tests; cross-application browser tests belong under tests/e2e. This directory will become its own Git repository in the Git lesson. Task 2 receives a separate repository later.

## 2026-11-09: Keep submission focused
Create folders when implementing their contents. Keep lessons in documentation, not application source. Removed the prior isolated scripts; Lesson 2 is historical. Use a compiled TypeScript runtime consistently for development and start.

## 2026-11-09: Implementation and compatibility
The learner requested the remaining Task 1 implementation. Selected aligned Prisma 7.10.1 CLI/client/PG-adapter after Prisma 6 audit findings; TypeScript 6 matches the lint parser peer range. Express 5 handles async handler rejections. Exact resolutions are committed in lockfiles. Keep this small backend flat rather than creating empty module layers.

## 2026-11-09: Token model
Use 10-minute access JWTs, database-loaded roles, and absolute seven-day refresh families. Hash refresh credentials; atomically consume before replacing them. Replay detection commits family revocation before rejecting. Origin plus a custom header protects auth POSTs; Strict cookies add defense in depth.

## 2026-11-09: Tooling audit limits
A scoped patched minimatch override resolves the typescript-eslint subtree's advisory. ESLint 10 still resolves minimatch 10 and reports four moderate development-tooling findings. Attempted additional scoped overrides did not change npm's resolution; removed those ineffective overrides rather than leaving invalid installed dependencies. Track upstream and disclose remaining findings.
