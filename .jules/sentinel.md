## 2026-07-05 - [Security Hardening Headers & Powered-By Disclosure]
**Vulnerability:** Exposed Express server signature via `X-Powered-By` header and missing security headers (such as `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, and `Referrer-Policy`), making the application susceptible to clickjacking, MIME-sniffing exploits, and technical details leak.
**Learning:** Default configurations of Express do not include security-related headers, exposing technical details of the stack and leaving users vulnerable to web-based attacks on the frontend layer.
**Prevention:** Always disable default powered-by headers and implement explicit security middleware to configure defensive HTTP headers on all API/server responses.
