# API contract

Machine-readable source: backend/src/openapi.json. Served at /api/openapi.json; Swagger UI at /api/docs.

| Method | Route | Access |
| --- | --- | --- |
| GET | /api/v1/health | Public; process liveness only |
| GET | /api/v1/ready | Public; database check |
| POST | /api/v1/auth/register | Trusted browser origin; creates USER |
| POST | /api/v1/auth/login | Trusted browser origin |
| POST | /api/v1/auth/refresh | Refresh cookie + trusted origin |
| POST | /api/v1/auth/logout | Refresh cookie + trusted origin; idempotent |
| GET | /api/v1/users/me | Bearer JWT |
| GET | /api/v1/admin/users?page=1 | Bearer JWT + current ADMIN role |

All auth POSTs require Origin equal to WEB_ORIGIN and X-Requested-With: arrowstack-web. CLI clients must explicitly supply both headers. Logout returns 204. Registration returns 201 and safe user data, not an authenticated session. Login returns data.user and data.accessToken and sets the cookie. Refresh returns data.accessToken and replaces the cookie. Profile returns data.user. Admin listing returns data.users, data.total, and data.page (20 per page).

Errors have error.message; validation adds error.fields with path/message pairs. Typical codes: 400 invalid input, 401 unauthenticated, 403 insufficient role or untrusted origin, 404 unknown route, 409 duplicate registration, 413 oversized body, 429 rate limit, 500 generic internal error. Do not expose hashes or refresh credentials in JSON.
