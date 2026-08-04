# Sentinel Security Journal 🛡️

This journal records critical security learnings and vulnerability patterns discovered in this codebase to prevent regression and ensure secure software architecture.

## 2026-07-06 - [Exposed Database State and Sensitive Personal Identifiable Information (PII)]
**Vulnerability:** Unauthenticated clients could access the raw `/api/db` endpoint which returned the entire database state including raw, unmasked customer PII (e.g. emails, full names, and complete order history). Additionally, administrative API endpoints for categories, CMS pages, schemes, and media lacked proper GET handlers, resulting in HTML SPA fallback exposures and unaligned, fragile routes.
**Learning:** The database state was directly serialized and returned as-is via a unified endpoint for initial client state loading, without a secure sanitization layer. Missing endpoints were not properly intercepted, causing fallback responses to expose server structures or return non-JSON contents to API-fetching clients.
**Prevention:** Implement a robust PII masking utility to strip or obfuscate customer details (such as names and emails) at the API boundary, protecting consumer privacy. Ensure all resource routes are fully registered with exact GET handlers to avoid SPA page fallback behaviors for API paths.
