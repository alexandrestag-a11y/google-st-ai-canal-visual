## 2025-05-18 - Sanitizing Unified Database Endpoint Response

**Vulnerability:** The GET `/api/db` endpoint was returning the raw JSON database object containing `users` (PII like email addresses) and `orders` (customer transaction history) to unauthenticated callers.

**Learning:** Unified database endpoints serving state to client applications often read the entire underlying database JSON without filtering sensitive fields or tables, leaking customer and account data.

**Prevention:** Explicitly sanitize endpoint responses by destructuring and omitting sensitive collections (`users`, `orders`) before sending JSON to public clients.
