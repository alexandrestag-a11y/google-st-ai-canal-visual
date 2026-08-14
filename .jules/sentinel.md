# Sentinel's Journal - Critical Security Learnings

## 2026-08-14 - Exposing Sensitive Data in Unified API Database Endpoints
**Vulnerability:** The `/api/db` endpoint was returning the entire local database (`db.json`) payload, including highly sensitive fields like `users` (credentials and emails) and `orders` (PII and transactions) to unauthenticated requests.
**Learning:** Developers often create convenient unified endpoints to quickly populate client-side state without filtering or sanitizing the database tables returned, inadvertently leaking private user credentials and transaction records.
**Prevention:** Always implement explicit sanitization/whitelist filtering at the API layer when returning database records to ensure sensitive tables or fields (such as passwords, salts, PII, and administrative tables) are never exposed.
