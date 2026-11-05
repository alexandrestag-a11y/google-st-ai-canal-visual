# Sentinel Journal

## 2026-11-05 - XML Injection & XSS Prevention in Dynamic Sitemap Generation
**Vulnerability:** The dynamic `/sitemap.xml` endpoint constructed an XML document by concatenating raw, unsanitized strings (`appUrl`, page `slug`, product `id`, paint scheme `id`) directly inside `<loc>` XML tags. Any unescaped characters such as `&`, `<`, `>`, `"`, or `'` in slugs or product IDs would result in malformed XML or potential injection issues when consumed by downstream parsers or XML renderers.
**Learning:** Dynamic XML endpoints (like sitemaps, RSS feeds) often get overlooked for sanitization because developers assume database IDs and slugs are benign. When external users or admin CMS fields feed directly into XML templates, escaping is required.
**Prevention:** Always sanitize dynamic inputs interpolated into XML templates using an `escapeXml` utility, encoding the 5 predefined XML entities (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&apos;`).
