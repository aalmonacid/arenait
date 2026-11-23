#!/usr/bin/env node
/**
 * Verificación de solo lectura de un despliegue en vivo.
 *
 *   node scripts/verify-live.mjs [urlBase] [--prod]
 *
 * Sin --prod (por defecto https://dev.arenait.co) los hallazgos propios de
 * dev (noindex, sitemap/canonical con otro dominio, contenido viejo en Sanity)
 * salen como ⚠ «esperado en dev». Con --prod esos mismos hallazgos son ✘.
 * Código de salida 1 si hay algún ✘.
 *
 * Las funciones puras se exportan para probarlas (src/lib/verifyLive.test.ts).
 */
import { pathToFileURL } from 'node:url';

export const SANITY_QUERY_URL = 'https://xbayv7k2.api.sanity.io/v2024-01-01/data/query/production';
export const EXPECTED_CANONICAL_ORIGIN = 'https://arenait.co';
export const SANITY_TYPES = [
  'service',
  'project',
  'post',
  'privacyPolicy',
  'siteSettings',
  'homePage',
  'servicesPage',
  'aboutPage',
  'projectsPage',
  'testimonial',
];
export const EXPECTED_SERVICE_COUNT = 13;

// ---------- Funciones puras ----------

/** Normaliza una lista de pares [nombre, valor] (o un Headers) a un objeto en minúsculas. */
export function parseHeaders(input) {
  const out = {};
  const entries = typeof input?.entries === 'function' ? [...input.entries()] : Object.entries(input ?? {});
  for (const [k, v] of entries) out[String(k).toLowerCase()] = String(v);
  return out;
}

/** Devuelve las directivas de una CSP como { 'script-src': ["'self'", ...] }. */
export function parseCsp(csp) {
  const out = {};
  for (const part of String(csp ?? '').split(';')) {
    const [name, ...values] = part.trim().split(/\s+/);
    if (name) out[name.toLowerCase()] = values;
  }
  return out;
}

/** Directivas de script/style que incluyen 'unsafe-inline' (lista vacía = bien). */
export function cspUnsafeInline(csp) {
  const d = parseCsp(csp);
  return ['script-src', 'style-src'].filter((n) => (d[n] ?? []).includes("'unsafe-inline'"));
}

/** Cabeceras de seguridad base que faltan. */
export function missingSecurityHeaders(headers) {
  const h = parseHeaders(headers);
  return [
    'strict-transport-security',
    'x-frame-options',
    'x-content-type-options',
    'referrer-policy',
    'permissions-policy',
  ].filter((n) => !h[n]);
}

function attr(tag, name) {
  const m = new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(tag);
  return m ? (m[2] ?? m[3] ?? m[4] ?? '') : undefined;
}

function decode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/** Extrae <title>, description, canonical, robots y og:image del HTML. */
export function extractMeta(html) {
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]?.trim();
  const tags = html.match(/<(meta|link)\b[^>]*>/gi) ?? [];
  const meta = {
    title: title ? decode(title) : undefined,
    description: undefined,
    canonical: undefined,
    robots: undefined,
    ogImage: undefined,
  };
  for (const tag of tags) {
    if (/^<link/i.test(tag)) {
      if (attr(tag, 'rel')?.toLowerCase() === 'canonical') meta.canonical = attr(tag, 'href');
      continue;
    }
    const name = attr(tag, 'name')?.toLowerCase();
    const prop = attr(tag, 'property')?.toLowerCase();
    const content = attr(tag, 'content');
    if (name === 'description') meta.description = content && decode(content);
    if (name === 'robots') meta.robots = content;
    if (prop === 'og:image') meta.ogImage = content;
  }
  return meta;
}

/** Scripts en línea (sin src) que no sean JSON-LD. Devuelve el inicio de cada uno. */
export function findInlineScripts(html) {
  const found = [];
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = m[1];
    if (/\ssrc\s*=/i.test(' ' + attrs)) continue;
    if (/type\s*=\s*["']?application\/ld\+json/i.test(attrs)) continue;
    found.push(m[2].trim().slice(0, 60) || '(vacío)');
  }
  return found;
}

/** Atributos style="..." en el HTML (fuera de bloques <script>). */
export function findStyleAttributes(html) {
  const clean = html.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
  return [...clean.matchAll(/<[a-z][^>]*\sstyle\s*=\s*("[^"]*"|'[^']*')[^>]*>/gi)].map((m) =>
    m[0].slice(0, 80),
  );
}

/** URLs <loc> de un sitemap o índice. */
export function parseSitemapLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((m) => decode(m[1]));
}

/** Cambia el origen de una URL por otro (para probar el sitemap de prod contra dev). */
export function swapOrigin(url, base) {
  const u = new URL(url);
  return new URL(u.pathname + u.search, base).toString();
}

/** Versión vigente que muestra la página de política ("Versión 1.2 — Última actualización"). */
export function extractPolicyVersion(html) {
  return /Versi[oó]n\s+(\d+(?:\.\d+)*)\s*(?:—|&mdash;|-)\s*[ÚU]ltima/i.exec(html)?.[1];
}

/** Valor de data-policy-version del formulario de contacto. */
export function extractFormPolicyVersion(html) {
  return /data-policy-version\s*=\s*["']?([\d.]+)/i.exec(html)?.[1];
}

/** robots.txt bloquea todo (`Disallow: /` bajo cualquier agente). */
export function robotsBlocksAll(txt) {
  return /^\s*Disallow:\s*\/\s*$/im.test(txt);
}

/** ¿El robots meta indica noindex? */
export function isNoindex(robots) {
  return /noindex/i.test(robots ?? '');
}

// ---------- Ejecución ----------

const ICON = { ok: '✔', fail: '✘', warn: '⚠', info: 'ℹ' };

export function createReporter(prod, log = console.log) {
  const counts = { ok: 0, fail: 0, warn: 0, info: 0 };
  const rep = {
    counts,
    section: (t) => log(`\n== ${t} ==`),
    emit(status, msg) {
      counts[status]++;
      log(`${ICON[status]} ${msg}`);
    },
    ok: (m) => rep.emit('ok', m),
    fail: (m) => rep.emit('fail', m),
    warn: (m) => rep.emit('warn', m),
    info: (m) => rep.emit('info', m),
    /** Comprobación; si falla y es un caso propio de dev, sale como ⚠ en dev y ✘ en prod. */
    check(cond, okMsg, failMsg, { devExpected = false } = {}) {
      if (cond) return rep.ok(okMsg);
      if (devExpected && !prod) return rep.warn(`${failMsg} — esperado en dev`);
      rep.fail(failMsg);
    },
  };
  return rep;
}

async function get(base, path, opts = {}) {
  const res = await fetch(new URL(path, base), { redirect: 'manual', ...opts });
  return res;
}

async function text(base, path) {
  const res = await get(base, path, { redirect: 'follow' });
  return { res, body: await res.text() };
}

async function sanity(query) {
  const res = await fetch(`${SANITY_QUERY_URL}?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Sanity respondió ${res.status}`);
  return (await res.json()).result;
}

async function main() {
  const args = process.argv.slice(2);
  const prod = args.includes('--prod');
  const base = (args.find((a) => !a.startsWith('--')) ?? 'https://dev.arenait.co').replace(/\/$/, '');
  const r = createReporter(prod);
  console.log(`Verificando ${base} (${prod ? 'PRODUCCIÓN' : 'dev: hallazgos propios de dev salen como ⚠'})`);

  // 1) Rutas
  r.section('1. Rutas');
  const okPaths = [
    '/',
    '/servicios',
    '/proyectos',
    '/blog',
    '/nosotros',
    '/contacto',
    '/politica-de-tratamiento-de-datos',
    '/politica-de-tratamiento-de-datos/version-1-2',
    '/robots.txt',
    '/sitemap-index.xml',
  ];
  for (const p of okPaths) {
    try {
      const res = await get(base, p);
      r.check(res.status === 200, `${p} → 200`, `${p} → ${res.status} (se esperaba 200)`);
    } catch (e) {
      r.fail(`${p} → error de red: ${e.message}`);
    }
  }
  try {
    const res = await get(base, '/ruta-que-no-existe-verify-live');
    r.check(res.status === 404, '/ruta-que-no-existe → 404', `/ruta inexistente → ${res.status} (se esperaba 404)`);
  } catch (e) {
    r.fail(`404: error de red: ${e.message}`);
  }
  for (const [p, dest] of [
    ['/casos-de-estudio', '/proyectos'],
    ['/experiencia.html', '/proyectos'],
  ]) {
    try {
      const res = await get(base, p);
      const loc = res.headers.get('location') ?? '';
      r.check(
        res.status === 301 && loc.endsWith(dest),
        `${p} → 301 ${dest}`,
        `${p} → ${res.status} ${loc} (se esperaba 301 ${dest})`,
      );
    } catch (e) {
      r.fail(`${p}: error de red: ${e.message}`);
    }
  }

  // 2) Cabeceras
  r.section('2. Cabeceras');
  const home = await get(base, '/');
  const hh = parseHeaders(home.headers);
  const missing = missingSecurityHeaders(hh);
  r.check(!missing.length, 'Cabeceras de seguridad base en /', `Faltan en /: ${missing.join(', ')}`);
  r.check(!!hh['content-security-policy'], 'Content-Security-Policy presente en /', 'Falta Content-Security-Policy en /');
  const unsafe = cspUnsafeInline(hh['content-security-policy']);
  r.check(!unsafe.length, "CSP sin 'unsafe-inline' en script-src/style-src", `CSP con 'unsafe-inline' en: ${unsafe.join(', ')}`);

  for (const p of ['/admin', '/api/leads']) {
    try {
      const res = await get(base, p);
      const h = parseHeaders(res.headers);
      const miss = missingSecurityHeaders(h);
      r.check(!miss.length, `${p} (${res.status}) cabeceras base`, `${p} (${res.status}) sin: ${miss.join(', ')}`);
      r.check(h['cache-control'] === 'no-store', `${p} Cache-Control: no-store`, `${p} Cache-Control = ${h['cache-control']}`);
      r.check(/noindex/i.test(h['x-robots-tag'] ?? ''), `${p} X-Robots-Tag noindex`, `${p} sin X-Robots-Tag noindex`);
      if (p === '/admin') {
        r.check(!!h['content-security-policy-report-only'], '/admin CSP en modo solo reporte', '/admin sin Content-Security-Policy-Report-Only');
      } else {
        r.check(/default-src 'none'/.test(h['content-security-policy'] ?? ''), "/api CSP default-src 'none'", '/api sin CSP default-src \'none\'');
      }
    } catch (e) {
      r.fail(`${p}: error de red: ${e.message}`);
    }
  }

  // 3) HTML
  r.section('3. HTML de / y /contacto');
  let contactoHtml = '';
  for (const p of ['/', '/contacto']) {
    const { body } = await text(base, p);
    if (p === '/contacto') contactoHtml = body;
    const m = extractMeta(body);
    r.check(!!m.title, `${p} <title>: ${m.title}`, `${p} sin <title>`);
    r.check(!!m.description, `${p} meta description (${m.description?.length} car.)`, `${p} sin meta description`);
    r.check(!!m.canonical, `${p} canonical: ${m.canonical}`, `${p} sin canonical`);
    if (m.canonical) {
      r.check(
        new URL(m.canonical).origin === EXPECTED_CANONICAL_ORIGIN,
        `${p} canonical con el dominio esperado (${EXPECTED_CANONICAL_ORIGIN})`,
        `${p} canonical con otro dominio: ${m.canonical}`,
      );
    }
    if (m.ogImage) {
      try {
        const res = await get(base, swapOrigin(m.ogImage, base), { redirect: 'follow' });
        const ct = res.headers.get('content-type') ?? '';
        r.check(res.status === 200 && ct.startsWith('image/'), `${p} og:image 200 ${ct} (${m.ogImage})`, `${p} og:image ${res.status} ${ct} (${m.ogImage})`);
      } catch (e) {
        r.fail(`${p} og:image error de red: ${e.message}`);
      }
    } else {
      r.fail(`${p} sin og:image`);
    }
    if (prod) {
      r.check(!isNoindex(m.robots), `${p} indexable (robots: ${m.robots ?? 'sin meta'})`, `${p} con noindex en producción (${m.robots})`);
    } else {
      r.check(isNoindex(m.robots), `${p} noindex (esperado en dev)`, `${p} NO es noindex en dev (robots: ${m.robots ?? 'sin meta'})`);
    }
    const inline = findInlineScripts(body);
    r.check(!inline.length, `${p} sin <script> en línea`, `${p} con ${inline.length} <script> en línea: ${inline.join(' | ')}`);
    const styles = findStyleAttributes(body);
    r.check(!styles.length, `${p} sin atributos style=""`, `${p} con ${styles.length} style="": ${styles.slice(0, 3).join(' | ')}`);
  }
  const { body: robotsTxt } = await text(base, '/robots.txt');
  if (prod) r.check(!robotsBlocksAll(robotsTxt), 'robots.txt sin Disallow: /', 'robots.txt con Disallow: / en producción');
  else r.check(robotsBlocksAll(robotsTxt), 'robots.txt con Disallow: / (esperado en dev)', 'robots.txt no bloquea en dev');

  // 4) Sitemap
  r.section('4. Sitemap');
  try {
    const { body: idx } = await text(base, '/sitemap-index.xml');
    const children = parseSitemapLocs(idx);
    let urls = [];
    for (const c of children) {
      const { body } = await text(base, new URL(c).pathname);
      urls.push(...parseSitemapLocs(body));
    }
    r.info(`${children.length} sitemap(s), ${urls.length} URLs`);
    const origins = [...new Set(urls.map((u) => new URL(u).origin))];
    r.check(
      origins.length === 1 && origins[0] === EXPECTED_CANONICAL_ORIGIN,
      `Dominio del sitemap = canonical (${EXPECTED_CANONICAL_ORIGIN})`,
      `Dominio del sitemap (${origins.join(', ')}) difiere del canonical (${EXPECTED_CANONICAL_ORIGIN})`,
      { devExpected: true },
    );
    const bad = urls.filter((u) => /\/admin(\/|$)|\/politica-de-tratamiento-de-datos\/version-/.test(u));
    r.check(!bad.length, 'Sitemap sin /admin ni /politica.../version-*', `Sitemap incluye: ${bad.join(', ')}`);
    for (const u of urls) {
      const path = new URL(u).pathname;
      try {
        const res = await get(base, path);
        r.check(res.status === 200, `sitemap ${path} → 200`, `sitemap ${path} → ${res.status}`);
      } catch (e) {
        r.fail(`sitemap ${path}: error de red: ${e.message}`);
      }
    }
  } catch (e) {
    r.fail(`Sitemap: ${e.message}`);
  }

  // 5) Política y formulario
  r.section('5. Política y /contacto');
  const { body: polHtml } = await text(base, '/politica-de-tratamiento-de-datos');
  const polVer = extractPolicyVersion(polHtml);
  const formVer = extractFormPolicyVersion(contactoHtml);
  r.check(!!polVer, `Versión vigente de la política: ${polVer}`, 'No se pudo extraer la versión de la política');
  r.check(!!formVer, `/contacto data-policy-version=${formVer}`, '/contacto sin data-policy-version');
  if (polVer && formVer) r.check(polVer === formVer, 'data-policy-version coincide con la política vigente', `data-policy-version ${formVer} ≠ política vigente ${polVer}`);
  r.check(/datos@arenait\.co/.test(polHtml), 'datos@arenait.co en la política', 'datos@arenait.co no aparece en la política');

  // 6) Sanity
  r.section('6. Sanity público anónimo');
  try {
    const counts = await sanity(
      `{${SANITY_TYPES.map((t) => `"${t}": count(*[_type=="${t}" && !(_id in path("drafts.**"))])`).join(', ')}}`,
    );
    r.info(`Conteos (publicados): ${SANITY_TYPES.map((t) => `${t}=${counts[t]}`).join(', ')}`);
    r.check(
      counts.service === EXPECTED_SERVICE_COUNT,
      `service = ${EXPECTED_SERVICE_COUNT}`,
      `service = ${counts.service} (se esperaban ${EXPECTED_SERVICE_COUNT}; contenido viejo en Sanity)`,
      { devExpected: true },
    );
    const leads = await sanity('count(*[_type=="lead"])');
    r.check(leads === 0, 'PRIVACIDAD: count(lead) anónimo = 0', `CRÍTICO: leads visibles sin token (count = ${leads})`);
    const pend = await sanity(
      '*[_type=="project" && authorization=="pendiente" && !(_id in path("drafts.**"))]{title}',
    );
    r.check(
      !pend.length,
      'Ningún project publicado con authorization "pendiente"',
      `${pend.length} project(s) publicado(s) con authorization "pendiente": ${pend.map((p) => p.title).join(', ')}`,
    );
  } catch (e) {
    r.fail(`Sanity: ${e.message}`);
  }

  const c = r.counts;
  console.log(`\nResumen: ${c.ok} ✔, ${c.warn} ⚠, ${c.fail} ✘, ${c.info} ℹ`);
  process.exit(c.fail ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(`Error inesperado: ${e.stack ?? e}`);
    process.exit(1);
  });
}
