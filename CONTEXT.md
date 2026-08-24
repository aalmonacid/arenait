# Contexto Técnico Completo: ArenaIT

> Documento de referencia vivo. Generado a partir de una auditoría completa del código, configuración e historial de git el 2026-08-24. Actualizar este archivo cuando cambie la arquitectura o el estado del proyecto — no dejar que se desactualice como pasó con `BACKLOG.md`.

## 1. Qué es el proyecto

Landing page corporativa B2B para **ArenaIT**, una consultora de "Ingeniería de Software Estructural para Operaciones Críticas". Objetivo de negocio: captar leads (CTOs/CIOs) mediante una propuesta de valor basada en resiliencia operativa, reducción de TCO (-35/-40%), SLA 99.999% y cumplimiento de estándares (ISO 27001, TOGAF, ISO 25010, FinOps).

Es un sitio de marketing, no una aplicación transaccional: una home con secciones (hero, servicios, calculadora TCO, formulario de contacto, sellos de estándares) y páginas de detalle de servicio.

## 2. Stack real (verificado en `package.json`)

- **Astro 7.2** (`output` no configurado → build **estático puro**, sin adapter SSR)
- **React 19** vía `@astrojs/react`, usado *solo* para aislar Sanity Studio (`SanityStudio.tsx`), no para UI de producto
- **Sanity 6.9 / `@sanity/astro` 3.5** — CMS headless, project `xbayv7k2`, dataset `production`
- **Tailwind CSS 3.4** con tokens de marca (ver §5)
- **TypeScript 6.0**, `astro check` pasa en 0 errores
- **Vercel** como hosting (headers de seguridad y rewrite de `/admin` en `vercel.json`), **sin `@astrojs/vercel` adapter instalado**
- Sin framework de testing, sin ESLint/Prettier, sin CI (no existe `.github/workflows`)

## 3. Arquitectura real

- Astro Studio embebido en `/admin` como SPA React (`client:only="react"`), servido mediante rewrite de Vercel a `admin/index.html`. Requirió 5 commits consecutivos de fixes (ver `git log`) para estabilizar por conflictos de Vite SSR con Sanity — **zona fragil, tocar con cuidado**.
- Todas las páginas (`index.astro`, `servicios/[slug].astro`) intentan `client.fetch(...)` contra Sanity y **caen a datos hardcodeados (`fallbackServices`) si la query falla o devuelve vacío**. No hay evidencia de que el dataset `production` tenga contenido real cargado — es muy probable que **el sitio esté funcionando 100% con datos de fallback en este momento**.
- `src/pages/api/revalidate.ts` es un webhook receptor pensado para invalidación on-demand de Sanity → Vercel, pero **al no haber `output: 'server'`/`hybrid'` ni adapter, Astro lo compila como página estática**. Verificado en `dist/api/revalidate`: el build genera un HTML 404, no una function. **El endpoint está muerto en producción** — cualquier webhook de Sanity que apunte ahí recibirá 404.

## 4. Estado real vs. estado declarado

El `BACKLOG.md` anterior marcaba los Sprints 0–4 como completos y el proyecto como `READY FOR PRODUCTION`. La auditoría no sostiene esa conclusión. Brechas concretas encontradas:

| Área | Declarado | Real |
|---|---|---|
| CMS integrado | ✅ "Recuperación de datos desde Sanity" | Fetch existe pero corre sobre dataset probablemente vacío; toda la home vive de fallbacks hardcodeados en el `.astro` |
| Captura de leads | Implícito en "componentes core" | `LeadCaptureForm.astro` valida dominios de email en cliente pero el submit real es `// Submit logic here` + `alert()`. **No hay persistencia del lead en ningún sitio** (ni Sanity, ni email, ni CRM) |
| Casos de estudio | Sprint 2 marcado done | Existe schema `caseStudy.ts` en Sanity pero **cero páginas, rutas o componentes** los consumen. El link "Casos de Estudio" del nav apunta a `href="#"` |
| Whitepapers (lead magnet) | — | Schema `whitepaper.ts` completo (con targetRole, PDF) pero **sin página de listado ni flujo de descarga**. Trabajo de CMS sin UI que lo use |
| Performance/Lighthouse | "Superior a 90 en todas las métricas" | Ninguna evidencia de auditoría ejecutada (no hay reportes, ni Lighthouse CI, ni Web Vitals reales). Además hay una regresión de fuentes (ver abajo) que penaliza CLS/perf |
| QA en múltiples dispositivos | Marcado done | Sin test suite, sin CI, sin evidencia de testing manual documentado |
| Nav "FinOps" | — | `href="#"`, no lleva a ninguna sección ni página |

**Conclusión:** el proyecto está en estado de *prototipo funcional con fallbacks*, no en estado de producción real con datos y flujos operativos. Ver `BACKLOG.md` reescrito para el plan honesto de qué falta.

## 5. Bugs concretos encontrados

1. **Fuentes rotas**: `global.css` referencia `/fonts/CodecPro-Regular.woff2` y `/fonts/CodecPro-ExtraBold.woff2` vía `@font-face`, pero `public/fonts/` no existe (solo hay `public/robots.txt`). Los archivos dan 404 y el sitio cae silenciosamente a `Plus Jakarta Sans`/`Inter`, que tampoco están cargadas (no hay `<link>` a Google Fonts ni fuentes locales bundleadas) → termina en sans-serif genérica del sistema. La identidad tipográfica de marca ("Codec Pro Extra Bold") **no se está renderizando nunca**.
2. **Webhook de revalidación muerto** (ver §3) — sin adapter SSR, `/api/revalidate` no ejecuta código en producción.
3. **Formulario de contacto no persiste nada** — el lead se pierde tras el `alert()`.
4. **Links de navegación rotos**: "Servicios", "Casos de Estudio" y "FinOps" en el header apuntan a `#`.
5. **Sin CSP en `vercel.json`** — hay HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy y Permissions-Policy, pero falta `Content-Security-Policy`, inconsistente con el posicionamiento "ISO 27001 / seguridad estructural" del propio sitio.
6. ~~**Carpetas huérfanas en la raíz del repo**~~ — **Resuelto el 2026-08-24.** `dangerous-doppler/` e `interstellar-inclination/` eran proyectos Astro *starter* (`npm create astro -- --template minimal`) sin relación con ArenaIT. `interstellar-inclination/` estaba commiteada como archivos normales; `dangerous-doppler/` estaba commiteada como referencia de submódulo huérfana (`160000`, sin `.gitmodules`) apuntando a su propio commit `ee36f02` ("Initial commit from Astro"), sin trabajo real más allá del scaffold. Ambas eliminadas; cambios en stage pendientes de commit.

## 6. Tokens de diseño (fuente de verdad — no duplicar, referenciar)

```
Primario:     #0075C9  (Azul Cerúleo)
Secundario:   #294E6C  (Azul Noche / Pizarra)
Acento:       #FEA621  (Naranja Ámbar)
Interactivo:  #0446F1  (Azul Eléctrico)
Neutros:      #FFFFFF, #F8FAFC, #E2E8F0, #0F172A
Tipografía:   Codec Pro Extra Bold (titulares) / Codec Pro (cuerpo)
              Fallback: Plus Jakarta Sans, Inter
Prohibido:    estética cyberpunk, gradientes neón, fondos dark "matrix"
Estándar:     WCAG AAA, alto contraste
```
Definidos en `tailwind.config.mjs` y `AGENTS.md`. `CONTEXT.md` no los redefine, solo los referencia.

## 7. Inventario de páginas y componentes

- `src/pages/index.astro` — home (hero, servicios, TCO calc, lead form, sellos)
- `src/pages/servicios/[slug].astro` — detalle de servicio, `getStaticPaths` desde Sanity con fallback a 3 slugs fijos
- `src/pages/404.astro`
- `src/pages/admin/[...index].astro` — Sanity Studio embebido
- `src/pages/api/revalidate.ts` — webhook (roto, ver §3/§5)
- Componentes: `ServiceCard`, `TcoCalculator` (cálculo 100% client-side, no envía nada), `LeadCaptureForm` (no persiste), `SanityStudio.tsx` (wrapper React)
- Schemas Sanity: `service`, `caseStudy` (sin UI), `whitepaper` (sin UI)

## 8. Referencias rápidas

- Sanity Project ID: `xbayv7k2` · Dataset: `production` · Studio: `/admin`
- Dominio de producción declarado en `astro.config.mjs`: `https://arenait.co`
- Ver `AGENTS.md` para reglas de diseño que debe seguir cualquier agente que edite este repo.
- Ver `BACKLOG.md` para el plan de trabajo priorizado (reescrito el 2026-08-24 para reflejar el estado real de §4).
