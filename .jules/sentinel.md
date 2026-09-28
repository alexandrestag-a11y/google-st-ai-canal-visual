# Sentinel Security Journal

## 2026-07-05 - Exposed Sensitive Data in Public DB Endpoint
**Vulnerability:** The unified database endpoint `/api/db` returned full database contents including sensitive `users` and `orders` data without authentication or sanitization.
**Learning:** Returning complete database dump objects for initial client state easily leaks private user and transaction records if sensitive keys are not explicitly excluded.
**Prevention:** Always sanitize server responses that serve raw DB objects, removing sensitive or private user collections before responding to public clients.
