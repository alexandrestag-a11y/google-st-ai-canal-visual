# Sentinel's Journal

## 2026-11-07 - Dynamic Sitemap XML Injection and XSS
**Vulnerability:** The `/sitemap.xml` endpoint constructed raw XML strings by concatenating untrusted database fields (`page.slug`, `product.id`, and `paintScheme.id`) directly into `<loc>` tags without sanitization or XML escaping. An attacker creating or updating pages, products, or schemes with payloads containing `<`, `>`, `&`, `'`, or `"` could inject arbitrary XML nodes or cause malformed XML / stored XSS in XML-rendering clients.
**Learning:** In applications using template strings to generate XML responses (such as SEO sitemaps or feeds) instead of a dedicated XML builder library, string concatenation bypasses HTML escaping mechanisms typically present in templating engines.
**Prevention:** Always escape XML reserved characters (`&`, `<`, `>`, `'`, `"`) or use a structured XML serializer when dynamically assembling XML feeds from stored database records.
