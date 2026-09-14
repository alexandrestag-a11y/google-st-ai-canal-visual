## 2026-07-06 - Sensitive Data Exposure in Database Dump Endpoint
**Vulnerability:** The public-facing endpoint `/api/db` was returning the entire database JSON payload without sanitization, leaking sensitive user profile details (`users`) and transaction history (`orders`) to unauthenticated visitors.
**Learning:** Returning raw database state directly to frontend client state without stripping sensitive collections leads to severe data exposure issues.
**Prevention:** Always destructure or sanitize database outputs to expose only public collections (`products`, `categories`, `pages`, `paintSchemes`, `mediaFolders`, `mediaFiles`) before returning JSON responses.
