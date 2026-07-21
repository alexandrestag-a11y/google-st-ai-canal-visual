## 2026-07-21 - [PII Leakage and Security Hardening in Express Database Endpoint]
**Vulnerability:** Public exposure of sensitive database collections containing PII (personally identifiable information) and order details through a unified `/api/db` endpoint.
**Learning:** Returning raw database dumps via generic API endpoints leaks user data, admin hashes/profiles, and customer transaction history. Additionally, the lack of secure response headers (like X-Frame-Options, X-Content-Type-Options) opens the application to clickjacking and MIME-sniffing.
**Prevention:** Always filter out sensitive tables or fields (such as `users` and `orders` data) from public APIs, enforce secure response headers, and disable headers that reveal server technology (like `X-Powered-By`).
