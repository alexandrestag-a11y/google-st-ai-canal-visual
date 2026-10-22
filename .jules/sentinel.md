## 2026-07-06 - Sensitive User Data Exposure in Public Database Endpoint
**Vulnerability:** The `/api/db` endpoint was returning raw `db.json` contents without stripping sensitive credential fields from user objects.
**Learning:** Public or client-facing initial state hydration endpoints often serialize full DB models without applying field projection or sanitization filters.
**Prevention:** Always sanitize or map database records to clean response DTOs that explicitly exclude sensitive fields (`password`, `token`, `secret`) before sending API responses.
