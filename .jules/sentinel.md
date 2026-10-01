## 2026-07-05 - Public DB Dump Exposing Sensitive User and Order Data
**Vulnerability:** The unified database dump endpoint `/api/db` returned the complete `db.json` database without filtering, leaking sensitive user profile details (`users`) and order transaction history (`orders`).
**Learning:** Convenience endpoints designed to initialize app state can inadvertently dump internal or sensitive tables if whole database objects are serialized directly to JSON responses.
**Prevention:** Explicitly destructure or whitelist public collections before returning aggregate database payloads to public API endpoints.
