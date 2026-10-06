## 2025-05-18 - [Exposed User Data in `/api/db` Endpoint]
**Vulnerability:** Unauthenticated users could request the `/api/db` endpoint and receive full dump of the JSON database including user account details (`users`).
**Learning:** Returning a whole database state object directly in public initial state endpoints without field-filtering risks exposing private user data or credentials.
**Prevention:** Always sanitize state payload objects or use explicit list projections when returning database state via public API endpoints.
