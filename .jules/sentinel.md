## 2026-07-06 - Sanitizing Public Unified Database Endpoint
**Vulnerability:** The unified database endpoint `/api/db` was exposing the entire raw database JSON, including sensitive `users` and `orders` collections (containing names, emails, roles, and order details), to unauthenticated client requests.
**Learning:** While unified database endpoints can simplify initial state loading in demo applications, they bypass entity-specific access controls and leak sensitive database fields if not explicitly filtered.
**Prevention:** Avoid returning raw databases directly; always sanitize dynamic API outputs by explicitly omitting sensitive collections like `users` and `orders` from the returned JSON payloads.
