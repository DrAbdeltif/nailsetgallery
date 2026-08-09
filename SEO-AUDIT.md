# NailSet Gallery enterprise SEO audit

Audit date: 2026-08-06  
Scope: local Astro source, generated production output, content metadata, and requested live-domain checks.

## Executive summary

The site has a strong technical foundation: Astro 7, a configured canonical site URL, trailing-slash normalization, generated XML sitemap, RSS, responsive image dimensions on gallery cards, Open Graph/Twitter metadata, JSON-LD, and AI discovery files. The production build completes successfully.

The main risks are content-quality and measurement risks rather than a missing meta tag: the repository contains 47 blog posts but `src/content/blog_audit_results.json` reports only 27, tag archives create a very large crawl surface, author/entity signals were previously pointed at non-existent `/author/` URLs, and live HTTP/DNS/redirect/Core Web Vitals checks could not be completed from this environment because `nailsetgallery.com` did not resolve.

## Scorecard

| Area | Score | Finding |
| --- | ---: | --- |
| Technical SEO | 7/10 | Good metadata, canonical, robots, RSS, and sitemap setup; sitemap hygiene and live verification needed. |
| Google SEO | 6/10 | Good crawlable HTML and internal linking; E-E-A-T evidence, editorial provenance, and Search Console data are unverified. |
| Bing SEO | 6/10 | Bingbot is allowed and IndexNow endpoints exist; IndexNow submission and Webmaster diagnostics are unverified. |
| GEO / AI search | 7/10 | `llms.txt`, `llms-full.txt`, descriptive HTML, and schema are present; entity and citation evidence needs strengthening. |
| Content | 6/10 | 47 posts cover useful clusters, but date-heavy trend content, overlap, and uneven authority signals need editorial review. |
| Architecture | 6/10 | Clear blog/category structure; tags are numerous and can dilute crawl and topical signals. |
| Performance | 6/10 | Astro and eager hero loading are positive; real LCP, INP, CLS, image bytes, and third-party impact require field/lab testing. |
| UX / accessibility | 7/10 | Skip link, semantic landmarks, alt text, and mobile navigation are present; test keyboard flows and contrast in Lighthouse. |
| Security | 6/10 | HTTPS is configured by canonical; baseline response security headers were added, but production headers and CSP still need verification. |
| Monetization | 5/10 | AdSense/disclosure assets exist; ad density, consent, affiliate disclosures, and RPM cannot be validated from source alone. |

## Verified technical findings

### Crawlability and indexability

- `public/robots.txt` allows all relevant search and AI crawlers and points to the sitemap index.
- The invalid `llms.txt` sitemap declaration and duplicate direct sitemap declaration were removed. `llms.txt` is a reference document, not an XML sitemap.
- Generated `sitemap-index.xml` points to `sitemap-0.xml`; generated sitemap output contains no `/api/` or `/404` URLs after filtering.
- Canonicals are emitted from the shared layout using the normalized pathname and the HTTPS site origin.
- `noindex` support exists in the shared layout, but the current site should make a deliberate policy decision for thin tag/legal archives rather than relying on default indexability.
- The generated build produced 47 blog article routes plus category, tag, legal, quiz, RSS, and utility routes. The content audit JSON is stale because it reports 27 posts.

### Metadata and structured data

- Shared title, description, canonical, Open Graph, Twitter Card, favicon, manifest, RSS, and AI-reference links are present.
- Article output contains `BlogPosting` and `BreadcrumbList`; FAQ schema is emitted when the article has a matching FAQ section.
- Organization schema was added to the shared website graph, and the About page now provides a real Person/author target.
- Article hero images now include explicit `width` and `height`, reducing layout-shift risk.
- `HowTo` is only valid for genuine step-by-step content. Do not force it onto inspiration or trend articles.

### Headers and security

`public/_headers` now sets `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and HSTS. Verify these on the deployed domain. Add a tested CSP only after confirming AdSense, Google Fonts, newsletter, and any analytics origins; an untested CSP can break the site.

## Content audit

The collection schema is appropriate: title, description, dates, author, hero image/alt text, category, tags, and draft state are modeled. Current content clusters are:

- Trends: annual forecasts, seasonal trends, chrome, jelly, aura, cat-eye, and dark palettes.
- Styles/shapes: almond, coffin, French, acrylic, bridal, office, teen, and minimalist looks.
- Care/tutorials: Gel-X, BIAB, removal, press-ons, cuticles, strengtheners, rehab, and natural nail care.
- Colors/seasonal: skin-tone matching, burgundy/cherry, emerald, pastels, summer, fall, winter, and holiday.

Content-level priorities:

1. Refresh the content inventory script so all 47 posts are scored and the report is regenerated from frontmatter rather than a hand-maintained JSON snapshot.
2. Consolidate overlapping dark-trend pages and overlapping teen/seasonal pages where search intent is indistinguishable; use one canonical pillar and supporting pages.
3. Add visible editorial authorship, reviewer credentials, source links, last-reviewed dates, safety boundaries, and first-hand testing notes, especially for nail-health and DIY chemical/gel content.
4. Keep titles and descriptions within pixel-aware limits; several title/description values exceed common SERP display lengths even though the schema allows them.
5. Add a short answer block, comparison table, named entities, and 3–6 contextual internal links to each priority page. Use authoritative external links for nail-health claims.
6. Treat tag pages as UX taxonomy first. Keep only tags with a clear demand, unique introduction, and enough supporting articles; noindex or remove the rest and exclude them from the sitemap.

Recommended pillar structure:

`/trends/` → trend guides → individual technique/style pages  
`/styles/` → shape/style guides → design inspiration pages  
`/colors/` → palette/undertone guides → seasonal color pages  
`/tutorials/` → safe DIY procedures → removal, prep, and care pages  
`/blog/` remains the archive and should link prominently to the four hubs.

## Performance and UX assessment

Positive source signals include Astro server output, limited client-side framework usage, explicit image dimensions on gallery cards and the home hero, eager loading for the LCP candidate, lazy loading for related content, font preconnects, and immutable asset caching from the Cloudflare adapter.

Measure in Lighthouse and CrUX after deployment:

- LCP: verify the hero image and Google Fonts are not competing on mobile.
- INP: profile search modal, quiz, and any newsletter interaction.
- CLS: confirm all card, hero, ad, and font slots reserve space.
- Transfer size: compress the largest JPG/PNG assets to AVIF/WebP and use responsive `srcset` where possible.
- Ads: test AdSense impact separately from the editorial page baseline.

Accessibility checks should cover focus visibility, modal focus trapping and Escape behavior, color contrast in dark mode, accessible names for icon buttons, reduced-motion support, and heading order.

## Bing, IndexNow, and GEO

Bingbot and multiple AI crawlers are explicitly allowed. The repository also contains an IndexNow API route and machine-readable reference documents. These are useful discovery aids, but they do not replace unique, trustworthy HTML content or actual IndexNow submissions.

Implement the deployment workflow to submit the changed article URL and sitemap to IndexNow after publish/update. Validate `msvalidate.01`, IndexNow key hosting, Bing Webmaster crawl reports, and whether the API route is protected from abuse.

For AI answer visibility, prioritize concise definitions, explicit comparisons, stable facts, visible author/reviewer identity, source citations, and strong hub-to-article links. There is no reliable source-only method to guarantee inclusion in ChatGPT Search, AI Overviews, Perplexity, Copilot, or other answer engines.

## 90-day roadmap

### Critical / first 7 days

- Confirm DNS, HTTPS, www/non-www behavior, status codes, redirect chain, and production headers.
- Submit only the sitemap index in Google Search Console and Bing Webmaster Tools.
- Reconcile the 47 live content files with the stale 27-post audit JSON.
- Validate JSON-LD in Rich Results Test and Schema Markup Validator.

### High priority / days 8–30

- Prune or noindex thin tag archives; keep a small set of editorial hubs.
- Consolidate overlapping trend/seasonal pages and map redirects before removing URLs.
- Add author/reviewer pages, editorial policy, sources, and safety disclaimers.
- Run mobile Lighthouse on home, one hub, one article, quiz, and tag page; fix the largest LCP and CLS contributors.
- Submit IndexNow updates from the publish pipeline.

### Medium priority / days 31–60

- Add image optimization and responsive variants for the largest assets.
- Expand comparison tables and answer-first sections on priority pages.
- Build hub pages with curated links, related queries, and unique introductions.
- Add Search Console query/page monitoring and Bing crawl monitoring.

### Low priority / days 61–90

- Test newsletter and affiliate placements against engagement and Core Web Vitals.
- Add video only where it materially improves a procedure; include VideoObject schema only for a real, accessible video.
- Refresh seasonal pages with current-year evidence and archive outdated claims carefully.

## Verification limits

The live-domain checks could not be completed because DNS resolution for `nailsetgallery.com` failed from the audit environment. Therefore no claim is made here about live status codes, redirects, production robots/sitemap responses, indexing, Search Console, Bing Webmaster, backlinks, Lighthouse scores, CrUX, or actual crawl depth. Run those checks from a network that resolves the production domain before release.

## Implementation files changed

- `astro.config.mjs`: sitemap filtering for API and 404 routes.
- `public/robots.txt`: sitemap directive cleanup.
- `public/_headers`: baseline security and privacy headers.
- `src/layouts/BaseLayout.astro`: valid author target and Organization/WebSite entity graph.
- `src/pages/about.astro`: AboutPage and Person schema.
- `src/pages/blog/[slug].astro`: explicit hero image dimensions.

## Content improvements applied

- Added a reusable editorial hub component with a direct answer block, explanatory copy, and contextual links.
- Added unique intent-led introductions to `/colors/`, `/styles/`, `/trends/`, `/tutorials/`, and `/seasons/`.
- Added links from each hub to relevant priority guides, strengthening topic clusters and crawl paths.
- Set tag archive pages to `noindex` and removed them from the XML sitemap while they remain thin filter pages.
- Confirmed the new hub copy, links, noindex directives, and sitemap exclusions in generated output.

## Full article verification pass

All 47 blog articles were parsed and rendered through the production build. Every article produced an HTML page with title, description, canonical, hero image, article schema, breadcrumb schema, FAQ schema, and the new editorial note. The content collection also provides category, tags, publication date, and hero alt text.

The pass corrected unsupported trend-growth percentages, absolute “zero damage” and “damage-free” promises, unverified “salon-tested” wording, universal compatibility claims, pregnancy-safety overclaims, and an unverified medical author identity. These changes improve trustworthiness and reduce policy/E-E-A-T risk.

A literal 10/10 score cannot be guaranteed from source inspection: rankings, backlink authority, real expert review, original research, production Core Web Vitals, and Search Console performance require external evidence. The current source is materially stronger and safer, but each health or chemical-safety article should receive a real qualified review before being marketed as medically expert content.
