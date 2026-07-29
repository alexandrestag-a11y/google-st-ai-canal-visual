# Sentinel Security Journal

This journal records critical security learnings, vulnerability patterns, and architectural security findings in the Canal Visual application.

## 2026-07-29 - [Exposed Database and Customer PII Leakage]
**Vulnerability:** The `/api/db` endpoint returned the entire local JSON database, including raw customer profiles (`users` collection containing names, roles, and email addresses) and raw transaction/purchase details (`orders` collection containing customer emails and names) to any unauthenticated client. Furthermore, there was no dedicated `GET /api/orders` endpoint, resulting in front-end data fetching being directed to unhandled endpoints which fell back to serving `index.html`.
**Learning:** A "unified database endpoint" like `/api/db` is highly convenient during prototyping, but unless strictly sanitized, it acts as a critical data exposure vector. Furthermore, missing backend routing fallbacks can lead to unexpected behaviors where sensitive logic is ignored or incorrect routing paths are followed.
**Prevention:** Always sanitize administrative data-dump endpoints to explicitly omit collections containing PII, and design dedicated endpoints with precise input masking mechanisms (such as obfuscating emails and names) to uphold privacy-by-default principles.
