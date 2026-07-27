# Sentinel Journal

## 2026-07-06 - [PII Leak and Missing Access Control in Unified DB Endpoint]
**Vulnerability:** The `/api/db` endpoint exposed the entire contents of `db.json`, including sensitive `users` and `orders` collections containing cleartext customer Personally Identifiable Information (PII) such as email addresses, real names, and purchase histories, to any unauthenticated client.
**Learning:** This exposure existed because a unified development endpoint was implemented for convenience without proper filtering or schema serialization, allowing administrative and internal data to be sent directly to the public-facing frontend.
**Prevention:** Always implement strict data filtering and serialization on consolidated API endpoints. Separate administrative or customer-specific records into isolated collections, and ensure clear separation of concerns using field-level sanitization or separate, authenticated API endpoints.
