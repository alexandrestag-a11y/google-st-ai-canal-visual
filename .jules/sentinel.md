# Sentinel's Journal - Critical Security Learnings

## 2026-03-09 - Personal Identifiable Information Exposure in Unified Endpoints and Order Logs
**Vulnerability:** Exposed sensitive client and admin personal identifiable information (PII) including cleartext emails and full names in the `/api/db` endpoint response, and lacking a sanitized `GET /api/orders` endpoint which was requested by the client-side Admin Panel but not implemented securely on the server-side.
**Learning:** Monolithic database dumps (like returning a full JSON file from an Express backend) often inadvertently leak internal collections such as `users` and `orders` that contain customer PII. Similarly, not explicitly defining GET routes for frontend requests might lead to developer oversight or default/unsecured fallback implementations.
**Prevention:** Always sanitize/whitelist returned collections from general endpoints. Mask sensitive field elements (such as `userName` and `userEmail`) in any API responses destined for standard user interfaces.
