## 2026-07-05 - [Unsanitized Unified DB Endpoint Leakage]
**Vulnerability:** The public endpoint `/api/db` directly returned the complete JSON database output without filtering sensitive collections, exposing registered user profile records (`users`) and commercial purchase histories (`orders`).
**Learning:** Returning raw database state dumps via public API endpoints for client-side state initialization bypassing access controls or model projection can inadvertently expose sensitive PII and confidential transaction records.
**Prevention:** Always destructure, sanitize, or explicitly whitelist properties returned by public endpoint handlers instead of returning raw database objects.
