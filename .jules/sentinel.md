# Sentinel's Journal

This journal documents critical security learnings, vulnerability patterns discovered in this codebase, fixes with unexpected side effects, and surprising security architectural gaps or patterns.

## 2026-07-10 - [Unified DB Endpoint Sensitive Data Exposure]
**Vulnerability:** The `/api/db` endpoint returned the entire unsegmented `server/db.json` contents including sensitive user records (`users`) and order details (`orders`), which exposed customer PII (names, emails) and transaction records to unauthenticated clients.
**Learning:** Monolithic database representations in lightweight mock/JSON-backed architectures often tempt developers to provide a single dump endpoint for state hydration without segregating administrative/PII collections from public storefront data.
**Prevention:** Always explicitly omit or filter out sensitive models (`users`, `orders`, credentials) when providing public bootstrap or state endpoints, adopting an allowlist or strict exclusion approach.
