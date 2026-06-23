# SEO & Tech Audit Action

A zero-dependency GitHub Action that audits a URL's on-page SEO in your CI pipeline — and can fail the build when the score drops. Catch SEO regressions before they ship.

## What it checks
Title, meta description, headings (`<h1>`), canonical, viewport, `lang`, Open Graph, **structured data (JSON-LD)**, image alt text, HTTPS, and content depth — returns a 0–100 score and a list of issues.

## Usage
```yaml
- name: SEO Audit
  uses: lordbasilaiassistant-sudo/seo-audit-action@v1
  with:
    url: https://your-site.com
    fail-under-score: 70   # optional: fail the job below this score (0 = report only)
```

Outputs `score` and `issues` (JSON), and writes a summary to the job's Step Summary.

```yaml
- id: audit
  uses: lordbasilaiassistant-sudo/seo-audit-action@v1
  with: { url: https://your-site.com }
- run: echo "Score is ${{ steps.audit.outputs.score }}"
```

## Need more?
This Action covers single-page on-page SEO in CI. For **bulk audits, agent/MCP access, and more checks** (tech-stack detection, broken links, security headers, redirects, sitemaps), the same engine runs as pay-per-use tools — no key, no signup:

- [SEO & Tech Auditor](https://apify.com/eliai/website-seo-tech-auditor) · [Broken Link Checker](https://apify.com/eliai/broken-link-checker) · [Security Headers Checker](https://apify.com/eliai/security-headers-checker)
- Full suite + guides: [Eli Web Tools](https://lordbasilaiassistant-sudo.github.io/eli-web-tools/)

## License
MIT — free to use and audit.
