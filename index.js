// SEO & Tech Audit — GitHub Action (no dependencies, Node 20+). By Eli Web Tools.
const fs = require('fs');

const one = (html, re) => { const m = html.match(re); return m ? m[1].trim().replace(/\s+/g, ' ') : null; };

async function audit(url) {
  const r = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SEOAuditAction/1.0)' }, signal: AbortSignal.timeout(20000) });
  const html = await r.text();
  const title = one(html, /<title[^>]*>([^<]*)<\/title>/i);
  const desc = one(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) || one(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const canonical = one(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i);
  const viewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  const lang = one(html, /<html[^>]+lang=["']([^"']*)["']/i);
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);
  const og = (html.match(/<meta[^>]+property=["']og:[^"']*["']/gi) || []).length;
  const jsonLd = (html.match(/<script[^>]+type=["']application\/ld\+json["']/gi) || []).length;
  const imgs = (html.match(/<img\b[^>]*>/gi) || []);
  const imgsNoAlt = imgs.filter((t) => !/\balt=/.test(t)).length;
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');
  const words = (text.match(/\b[a-zA-Z]{2,}\b/g) || []).length;

  const issues = [];
  if (!title) issues.push('Missing <title> tag');
  else if (title.length < 10 || title.length > 60) issues.push(`Title length ${title.length} (ideal 10-60)`);
  if (!desc) issues.push('Missing meta description');
  else if (desc.length < 50 || desc.length > 160) issues.push(`Meta description length ${desc.length} (ideal 50-160)`);
  if (h1s.length === 0) issues.push('No <h1> heading');
  else if (h1s.length > 1) issues.push(`Multiple <h1> headings (${h1s.length})`);
  if (!canonical) issues.push('No canonical link');
  if (!viewport) issues.push('No viewport meta (mobile-unfriendly)');
  if (!lang) issues.push('No <html lang> attribute');
  if (og === 0) issues.push('No Open Graph tags');
  if (jsonLd === 0) issues.push('No structured data (JSON-LD)');
  if (imgs.length && imgsNoAlt) issues.push(`${imgsNoAlt}/${imgs.length} images missing alt text`);
  if (!url.startsWith('https')) issues.push('Not served over HTTPS');
  if (words < 300) issues.push(`Thin content (~${words} words)`);

  return { score: Math.max(0, 100 - issues.length * 8), issues };
}

(async () => {
  const url = process.env.INPUT_URL;
  const failUnder = parseInt(process.env['INPUT_FAIL-UNDER-SCORE'] || '0', 10);
  if (!url) { console.error('::error::input "url" is required'); process.exit(1); }
  let res;
  try { res = await audit(url); }
  catch (e) { console.error(`::error::audit failed: ${(e.message || '').slice(0, 120)}`); process.exit(1); }

  console.log(`\nSEO & Tech Audit — ${url}`);
  console.log(`Score: ${res.score}/100  (${res.issues.length} issue(s))`);
  res.issues.forEach((i) => console.log(`  • ${i}`));
  console.log('\nFor bulk/agent audits + more checks: https://apify.com/eliai/website-seo-tech-auditor');

  const out = process.env.GITHUB_OUTPUT;
  if (out) fs.appendFileSync(out, `score=${res.score}\nissues=${JSON.stringify(res.issues)}\n`);
  const sum = process.env.GITHUB_STEP_SUMMARY;
  if (sum) fs.appendFileSync(sum, `### SEO Audit: ${url}\n\n**Score: ${res.score}/100** — ${res.issues.length} issue(s)\n\n${res.issues.map((i) => `- ${i}`).join('\n')}\n`);

  if (failUnder > 0 && res.score < failUnder) {
    console.error(`::error::SEO score ${res.score} is below the threshold of ${failUnder}`);
    process.exit(1);
  }
})();
