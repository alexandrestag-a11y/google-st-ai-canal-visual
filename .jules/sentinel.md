## 2026-07-06 - Sanitize Unified Database Endpoint Response
**Vulnerability:** The `/api/db` endpoint returned the entire `db.json` database structure, exposing sensitive user records (`users`) and order history (`orders`) to unauthenticated client requests.
**Learning:** Returning full DB snapshots for initial state without filtering sensitive keys risks exposing PII and order history.
**Prevention:** Always destructure or explicitly map returned properties on unified DB or status endpoints to ensure sensitive collections remain server-side only.
