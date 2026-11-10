# Sentinel's Journal

This journal documents critical security learnings, vulnerability patterns discovered in this codebase, fixes with unexpected side effects, and surprising security architectural gaps or patterns.

## 2026-03-01 - [Sitemap XML Injection and Entity Escaping]
**Vulnerability:** Unescaped dynamic user and database content interpolated directly into XML strings in `/sitemap.xml` (such as CMS slugs, product IDs, paint scheme IDs, and host URLs).
**Learning:** XML endpoints constructed with template strings without explicit character escaping allow injection of arbitrary XML tags, CDATA breakout, or XSS if viewed in XML-rendering browsers.
**Prevention:** Always sanitize dynamic content using a dedicated XML escaping helper replacing `&`, `<`, `>`, `"`, and `'` with their respective XML entities before template interpolation.
