## 2026-07-05 - Unified Database Endpoint Sensitive Data Leakage
**Vulnerability:** The public `/api/db` endpoint returned the complete contents of `db.json`, including sensitive `users` and `orders` data.
**Learning:** Monolithic initial-state database endpoints can easily leak private user credentials and transaction histories if whole-object returns are used without strict property filtering.
**Prevention:** Destructure and explicitly whitelist public collections or omit sensitive keys before returning initial application state.
