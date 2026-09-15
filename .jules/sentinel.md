## 2025-05-18 - [Sanitize Unified Database Endpoint]
**Vulnerability:** The `/api/db` endpoint returned the entire `db.json` database object to the frontend, exposing sensitive tables (`users` and `orders`) containing PII and customer purchase history.
**Learning:** Monolithic or helper database endpoints intended for initial SPA state hydration can leak sensitive database sections if not explicitly sanitized.
**Prevention:** Always strip sensitive keys or sanitize payloads at the route handler layer before returning database state to client-facing endpoints.
