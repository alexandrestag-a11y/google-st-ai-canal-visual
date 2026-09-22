## 2026-07-15 - Exposed Sensitive Tables in Unified Database Endpoint
**Vulnerability:** Unified endpoint `/api/db` dumped raw database JSON containing `users` and `orders` data without sanitization.
**Learning:** Returning aggregate database dumps in single endpoint shortcuts often bypasses table-level access controls and leaks sensitive PII data.
**Prevention:** Always sanitize or explicitly filter sensitive keys/tables (`users`, `orders`, credentials) prior to serializing full database objects to HTTP JSON responses.
