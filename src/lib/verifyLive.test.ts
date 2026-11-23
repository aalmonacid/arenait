import { describe, expect, it } from 'vitest';
// Script .mjs sin tipos: se importa de forma dinámica como objeto genérico.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const v: Record<string, any> = await import('../../scripts/verify-live.mjs');

describe('verify-live: funciones puras', () => {
  it('parseCsp / cspUnsafeInline', () => {
    expect(v.cspUnsafeInline("default-src 'self'; script-src 'self'; style-src 'self'")).toEqual([]);
    expect(v.cspUnsafeInline("script-src 'self' 'unsafe-inline'; style-src 'self'")).toEqual(['script-src']);
  });

  it('missingSecurityHeaders', () => {
    const h = new Headers({ 'Strict-Transport-Security': 'x', 'X-Frame-Options': 'DENY' });
    expect(v.missingSecurityHeaders(h)).toEqual(['x-content-type-options', 'referrer-policy', 'permissions-policy']);
  });

  it('extractMeta', () => {
    const html = `<title>Hola &amp; adiós</title><meta name="description" content="Desc"><link rel="canonical" href="https://arenait.co/"><meta name="robots" content="noindex, nofollow"><meta property="og:image" content="https://arenait.co/og.jpg">`;
    expect(v.extractMeta(html)).toEqual({
      title: 'Hola & adiós',
      description: 'Desc',
      canonical: 'https://arenait.co/',
      robots: 'noindex, nofollow',
      ogImage: 'https://arenait.co/og.jpg',
    });
  });

  it('findInlineScripts ignora src y JSON-LD', () => {
    const html = `<script src="/a.js"></script><script type="application/ld+json">{}</script><script>alert(1)</script>`;
    expect(v.findInlineScripts(html)).toEqual(['alert(1)']);
  });

  it('findStyleAttributes', () => {
    expect(v.findStyleAttributes('<div style="color:red">x</div><p class="a">y</p>')).toHaveLength(1);
    expect(v.findStyleAttributes('<p class="a">y</p><script>"style=\'x\'"</script>')).toHaveLength(0);
  });

  it('sitemap y origen', () => {
    expect(v.parseSitemapLocs('<loc>https://a.co/x</loc><loc> https://a.co/y </loc>')).toEqual(['https://a.co/x', 'https://a.co/y']);
    expect(v.swapOrigin('https://arenait.co/nosotros/', 'https://dev.arenait.co')).toBe('https://dev.arenait.co/nosotros/');
  });

  it('versiones de política', () => {
    expect(v.extractPolicyVersion('<p>Versión 1.2 — Última actualización: 20/11/2026</p>')).toBe('1.2');
    expect(v.extractFormPolicyVersion('<form data-policy-version="1.2" novalidate>')).toBe('1.2');
  });

  it('robots', () => {
    expect(v.robotsBlocksAll('User-agent: *\nDisallow: /\n')).toBe(true);
    expect(v.robotsBlocksAll('User-agent: *\nDisallow: /admin\n')).toBe(false);
    expect(v.isNoindex('noindex, nofollow')).toBe(true);
    expect(v.isNoindex('index, follow')).toBe(false);
  });

  it('createReporter: devExpected degrada a ⚠ solo fuera de prod', () => {
    const quiet = () => {};
    const dev = v.createReporter(false, quiet);
    dev.check(false, 'ok', 'mal', { devExpected: true });
    expect(dev.counts).toMatchObject({ warn: 1, fail: 0 });
    const prod = v.createReporter(true, quiet);
    prod.check(false, 'ok', 'mal', { devExpected: true });
    expect(prod.counts).toMatchObject({ warn: 0, fail: 1 });
  });
});
