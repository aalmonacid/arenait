# Backlog del Proyecto: ArenaIT

> Reescrito el 2026-08-24 tras auditoría completa (ver [`CONTEXT.md`](./CONTEXT.md)). El backlog anterior marcaba el proyecto como `READY FOR PRODUCTION`; la auditoría encontró un formulario de contacto que no persiste leads, un webhook de revalidación muerto, contenido 100% de fallback, y páginas de CMS sin UI. Este backlog parte del estado real, no del declarado.

**ESTADO GLOBAL DEL PROYECTO**: `PROTOTIPO FUNCIONAL — NO LISTO PARA PRODUCCIÓN`

## ⚠️ Bloqueante activo sin diagnosticar (2026-08-24)

El job `check-and-build` de CI (run `32766284409`, commit `47afcb0`) falla en el paso `astro check` — lint, format check y unit tests pasaron antes, `astro build` se saltó como consecuencia. El job `e2e` también falló en el paso de tests (a diferencia del intento local, donde Playwright nunca llegó a correr por un problema de sandbox — en CI sí corrió y falló en aserciones reales). No se pudo bajar el log crudo vía API de GitHub (403, requiere permisos de admin del repo) ni reproducir en Docker localmente (decisión del usuario: priorizar primero si Vercel puede buildear el estado actual antes de invertir más tiempo en diagnosticar la CI). **Riesgo real**: Vercel también builda sobre Linux, así que es probable que el próximo deploy automático falle por lo mismo. Antes de dar por cerrada cualquier otra épica, confirmar con un redeploy en Vercel si este error se replica ahí, y diagnosticar la causa (sospecha: algo específico de Linux/Node — GitHub deprecó los runners con Node 20 y fuerza Node 24 según el warning del run, y el proyecto corrió siempre en Windows/Node 24.14 durante esta sesión).

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
- [x] **Arreglar los links muertos del nav.** Resuelto el 2026-08-24: "Servicios" → `/#servicios`, "FinOps" → `/#finops` (se agregó el anchor que faltaba), "Casos de Estudio" se quitó (no existe esa página todavía — ver Épica B) y se reemplazó por "Contacto" → `/#contacto`.
  - [ ] Cuando exista la página de Casos de Estudio (Épica B), volver a agregar ese link al nav apuntando a la ruta real.
- [x] **Limpiar las carpetas huérfanas** `dangerous-doppler/` e `interstellar-inclination/` (starters de Astro sin relación con el proyecto, sin trabajo real). Eliminadas el 2026-08-24 (cambios en stage, pendiente de commit).

## Épica B — Completar la arquitectura de contenido

Hay schemas de Sanity para funcionalidad de negocio que nunca se construyó del lado del frontend.

- [ ] Página de listado + detalle de **Casos de Estudio** (`caseStudy` schema ya existe, sin consumir).
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
