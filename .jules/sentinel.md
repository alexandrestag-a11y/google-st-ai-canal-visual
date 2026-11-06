# Sentinel Journal

## 2026-07-07 - XML Injection and Stored XSS Mitigation in Dynamic Sitemap
**Vulnerability:** Dynamic route `/sitemap.xml` directly interpolated database record identifiers and slugs into the raw XML template without XML escaping or URL encoding.
**Learning:** User-controllable CMS pages, products, or paint schemes could contain characters like `<`, `>`, `&`, `"`, or `'` leading to XML structure breaking or potential stored XSS when opened directly in a browser.
**Prevention:** Always sanitize dynamic content interpolated into XML structures using standard XML character entity replacement (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&apos;`) and URI component encoding.
