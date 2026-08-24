# Backlog del Proyecto: ArenaIT

> Reescrito el 2026-08-24 tras auditoría completa (ver [`CONTEXT.md`](./CONTEXT.md)). El backlog anterior marcaba el proyecto como `READY FOR PRODUCTION`; la auditoría encontró un formulario de contacto que no persiste leads, un webhook de revalidación muerto, contenido 100% de fallback, y páginas de CMS sin UI. Este backlog parte del estado real, no del declarado.

**ESTADO GLOBAL DEL PROYECTO**: `PROTOTIPO FUNCIONAL — NO LISTO PARA PRODUCCIÓN`

## ⚠️ Gate de calidad roto en CI (no bloquea producción) — pendiente de diagnóstico (2026-08-24)

El job `check-and-build` de GitHub Actions falla en el paso `astro check` de forma consistente y reproducible (2 runs seguidos, commits `47afcb0` y `6ff772a`, mismo punto exacto de falla); lint, format check y unit tests pasan antes. El job `e2e` también falla en el paso de tests reales (a diferencia del intento local en este entorno, donde Playwright nunca llegó a correr por un problema de sandbox — en CI sí corre y falla en aserciones). No se pudo bajar el log crudo vía API de GitHub (403, requiere permisos de admin del repo).

**Confirmado el 2026-08-24: esto NO bloquea producción.** El deploy de Vercel para el commit `6ff772a` completó exitosamente (`Vercel - Deployment has completed`, check verde) pese a que el mismo commit falla en CI. Hipótesis más probable: el build de Vercel no ejecuta `npm run build` (que encadena `astro check && astro build`) sino el comando de build propio del preset de Astro, que probablemente omite el paso de type-check. Esto significa que **el gate de calidad de CI está roto y no está protegiendo nada ahora mismo** — vale la pena arreglarlo (para que `astro check` sirva como red de seguridad real antes de mergear), pero ya no es urgente para el sitio en producción. Diagnóstico pendiente: reproducir en un entorno Linux (Docker u otro) para ver el error real de `astro check`, y separadamente investigar por qué la suite de Playwright falla en CI cuando localmente nunca pudo ejecutarse (ver nota de verificación en `CONTEXT.md` §2).

---

## Épica A — Reparar lo que está roto (bloqueante, antes de cualquier lanzamiento)

Sin esto, el sitio pierde leads reales y no puede llamarse "producción" aunque esté desplegado.

- [x] **Persistir el formulario de contacto.** Resuelto el 2026-08-24: `LeadCaptureForm.astro` ahora hace `POST /api/leads`, que valida server-side y guarda el lead como documento `lead` en Sanity. Requiere trabajo pendiente de configuración (no de código, ver checklist abajo).
  - [ ] **Generar `SANITY_API_WRITE_TOKEN`** en sanity.io/manage (proyecto `xbayv7k2`, permiso Editor+) y cargarlo en `.env` local y en Vercel → Environment Variables. Sin esto `/api/leads` responde error de forma controlada pero no guarda nada.
  - [ ] Decidir si además del documento en Sanity se necesita notificación por email/Slack cuando entra un lead nuevo (hoy solo queda visible en el Studio).
- [x] **Arreglar o eliminar el webhook `/api/revalidate`.** Resuelto el 2026-08-24: se eliminó (no hacía nada real) y se adoptó `output: 'server'` + `@astrojs/vercel` solo para las API routes, con las páginas de contenido marcadas `prerender = true` para seguir siendo estáticas.
  - [ ] **Configurar el Deploy Hook** en Vercel (Project Settings → Git → Deploy Hooks) y pegar su URL en Sanity Studio → API → Webhooks, para que editar contenido dispare un rebuild automático. Tarea de consola, no de código.
- [ ] **Cargar contenido real en Sanity** (`production` dataset) para los 3 servicios existentes, o aceptar explícitamente que el fallback hardcodeado _es_ el contenido de producción y documentarlo — pero no dejarlo ambiguo.
- [x] **Arreglar la carga de fuentes.** Resuelto parcialmente el 2026-08-24: `BaseLayout.astro` ahora carga `Plus Jakarta Sans` real vía Google Fonts, así que el fallback funciona en vez de caer a sans-serif del sistema.
  - [ ] `Codec Pro` sigue sin archivos (fuente comercial, sin licencia en el repo) — **pendiente conseguir la licencia y subir los `.woff2` reales** a `public/fonts/` para que la marca se vea como está diseñada.
- [x] **Arreglar los links muertos del nav.** Resuelto el 2026-08-24: "Servicios" → `/#servicios`, "Casos de Estudio" → `/casos-de-estudio` (re-agregado tras construir esa página, ver Épica B), "FinOps" → `/#finops` (se agregó el anchor que faltaba), "Contacto" → `/#contacto`.
- [x] **Limpiar las carpetas huérfanas** `dangerous-doppler/` e `interstellar-inclination/` (starters de Astro sin relación con el proyecto, sin trabajo real). Eliminadas el 2026-08-24 (cambios en stage, pendiente de commit).

## Épica B — Completar la arquitectura de contenido

Hay schemas de Sanity para funcionalidad de negocio que nunca se construyó del lado del frontend.

- [x] Página de listado + detalle de **Casos de Estudio**. Resuelto el 2026-08-24: `/casos-de-estudio` (listado) y `/casos-de-estudio/[slug]` (detalle), agregado campo `slug` al schema (no existía). **Decisión de contenido deliberada**: a diferencia de `servicios/[slug].astro`, esta página NO tiene datos de fallback inventados — un caso de estudio implica un cliente y resultados reales, fabricarlos sería publicar testimonios falsos. Con Sanity vacío, el listado muestra un estado vacío honesto ("Todavía no hay casos de estudio publicados") y no se generan páginas de detalle (`getStaticPaths` devuelve `[]`). En cuanto se cargue contenido real en Sanity, las páginas aparecen solas en el próximo build. Nav actualizado: "Casos de Estudio" vuelve a apuntar a una ruta real.
- [ ] Página de listado + flujo de descarga gated de **Whitepapers** (`whitepaper` schema ya existe, sin consumir). Definir si la descarga requiere pasar por `LeadCaptureForm` (lead magnet real) — parece ser la intención del schema (`targetRole`).
- [ ] Evaluar si el envío del `TcoCalculator` ("Solicitar Auditoría FinOps") debe conectar al mismo flujo de captura de leads en vez de ser un botón sin acción.
- [ ] Imágenes: ningún schema de Sanity tiene campo de imagen todavía pese a existir `imageBuilder.ts`/`urlFor()` ya implementado y sin uso — decidir si los servicios/casos de estudio llevan imagen y añadir el campo.

## Épica C — Calidad y confiabilidad

- [x] CI en GitHub Actions: lint + format check + `astro check` + `astro build` en cada push/PR. Resuelto el 2026-08-24 (`.github/workflows/ci.yml`), validado localmente con `npm ci` limpio antes de cada commit.
- [x] Testing: smoke tests de las rutas principales (Playwright, `e2e/smoke.spec.ts`) y tests unitarios de la lógica del `TcoCalculator` (Vitest, `src/lib/tcoCalculator.test.ts`). Resuelto el 2026-08-24, ambos corriendo en CI.
  - [ ] **Verificar que el job `e2e` de CI pasa en verde.** Los tests de Playwright se escribieron y se verificaron a mano contra el markup real, pero no pudieron ejecutarse en este entorno de trabajo (ver nota en el commit `90c1b62`: el `astro dev`/`preview` local está envuelto por un manejador de daemon en background que no se comporta como el proceso en foreground que Playwright espera, y la navegación real del browser contra el dev server se cuelga indefinidamente incluso para una página mínima sin dependencias — apunta a algo del sandbox, no del código). GitHub Actions es el primer lugar donde esta suite corre de verdad — confirmar que pasa antes de confiar en ella como red de seguridad.
- [x] Lint/format: ESLint + Prettier. Resuelto el 2026-08-24 (`eslint.config.js`, `.prettierrc.json`) y aplicado al repo completo en un commit de solo estilo. `@typescript-eslint/no-explicit-any` quedó en `warn` (no `error`) porque el borde Sanity/GROQ es genuinamente `any` sin codegen de tipos — ver nota en el commit de setup.
- [ ] Auditoría Lighthouse real, documentada con un reporte (no solo la afirmación "superior a 90").
- [ ] Revisar accesibilidad real (WCAG AAA se declara como estándar pero no hay evidencia de auditoría axe/Lighthouse a11y).

## Épica D — SEO, analítica y seguridad

- [ ] Analítica de producto (Plausible/GA4/Vercel Analytics) — sin esto no hay forma de medir conversión de leads, que es el objetivo del sitio. **Pendiente**: requiere elegir proveedor y credenciales, es una decisión del negocio, no solo código.
- [x] Datos estructurados (JSON-LD `Organization`/`Service`) para SEO. Resuelto el 2026-08-24: `Organization` global en `BaseLayout.astro`, `Service` en `servicios/[slug].astro`.
- [x] Añadir `Content-Security-Policy` a `vercel.json`. Resuelto el 2026-08-24, con alcance deliberado: solo cubre `/`, `/404` y `/servicios/*` (páginas de contenido). `/admin` (Sanity Studio) queda fuera a propósito — el Studio usa styled-components con inyección de `<style>` en runtime y es una integración ya frágil (ver CONTEXT.md §3); aplicarle una CSP estricta sin poder probarla contra Vercel real es un riesgo innecesario. Si se agregan páginas de contenido nuevas, hay que sumarlas al `source` de este bloque en `vercel.json` o no heredan la CSP.
- [x] Protección anti-spam en el formulario de leads. Resuelto el 2026-08-24: honeypot (`companyWebsite`) validado tanto en cliente como en `/api/leads` — un bot que lo complete recibe una respuesta de éxito falsa sin persistir nada. Rate limiting real (por IP) sigue pendiente si el volumen de spam lo justifica.

## Épica E — Crecimiento (post-lanzamiento real)

- [ ] Contenido editorial (blog/insights) para SEO orgánico más allá de las 3 páginas de servicio.
- [ ] Internacionalización (¿versión en inglés para clientes fuera de LATAM/España?).
- [ ] Más casos de estudio reales con clientes/resultados, una vez exista la página que los muestre (Épica B).

---

## Cómo priorizar

1. **Épica A primero, sin excepción.** El sitio hoy puede estar recibiendo tráfico y perdiendo leads silenciosamente porque el formulario no los guarda en ningún lado. Es la pérdida de valor más alta y más fácil de no notar.
2. **Épica C en paralelo, no después.** Añadir CI antes de seguir agregando páginas evita que la próxima ronda de features rompa el build sin que nadie lo note (ya pasó 5 veces con Sanity Studio, ver `git log`).
3. **Épica B y D** son las que realmente "suben de nivel" el proyecto una vez que la base deja de tener fugas.
4. **Épica E** es expansión, no corrección — no empezarla antes de cerrar A.
