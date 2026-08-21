## 2026-07-05 - Unsanitized Endpoint Data Exposure
**Vulnerability:** The `/api/db` endpoint returned the entire un-sanitized contents of `db.json`, exposing sensitive user details (PII) and customer orders to unauthenticated clients.
**Learning:** Returning entire database objects for client convenience without field/table filtering bypasses access controls and leaks private data.
**Prevention:** Always explicitly destructure, project, or sanitize database responses to omit internal or sensitive tables (`users`, `orders`, credentials) before returning payload to public API endpoints.
