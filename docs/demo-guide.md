# Task 1 demonstration

Use disposable accounts. Hide terminal environment values and browser cookie/authorization panels while recording.

1. Explain React -> Express -> Prisma -> PostgreSQL.
2. Register a normal user; show validation for a short password.
3. Sign in and display the profile. Explain that the password hash is never returned.
4. Reload to demonstrate refresh-cookie session restoration.
5. Explain USER/ADMIN enforcement on the server and show a USER receives 403 on the admin endpoint without displaying the token.
6. Sign in with a separately provisioned development administrator and show the account list.
7. Sign out and show the login screen returns after reload.
8. Show the 17 backend and 2 browser test results, migration, API documentation, and documented limitations.

Talk about the access-token logout limitation, seven-day family expiry, origin checks, and why tests use an isolated database. State that Docker and production deployment remain unverified until actually run.

## LinkedIn draft for review
I built an authentication service during my Arrowstack Full Stack Development internship using TypeScript, Express, PostgreSQL, Prisma, and React. The project includes password hashing, server-enforced roles, rotating refresh sessions, audit events, and automated API and browser tests. My main learning was tracing authentication from the browser through business rules to database constraints, and testing failure cases as carefully as successful login. Demo and repository links: add after review and publication. Tag the official Arrowstack account selected in the dashboard; do not guess its handle.

This draft has not been published. Task 2 needs its own repository, demonstration, and second internship post.
