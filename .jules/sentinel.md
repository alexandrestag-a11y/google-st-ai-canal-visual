## 2025-05-18 - XML Injection in Dynamic Sitemap Generation

**Vulnerability:** Dynamic route `/sitemap.xml` directly interpolated user/admin-controllable strings (`page.slug`, `p.id`, `s.id`, `APP_URL`) into raw XML template literals without escaping XML metacharacters (`<`, `>`, `&`, `"`, `'`).
**Learning:** Even when output is served as application/xml or plain text, unescaped interpolation allows XML injection, potentially breaking XML parsing for search engine crawlers, injecting unexpected XML tags, or causing XSS if viewed in XML-rendered browser contexts.
**Prevention:** Always sanitize dynamic content using a dedicated `escapeXml` helper or proper XML builder before injecting into XML document strings.
