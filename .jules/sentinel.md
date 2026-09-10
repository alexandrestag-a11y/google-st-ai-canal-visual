# Sentinel Security Journal

## 2026-07-05 - [Unified DB Payload Data Leak]
**Vulnerability:** The public `/api/db` endpoint dumped the entire JSON database including sensitive user records and order history to any requester.
**Learning:** Monolithic database dump endpoints designed for SPA initial state hydration easily expose sensitive administrative and PII tables if unfiltered.
**Prevention:** Explicitly destructure and white-list or sanitize response payloads before returning whole database objects.
