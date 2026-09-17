## 2026-07-05 - [Public Database Endpoint Information Exposure]
**Vulnerability:** The `/api/db` endpoint returned the entire raw contents of `db.json`, exposing sensitive user profiles (`users`) and order history (`orders`) publicly to unauthenticated clients.
**Learning:** Monolithic database files used for rapid frontend initial state hydration often inadvertently leak internal/sensitive tables if returned directly without sanitization.
**Prevention:** Always destructure or explicitly filter database fields at the API response boundary to ensure only public entities (e.g. products, categories, public pages) are exposed to client applications.
