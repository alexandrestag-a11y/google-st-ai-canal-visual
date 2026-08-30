## 2026-07-05 - Unified Endpoint Sensitive Data Exposure
**Vulnerability:** The `/api/db` endpoint dumped the entire contents of `server/db.json` including sensitive collections like `users` and `orders` without filtering.
**Learning:** Express helper endpoints returning raw database objects can inadvertently leak sensitive user data and transaction logs to unauthenticated clients.
**Prevention:** Always destructure or sanitize JSON database payloads prior to responding on public endpoints, or explicitly serve public-only sub-resources.
