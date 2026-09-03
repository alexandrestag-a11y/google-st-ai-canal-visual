# Sentinel Journal 🛡️

## 2025-05-18 - Unsanitized Unified Database Endpoint Exposure
**Vulnerability:** The public `GET /api/db` endpoint returned the raw JSON store (`db.json`), exposing sensitive tables containing `users` credentials/emails and `orders` customer PII.
**Learning:** Convenience hydration endpoints returning full database dumps can unintentionally leak non-public tables if objects are serialized without explicit projection or key removal.
**Prevention:** Always destructure or map database responses to strip sensitive keys (`users`, `orders`, authentication tokens) before returning data to public clients.
