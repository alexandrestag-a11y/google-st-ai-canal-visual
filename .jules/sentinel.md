## 2026-07-05 - [Data Exposure] Excluded Sensitive Users Data from Unified Endpoint
**Vulnerability:** The `/api/db` endpoint was dumping the full `db.json` database content, which contained user records including emails and roles.
**Learning:** Returning raw database state for frontend initialization inadvertently exposes internal collections that are not needed by the client.
**Prevention:** Always destructure or sanitize database outputs at the API layer to strip out sensitive collections or fields before sending JSON responses.
