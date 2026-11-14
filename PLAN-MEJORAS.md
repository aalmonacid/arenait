# Plan de mejoras — auditoría del 14/11/2026

Resultado de una revisión de solo lectura de seguridad, rendimiento, accesibilidad, UI/UX, SEO y calidad de código sobre `dev.arenait.co` (Cloudflare Workers). Estado de cada ítem al final de cada fila: ✅ hecho en la rama `mejoras/auditoria-2026-11`, ⏳ pendiente, 👤 requiere a una persona (panel, cliente o decisión).

Esfuerzo: S (<2 h), M (medio día a un día), L (varios días).

## Medido en la auditoría

- Lighthouse móvil 92–100, CLS 0, páginas de contenido ~50 KB, LCP 0,9–1,1 s. `/nosotros` pesa 1,2 MB y `/contacto` ~1,8 MB (Turnstile).
- axe-core: 0 violaciones en 10 rutas. WCAG AAA **no** se cumple (el «IT» naranja del logo del footer da 4,45:1).
- Sin secretos en el árbol ni en el historial. `npm audit`: 22 avisos, ninguno en el runtime del Worker.
- No medido: Lighthouse de la 404, datos de campo, lector de pantalla, criterios AAA manuales, responsive 320–1024 px (los hallazgos de header y formulario en móvil estrecho salen de lectura de código: verificar).

## Fase 0 — Operativo (panel / dueño de cuentas)

| # | Acción | Esf. | Estado |
|---|---|---|---|
| 0.1 | Rotar token de Sanity y clave de Resend expuestos; eliminar el Deploy Hook de Vercel; recargar secretos en el Worker (producción) | S | 👤 |
| 0.2 | Quitar `arenait.vercel.app` (y los `localhost`) del CORS de Sanity antes de borrar el proyecto de Vercel | S | 👤 |
| 0.3 | Desactivar `*.workers.dev` y URLs de preview del Worker si están activos (ver `wrangler.jsonc`) | S | ✅ en `wrangler.jsonc` (`workers_dev` y `preview_urls` en false; rige al próximo deploy) · 👤 verificar en el panel |
| 0.4 | Protección de rama y secret scanning en GitHub | S | 👤 |

## Fase 1 — Seguridad en código

| # | Acción | Esf. | Estado |
|---|---|---|---|
| 1.1 | `src/middleware.ts` con cabeceras de seguridad para respuestas del Worker (`/admin`, `/api/*`) | M | ✅ verificado en `astro preview`. La CSP del Studio va en modo solo-reporte: revisar la consola en `/admin` y luego pasarla a `Content-Security-Policy` |
| 1.2 | La copia al visitante pasa a ser un acuse fijo sin texto libre | S | ✅ |
| 1.3 | Turnstile: fallar cerrado en producción si falta el secreto | S | ✅ |
| 1.4 | Rate limit real (binding de Workers o KV) | M | ⏳ purga del `Map` hecha; el límite real sigue siendo la regla WAF |
| 1.5 | Leads en dataset privado o dataset `production` privado | M | 👤 (decisión + Sanity manage) |
| 1.6 | Retirar `_whitepaper-download.ts` | S | ✅ |
| 1.7 | Saneo de saltos de línea, escape en webhook y JSON-LD, `Origin` + `Content-Type`, corte de body, `Disallow: /admin` | S–M | ✅ (idempotencia ⏳). Ojo: ahora `/api/leads` rechaza peticiones sin `Origin` ni `Sec-Fetch-Site` (curl a pelo) |
| 1.8 | `npm audit fix` sin `--force` y `overrides` | S–M | ◐ `npm audit fix` sin `--force`: 22 → 20 avisos. Faltan `overrides` para `js-yaml`, `smol-toml`, `minimatch` (cadena del CLI de Sanity, no del runtime) |

## Fase 2 — Rendimiento

| # | Acción | Esf. | Estado |
|---|---|---|---|
| 2.1 | `og:image` pregenerada 1200×630 en lugar de 2,6 MB servidos por `/_image` | S | ✅ |
| 2.2 | Imagen de `/nosotros` redimensionada y en WebP | M | ✅ |
| 2.3 | Diferir Turnstile hasta que el usuario toque el formulario | M | ✅ el script se inyecta al primer toque/foco o al enviar; probado en dev con la clave de prueba de Turnstile. Si el script no carga se avisa con salida a WhatsApp |
| 2.4 | `favicon.ico`, dimensiones en imágenes de Sanity | S | ✅ |

## Fase 3 — UI/UX y accesibilidad

| # | Acción | Esf. | Estado |
|---|---|---|---|
| 3.1 | Formulario: `name`/`autocomplete`, obligatorio/opcional, errores asociados y anunciados, validación propia | M | ✅ |
| 3.2 | Errores de red en español con salida a WhatsApp | S | ✅ |
| 3.3 | Skip link, `aria-current`, migas | S | ✅ (migas visibles ⏳) |
| 3.4 | Breakpoint del menú a `lg` y CTA en header y menú móvil | S–M | ✅ |
| 3.5 | Tarjeta del formulario y captcha en 320–375 px | S | ✅ |
| 3.6 | Caso único en `/casos-de-estudio`; ocultar aviso «capturas pendientes» | S | ✅ |
| 3.7 | WhatsApp dentro del sistema, áreas táctiles, 404, pesos de títulos | S–M | ✅ parcial (WhatsApp, 404, títulos, áreas táctiles de footer y formulario; faltan enlaces de texto del home y botones del banner de cookies) |
| 3.8 | Consolidar `Button`/`TextLink`, tokens | M | ⏳ |

## Fase 4 — SEO técnico y calidad

| # | Acción | Esf. | Estado |
|---|---|---|---|
| 4.1 | README real (sin cifras ni certificaciones) | S | ✅ |
| 4.2 | Fijar `astro` en `7.4.8` exacto | S | ✅ |
| 4.3 | Fuente única de casos de estudio (Sanity + respaldo) | M | ⏳ |
| 4.4 | JSON-LD con `Astro.site`, `noindex` en 404, `og:url`/`og:locale`/`og:site_name` | S–M | ✅ (`BlogPosting` y metadatos fuera de rango ⏳) |
| 4.5 | CI mínimo (lint, check, vitest, build); arreglar e2e | M | ✅ workflow creado (aún no ejecutado en GitHub: puede fallar si `astro check` se comporta distinto en Linux/Node 24, ver BACKLOG) · ⏳ e2e (falta Chromium rev 1254 o fijar `@playwright/test`) |
| 4.6 | Pruebas del handler `/api/leads` y de la canónica | M | ◐ pruebas nuevas de saneo, `Origin`, JSON, hostname de Turnstile, acuse fijo y escape del webhook; el handler completo y la canónica siguen sin prueba |
| 4.7 | Retirar restos de Vercel en agentes y código muerto | S | ✅ (queda el código de analítica opcional en `lead-form.js`, inocuo) |
| 4.8 | Poner al día `CONTEXT.md`, `BACKLOG.md`, `PLAN-PRODUCCION.md`, `.env.example` | M | ◐ notas de estado y cifras al día; el cuerpo de `CONTEXT.md` §2–§3 y §7–§8 sigue describiendo Vercel |

## Fase 5 — Depende del cliente

- Política de datos: razón social, NIT, domicilio, canal ARCO; encargados (Sanity, Cloudflare, Resend, Turnstile) y transferencias. Validación jurídica antes de captar leads reales.
- Prueba social: casos, testimonios, capturas de SADEP, perfil del equipo; «experiencia comprobada» sin respaldo.
- Contacto directo (correo, tiempo de respuesta), copy del hero y de servicios, grafía «ArenaIT» / «Arena IT».
- Decisiones: apex o `www`, analítica (define el banner de cookies), naranja del logo en el footer.

## Fase 6 — Lanzamiento y deuda

- Dominio definitivo (Worker, Turnstile, CORS de Sanity incl. `www`), inventario de subdominios antes de HSTS `includeSubDomains`, evitar indexar `dev.arenait.co`, repetir Lighthouse y axe.
- Destrabar Astro 7.4.12, migrar a Tailwind 4, binding KV `SESSION` sin uso, 17 warnings de lint.
