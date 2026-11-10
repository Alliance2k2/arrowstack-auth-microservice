# Local operations and production preparation

## Environment
Backend .env.example documents NODE_ENV, PORT, DATABASE_URL, JWT_SECRET, and WEB_ORIGIN. JWT_SECRET must have at least 48 characters; use random bytes rather than a sentence. Use separate secrets and databases per environment. PostgreSQL credentials with special characters must be URL-encoded.

Run npm ci, npm run db:generate, npm run db:migrate, npm run build, npm start from backend. Apply migrations deliberately; do not use schema reset on existing data. prisma migrate dev is only for authoring new development migrations.

## Local Docker
Root compose.yaml builds both applications and starts PostgreSQL 18 with a persistent volume. Only the frontend port is published, on loopback. Backend runs migration deploy, then starts; frontend waits for database readiness. Root .env holds random hex POSTGRES_PASSWORD and JWT_SECRET. Use docker compose up --build, docker compose logs, and docker compose down. Do not add -v unless intentionally deleting the database volume.

Docker is unavailable in this development environment; container builds and Compose execution must be verified on a Docker-enabled host before submission. A passing native build is not container evidence.

## Production preparation
Compose is configured for local HTTP development. For production, provide HTTPS via a configured reverse proxy, set NODE_ENV=production and the HTTPS WEB_ORIGIN, replace development database credentials, restrict networking, use a dedicated migration job, back up/restore the database, and configure monitoring and shared rate limits for multiple instances. Use same-site routing for the frontend/API so Strict refresh cookies work. No public deployment has been authorized or performed.

Server startup waits for PostgreSQL. SIGINT/SIGTERM stops accepting connections and disconnects Prisma, with a 10-second shutdown bound. /health is liveness; /ready checks a database query. Keep detailed operational diagnostics outside public API responses and never log credentials.
