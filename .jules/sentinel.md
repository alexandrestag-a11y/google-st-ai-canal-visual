## 2026-07-05 - Exposing Sensitive Data via Unified Initial State Endpoint
**Vulnerability:** The public endpoint `/api/db` was returning the entire `db.json` payload, leaking sensitive `users` and `orders` data (PII, emails, purchase records) to unauthenticated public requests.
**Learning:** Monolithic single-file DB endpoints designed for quick React hydration easily leak private database collections when sensitive keys (such as `users` or `orders`) are included in the JSON database structure.
**Prevention:** Destructure and explicitly omit sensitive collections (`users`, `orders`) from unified state endpoint responses before returning them to clients.
