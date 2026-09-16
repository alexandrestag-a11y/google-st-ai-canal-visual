## 2026-07-05 - Public Database Dump Exposes Sensitive PII
**Vulnerability:** The GET `/api/db` endpoint was dumping the full `db.json` database contents including user credentials and order histories to unauthenticated users.
**Learning:** Monolithic convenience endpoints created for dev state initialization often inadvertently leak internal sensitive data structures when reused publicly.
**Prevention:** Always strip sensitive collections (`users`, `orders`, internal credentials) from public dump responses or implement strict authentication/authorization checks.
