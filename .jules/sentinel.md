# Sentinel's Journal

This journal documents critical security learnings, vulnerability patterns discovered in this codebase, fixes with unexpected side effects, and surprising security architectural gaps or patterns.

## 2026-03-01 - [Express Server Hardening]
**Vulnerability:** Information leakage via `X-Powered-By` header and susceptibility to common attacks (like clickjacking, MIME-sniffing, and cross-site scripting) due to missing key HTTP security headers.
**Learning:** By default, Express reveals its framework name in the response headers, helping attackers target framework-specific exploits. Additionally, without explicit security-hardening headers, browsers might execute unexpected content types or allow unauthorized framing of the application.
**Prevention:** Always disable the `X-Powered-By` header and add hardening middleware (setting `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, and `Referrer-Policy: no-referrer`) to ensure secure-by-default server responses.
