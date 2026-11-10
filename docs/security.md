# Security controls and limits

Implemented: Argon2id password hashing, strict Zod request validation, normalized email, database uniqueness, JWT HS256 verification constrained by algorithm/issuer/audience/expiry, current database role checks, HttpOnly SameSite=Strict refresh cookies, hashed refresh storage, transactional rotation, replay-family revocation, logout revocation, origin/custom-header checks, bounded request bodies, security headers, rate limits, safe errors, validated environment configuration, and sanitized audit events.

Access JWT lifetime: 10 minutes. Refresh family lifetime: 7 days from login. Logout prevents refresh but already-issued access JWTs can remain valid until expiration. Role changes take effect immediately because protected requests reload the user.

Browser stores the access token in memory only. Cookie Secure is enabled in production. Every auth POST must include exact WEB_ORIGIN as Origin and X-Requested-With: arrowstack-web. The latter triggers browser preflight for cross-origin attackers. SameSite is defense in depth, not the sole CSRF defense. CORS is restricted to one configured origin. Do not add wildcard credentialed origins.

Login uses a generic failure message and dummy password verification for unknown accounts. Registration returns 409 for duplicates, which still permits account enumeration; this usability tradeoff is explicit. Rate limiting is per process/IP and suitable for this single-instance demo. Multi-instance production requires a shared limiter. Behind a reverse proxy, configure trusted proxies explicitly before relying on client IP; the local Compose proxy conservatively shares a limit across users.

Development admin provisioning refuses production and existing accounts. Never commit credentials. No default accounts exist. Audit logs contain action names and user IDs only. Password reset, email verification, MFA, centralized monitoring, retention automation, and a broader penetration test are future work.

HTTPS termination is required for deployment; production WEB_ORIGIN must use HTTPS. The supplied HTTP Compose setup is local only. Swagger UI has a relaxed CSP for its inline bootstrap; API routes retain Helmet defaults. Swagger responses do not contain secrets.

Design reference: OWASP CSRF Prevention Cheat Sheet, https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html . Implementation verification is recorded separately in testing.md; this document is not a claim of an independent security audit.
