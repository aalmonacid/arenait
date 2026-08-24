# Backlog del Proyecto: ArenaIT

> Reescrito el 2026-08-24 tras auditoría completa (ver [`CONTEXT.md`](./CONTEXT.md)). El backlog anterior marcaba el proyecto como `READY FOR PRODUCTION`; la auditoría encontró un formulario de contacto que no persiste leads, un webhook de revalidación muerto, contenido 100% de fallback, y páginas de CMS sin UI. Este backlog parte del estado real, no del declarado.

**ESTADO GLOBAL DEL PROYECTO**: `PROTOTIPO FUNCIONAL — NO LISTO PARA PRODUCCIÓN`

---

## Épica A — Reparar lo que está roto (bloqueante, antes de cualquier lanzamiento)

Sin esto, el sitio pierde leads reales y no puede llamarse "producción" aunque esté desplegado.

- [ ] **Persistir el formulario de contacto.** Hoy `LeadCaptureForm.astro` termina en `alert()`. Definir destino real: mutación a Sanity (documento `lead`), integración con CRM/email (p. ej. Resend, HubSpot) o ambos. Este es el activo de negocio #1 del sitio.
- [ ] **Arreglar o eliminar el webhook `/api/revalidate`.** Actualmente compila a un HTML 404 estático porque no hay adapter SSR. Decidir: (a) añadir `@astrojs/vercel` + `output: 'server'`/`hybrid'` para que funcione de verdad, o (b) eliminarlo si no se va a usar revalidación on-demand y confiar en rebuilds por webhook de Vercel/Sanity a nivel de deploy.
- [ ] **Cargar contenido real en Sanity** (`production` dataset) para los 3 servicios existentes, o aceptar explícitamente que el fallback hardcodeado *es* el contenido de producción y documentarlo — pero no dejarlo ambiguo.
- [ ] **Arreglar la carga de fuentes.** `public/fonts/CodecPro-*.woff2` no existen; la marca nunca renderiza "Codec Pro". Subir los archivos de fuente reales o cambiar el CSS a la fuente fallback (Plus Jakarta Sans vía Google Fonts) de forma intencional.
- [ ] **Arreglar los links muertos del nav** (`Servicios`, `Casos de Estudio`, `FinOps` → todos `href="#"`).
- [x] **Limpiar las carpetas huérfanas** `dangerous-doppler/` e `interstellar-inclination/` (starters de Astro sin relación con el proyecto, sin trabajo real). Eliminadas el 2026-08-24 (cambios en stage, pendiente de commit).

## Épica B — Completar la arquitectura de contenido

Hay schemas de Sanity para funcionalidad de negocio que nunca se construyó del lado del frontend.

- [ ] Página de listado + detalle de **Casos de Estudio** (`caseStudy` schema ya existe, sin consumir).
- [ ] Página de listado + flujo de descarga gated de **Whitepapers** (`whitepaper` schema ya existe, sin consumir). Definir si la descarga requiere pasar por `LeadCaptureForm` (lead magnet real) — parece ser la intención del schema (`targetRole`).
- [ ] Evaluar si el envío del `TcoCalculator` ("Solicitar Auditoría FinOps") debe conectar al mismo flujo de captura de leads en vez de ser un botón sin acción.
- [ ] Imágenes: ningún schema de Sanity tiene campo de imagen todavía pese a existir `imageBuilder.ts`/`urlFor()` ya implementado y sin uso — decidir si los servicios/casos de estudio llevan imagen y añadir el campo.

## Épica C — Calidad y confiabilidad

- [ ] CI en GitHub Actions: `astro check` + `astro build` en cada PR como mínimo (hoy no hay `.github/workflows`).
- [ ] Testing: al menos smoke tests de las rutas principales (Playwright) y tests unitarios de la lógica del `TcoCalculator`.
- [ ] Lint/format: ESLint + Prettier (o Biome) — hoy no hay ninguno configurado, sin guardrails de estilo.
- [ ] Auditoría Lighthouse real, documentada con un reporte (no solo la afirmación "superior a 90").
- [ ] Revisar accesibilidad real (WCAG AAA se declara como estándar pero no hay evidencia de auditoría axe/Lighthouse a11y).

## Épica D — SEO, analítica y seguridad

- [ ] Analítica de producto (Plausible/GA4/Vercel Analytics) — sin esto no hay forma de medir conversión de leads, que es el objetivo del sitio.
- [ ] Datos estructurados (JSON-LD `Organization`/`Service`) para SEO, coherente con el posicionamiento B2B.
- [ ] Añadir `Content-Security-Policy` a `vercel.json` — falta pese a que el resto de headers de seguridad ya están y el sitio se vende explícitamente sobre estándares de seguridad (ISO 27001).
- [ ] Protección anti-spam en el formulario de leads (honeypot o rate limiting) una vez tenga persistencia real (Épica A).

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
