# Lesson 4: Follow the complete authentication flow

The implementation is available to study in small sections. Use README for actual setup and docs/testing.md for evidence. Do not confuse generated code with personal understanding: explain each step before presenting it as your work.

## A. PostgreSQL and Prisma
Tables persist related records. User is the parent of RefreshSession. AuditEvent records safe activity. A foreign key stops a session referencing a missing user; a unique email prevents duplicates even during concurrent requests. Prisma provides typed queries; migrations are versioned SQL changes.
Files: prisma/schema.prisma, prisma/migrations, src/db.ts. Commands: npm run db:generate and npm run db:migrate. Use your development database, never someone else's system.
Questions: What is a foreign key? Why enforce uniqueness in SQL? Why commit migrations?
Exercise: identify the indexes that support revoking a session family and explain the lookup.

## B. Registration and login
app.ts validates HTTP input with Zod. auth.ts hashes the password with Argon2id and inserts the user plus audit event in a transaction. Login verifies the stored hash and issues two different credentials: short-lived access JWT and random refresh token.
Commands: npm run build, npm start, then register and sign in in the frontend. Never store plaintext passwords or log tokens. A hash is not encryption you can reverse.
Questions: Why hash passwords? Why cannot the client choose ADMIN? Why use a generic login failure?
Exercise: submit an invalid email and inspect the Network response without copying sensitive headers.

## C. Authentication versus authorization
A signature-verified JWT identifies the subject. The API reloads that user and checks the current role before listing accounts. React hiding an admin button is only a usability feature. requireUser in app.ts enforces identity; the admin route enforces permission.
Questions: How do 401 and 403 differ? Where is role enforced? Why reload role from the database?
Exercise: with a USER login, call the admin endpoint using the browser API and confirm 403. Never share the token.

## D. Refresh, replay, and logout
Access JWTs expire after 10 minutes. The HttpOnly refresh cookie is not available to JavaScript. The server stores its hash. One atomic update consumes it before a replacement is created. Replaying an old token revokes its family; the transaction must commit this revocation before returning an error. Logout revokes the family and clears the cookie. An existing access JWT can still work until expiry.
Commands: npm test with the protected dedicated test database, as documented in README. Inspect refresh tests for rotation, concurrent requests, and logout.
Questions: Why not store raw refresh tokens? What is replay? Why must replay revocation commit?
Exercise: diagram the refresh transaction and identify the race prevented by updateMany.

## E. React and HTTP integration
main.tsx owns user, page, loading, and error state. api.ts sends fetch requests and adds a memory-only access token. An expired token triggers one shared refresh request; retry occurs once. Vite proxies /api to Express during development. Page reload restores a session through the refresh cookie.
Commands: npm run dev and npm run build from frontend. Labels, native validation, keyboard controls, and status/error announcements support accessibility.
Questions: Why not localStorage? Why share one refresh request? What does the development proxy do?
Exercise: reload the profile page after login and explain how the UI regains identity despite losing its in-memory token.

## F. Testing and delivery
Backend tests use real PostgreSQL and Supertest. Browser tests exercise the UI with the actual API. ESLint checks code patterns; TypeScript checks types; neither proves authorization is correct. Docker packages services but needs its own runtime verification.
Questions: What does a successful build prove? Why use a separate test database? Which checks remain before submission?
Exercise: run the checks, record actual results and limitations, then give a five-minute demo explaining one design tradeoff.
