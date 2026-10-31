# Sentinel Security Journal

## 2026-10-31 - Sitemap XML Injection & Cross-Site Scripting Sanitization
**Vulnerability:** Dynamic route `/sitemap.xml` directly interpolated database record slugs and identifiers into raw XML strings without character escaping, opening the route to XML injection and stored XSS vectors.
**Learning:** Dynamic XML sitemaps built using template strings in Node/Express servers bypass standard template escaping; dynamic fields originating from CMS pages, products, or external CSV imports need XML entity escaping.
**Prevention:** Always sanitize dynamic inputs with an XML entity escaper (`&`, `<`, `>`, `"`, `'`) when building XML documents programmatically.
