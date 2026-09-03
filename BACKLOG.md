# Backlog del Proyecto: ArenaIT

> Reescrito el 2026-08-24 tras auditoría completa (ver [`CONTEXT.md`](./CONTEXT.md)). El backlog anterior marcaba el proyecto como `READY FOR PRODUCTION`; la auditoría encontró un formulario de contacto que no persiste leads, un webhook de revalidación muerto, contenido 100% de fallback, y páginas de CMS sin UI. Este backlog parte del estado real, no del declarado.

**ESTADO GLOBAL DEL PROYECTO**: `PROTOTIPO FUNCIONAL — NO LISTO PARA PRODUCCIÓN`

## Épica 0 — Pivote de posicionamiento (cerrada, 2026-08-24)

El posicionamiento "Ingeniería de misión crítica para CTO/CIO" (ISO 27001/TOGAF/ISO 25010, SLA 99.999%, TCO -35/40% garantizado) fue confirmado por el cliente como no real. Se reescribió el sitio completo a la posición real acordada ("punto medio", ver `copy-arenait-textos-reales.md`):

- [x] Home: nuevo hero, 4 pilares, 6 servicios reales (sin métricas fake), caso de éxito Sadep, testimonios CMS-ready, CTA de contacto corto.
- [x] Schema `service` reescrito (sin `tcoSavingsPercentage`/`sla`/`iso27001Compliant`); schema `lead` reescrito (sin `jobTitle`/`infrastructure`); schema `testimonial` nuevo.
- [x] Calculadora FinOps (`TcoCalculator.astro`, `tcoCalculator.ts`, su test, sección `#finops`, link de nav) eliminada por completo — su única premisa era el ahorro garantizado que se rechazó.
- [x] Formulario de leads simplificado: sin bloqueo de correos gratuitos, sin gatekeeping por cargo/infraestructura.
- [x] Páginas nuevas: `/servicios` (única, 6 servicios), `/nosotros` (con `[PENDIENTE]` marcado vía `PendingContentTag`), `/contacto` (destino canónico, con dropdown de servicio).
- [x] Footer/nav reescritos: sin sellos ISO/TOGAF ni "SLA Garantizado 99.999%"; nav con "Nosotros" agregado.
- [x] `vercel.json`: CSP extendida a `/servicios`, `/nosotros`, `/contacto`.
- [x] `AGENTS.md`/`CONTEXT.md` actualizados para reflejar el posicionamiento real.

Pendiente fuera de código (ver `/nosotros`, `/contacto` y footer en el sitio): año de fundación, tamaño de equipo, correo/teléfono público a publicar, dirección física, redes sociales, y el tiempo de respuesta comprometido — todo marcado explícitamente, nada inventado. **Actualización 2026-09-03**: misión, visión y sectores de experiencia ya no están en esta lista — se migraron a contenido real (ver Épica F). Los campos que siguen sin dato confirmado ya no se muestran como "pendiente" en el sitio público: el bloque completo se oculta hasta tener el dato real (ver Épica F).

## Épica F — Auditoría visual de marca (2026-09-03)

Evaluación visual de dev.arenait.co contra el tablero de marca real. Nivel general bueno (limpio, jerarquía clara), 4 hallazgos concretos de implementación, en orden de prioridad:

- [x] **P1 — Logotipo real implementado.** Resuelto el 2026-09-03 tras recibir del cliente el PDF real (`Tablero de Marca ArenaIT`, mayo 2024). Se creó `src/components/Logo.astro`, un único componente compartido (props `variant: 'light' | 'dark'`, `size: 'header' | 'footer'`, `link`) usado ahora tanto en el header como en el footer de `BaseLayout.astro` — antes tenían dos tratamientos de texto plano distintos e incorrectos (ninguno con el elemento gráfico real). Reproduce fielmente el wordmark "Arena" + "IT" con la fila de 7 puntos decorativos sobre la "IT" (patrón simétrico: 2 puntos pequeños, azul mediano, naranja grande al centro, azul mediano, 2 puntos pequeños — colores exactos del tablero: `#0075C9`/`#FEA621`). **Ajuste 2026-09-03 (misma sesión, segunda ronda)**: la primera versión usaba `secondary` (#294E6C) para "IT" sobre fondo claro — visualmente casi indistinguible de `neutral-900` (#0F172A) en "Arena", se leía como un tono sólido. Corregido a `primary` (#0075C9) para "IT" en ambas variantes — mismo criterio en header y footer, solo "Arena" invierte entre `neutral-900` (fondo claro) y blanco (fondo oscuro). **Nota de fidelidad**: el wordmark se implementa como texto real (no una traza vectorial de la fuente Codec Pro del PDF, que no está licenciada en el repo — ver §5 de `CONTEXT.md`) usando la misma fuente heading del sitio (cascada a Plus Jakarta Sans), priorizando accesibilidad/SEO (sigue siendo texto real, no imagen) y consistencia con el resto del sitio sobre una réplica pixel-perfecta de la tipografía; el elemento gráfico distintivo (la fila de puntos) sí es una reproducción fiel del PDF.
- [x] **Fondo del hero oscuro — decisión de marca confirmada y aplicada.** El cliente confirmó `#294E6C` (secondary, navy del tablero de marca) sobre `#0F172A` (neutral-900, neutro genérico del sistema) tras revisar una comparación visual — ambos cumplen WCAG AAA de sobra (17.8:1 y 8.8:1 respectivamente para texto blanco), así que fue una decisión de identidad, no de accesibilidad. Se reemplazó `bg-neutral-900` por `bg-secondary` en las 7 ubicaciones que lo usaban como fondo de hero/footer: `index.astro`, `servicios/index.astro`, `nosotros/index.astro`, `casos-de-estudio/index.astro`, `casos-de-estudio/[slug].astro`, `contacto/index.astro` y el `<footer>` de `BaseLayout.astro`. **El token `neutral.900` en `tailwind.config.mjs` no se tocó** — sigue siendo `#0F172A` y se usa sin cambios como `text-neutral-900` en ~33 lugares del sitio (texto de cuerpo, labels), que no tienen relación con esta decisión.
- [x] **P2 — Contraste del botón "Enviar mensaje".** Resuelto: `LeadCaptureForm.astro` usaba `bg-secondary` (#294E6C, navy apagado) en el único formulario de conversión real del sitio, mientras que todos los demás CTAs primarios ("Cuéntanos tu reto", "Hablemos de este servicio", etc.) usaban `bg-primary` (#0075C9). Cambiado a `bg-primary hover:bg-interactive`, igual que el resto de CTAs primarios — confirmado que ningún otro botón del sitio tiene más peso visual.
- [x] **P3 — Reducir el volumen de `PendingContentTag` visible en el sitio público.** Resuelto:
  - Migrado a contenido real en `/nosotros`: Misión, Visión y sectores de experiencia ("financiero, asegurador, servicios y agropecuario"), extraídos del sitio viejo (`www.arenait.co/nosotros.html`) vía fetch — verificados textualmente contra la fuente.
  - Ocultados por completo (ya no se muestra el tag "pendiente", el bloque simplemente no renderiza): año de fundación/años operando y tamaño del equipo en `/nosotros`; SLA de tiempo de respuesta y correo/teléfono público en el hero/sidebar de `/contacto` (este último no estaba en la lista original de la auditoría pero se le aplicó la misma lógica por ser el mismo tipo de dato sin confirmar — mismo tratamiento que testimonios: no renderiza nada sin contenido real); dirección física y redes sociales en el footer global (`BaseLayout.astro`).
  - `PendingContentTag.astro` se mantiene como componente (no se eliminó) — queda disponible para vistas internas/admin, pero ya no tiene ningún uso en el sitio público tras estos cambios.
  - Verificado en `dist/client/`: cero apariciones de "pendiente de confirmar" en `/nosotros`, `/contacto`, `/index.html` (footer). Sin huecos de layout: los contenedores flex de una sola línea no dejaban espacio vacío al quitar el segundo elemento.
- [x] **P4 — Color de fondo del hero oscuro (confirmado, sin cambio).** Se verificó que `bg-neutral-900` (#0F172A) se usa de forma consistente en 6+ lugares (home, servicios, casos de estudio listado/detalle, nosotros, contacto, footer) — no es un error de mapeo aislado. Confirmado con el usuario: es una decisión deliberada, se deja como está. No confundir con `#294E6C` (secundario) — son colores distintos y ambos están en uso correcto en otros contextos (ver §6 de `CONTEXT.md`).

## Nota: GitHub Actions removido (2026-08-24)

Se agregó un workflow de CI (`.github/workflows/ci.yml`) durante esta sesión, pero el flujo real del proyecto siempre fue deploy automático vía Vercel (git integration), sin usar GitHub Actions — el workflow se agregó sin que fuera parte del proceso real y el usuario pidió sacarlo. **Removido.**

Antes de sacarlo, quedó un hallazgo real sin resolver que vale la pena dejar anotado: `astro check` fallaba de forma consistente y reproducible corriendo en Linux/Node24 (2 runs de CI, mismo punto exacto de falla) pese a pasar siempre en local (Windows/Node 24.14) — nunca se pudo ver el log crudo del error (403 de la API de GitHub, requiere admin del repo). **Se confirmó que esto no afecta el deploy real**: Vercel completó exitosamente el build del mismo commit que fallaba en CI (probablemente porque el build de Vercel no corre `astro check`, solo `astro build`). Si en algún momento se quiere que `astro check` sea una red de seguridad real (correrlo a mano con `npm run lint` / `npx astro check` antes de mergear cambios grandes, o reintroducir alguna forma de CI más adelante), reproducir en un entorno Linux (Docker con `node:24`, cuidado con que `npm ci` dispara la descarga de browsers de Playwright — usar `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`) es el próximo paso para ver el error real.

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
- [x] **Arreglar los links muertos del nav.** Resuelto el 2026-08-24; superado más tarde el mismo día por el pivote de posicionamiento (Épica 0): el nav ya no usa anchors — "Servicios" → `/servicios`, "Casos de Estudio" → `/casos-de-estudio`, "Nosotros" → `/nosotros` (nuevo), "Contacto" → `/contacto`. "FinOps" se quitó del nav al eliminarse la calculadora.
- [x] **Limpiar las carpetas huérfanas** `dangerous-doppler/` e `interstellar-inclination/` (starters de Astro sin relación con el proyecto, sin trabajo real). Eliminadas el 2026-08-24 (cambios en stage, pendiente de commit).

## Épica B — Completar la arquitectura de contenido

Hay schemas de Sanity para funcionalidad de negocio que nunca se construyó del lado del frontend.

- [x] Página de listado + detalle de **Casos de Estudio**. Resuelto el 2026-08-24: `/casos-de-estudio` (listado) y `/casos-de-estudio/[slug]` (detalle), agregado campo `slug` al schema (no existía). **Decisión de contenido deliberada**: a diferencia de `servicios/[slug].astro`, esta página NO tiene datos de fallback inventados — un caso de estudio implica un cliente y resultados reales, fabricarlos sería publicar testimonios falsos. Con Sanity vacío, el listado muestra un estado vacío honesto ("Todavía no hay casos de estudio publicados") y no se generan páginas de detalle (`getStaticPaths` devuelve `[]`). En cuanto se cargue contenido real en Sanity, las páginas aparecen solas en el próximo build. Nav actualizado: "Casos de Estudio" vuelve a apuntar a una ruta real.
- [ ] Página de listado + flujo de descarga gated de **Whitepapers** (`whitepaper` schema ya existe, sin consumir). Definir si la descarga requiere pasar por `LeadCaptureForm` (lead magnet real) — parece ser la intención del schema (`targetRole`). Nota: el `targetRole` del schema (C-Level/VP Engineering/Enterprise Architect) es del posicionamiento viejo — revisar si aplica al pivotar este ítem.
- [ ] ~~Evaluar si el envío del `TcoCalculator` debe conectar al flujo de leads~~ — ya no aplica: el `TcoCalculator` se eliminó por completo en el pivote de posicionamiento (ver Épica 0).
- [ ] Imágenes: ningún schema de Sanity tiene campo de imagen todavía pese a existir `imageBuilder.ts`/`urlFor()` ya implementado y sin uso — decidir si los servicios/casos de estudio llevan imagen y añadir el campo.

## Épica C — Calidad y confiabilidad

- [~] CI en GitHub Actions. Se agregó y luego se removió el 2026-08-24 a pedido del usuario — el proyecto no usa Actions, deploya automático vía Vercel. Ver nota arriba.
- [x] Testing: smoke tests de las rutas principales (Playwright, `e2e/smoke.spec.ts`) y tests unitarios de la lógica del `TcoCalculator` (Vitest, `src/lib/tcoCalculator.test.ts`). Resuelto el 2026-08-24, disponibles para correr a mano (`npm run test:unit`, `npm run test:e2e`) — ya no corren en CI (ver nota arriba).
  - [ ] **Verificar manualmente que la suite de Playwright pasa.** Se escribió y se verificó a mano contra el markup real, pero nunca se pudo ejecutar con éxito en este entorno de trabajo (el `astro dev`/`preview` local está envuelto por un manejador de daemon en background que no se comporta como el proceso en foreground que Playwright espera, y la navegación real del browser contra el dev server se colgaba indefinidamente). Si se corre en una máquina/entorno normal (`npm run test:e2e`), confirmar que pasa antes de confiar en ella como red de seguridad.
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
2. **Épica C en paralelo, no después.** Correr lint/tests/build a mano antes de mergear cambios grandes evita que la próxima ronda de features rompa algo sin que nadie lo note (ya pasó 5 veces con Sanity Studio, ver `git log`) — sin CI automática, esto depende de disciplina manual.
3. **Épica B y D** son las que realmente "suben de nivel" el proyecto una vez que la base deja de tener fugas.
4. **Épica E** es expansión, no corrección — no empezarla antes de cerrar A.
