# Contexto Técnico Completo: ArenaIT

> Documento de referencia vivo. Generado a partir de una auditoría completa del código, configuración e historial de git el 2026-08-24. Actualizar este archivo cuando cambie la arquitectura o el estado del proyecto — no dejar que se desactualice como pasó con `BACKLOG.md`.

## 1. Qué es el proyecto

Landing page corporativa B2B para **ArenaIT**, una consultora de "Ingeniería de Software Estructural para Operaciones Críticas". Objetivo de negocio: captar leads (CTOs/CIOs) mediante una propuesta de valor basada en resiliencia operativa, reducción de TCO (-35/-40%), SLA 99.999% y cumplimiento de estándares (ISO 27001, TOGAF, ISO 25010, FinOps).

Es un sitio de marketing, no una aplicación transaccional: una home con secciones (hero, servicios, calculadora TCO, formulario de contacto, sellos de estándares) y páginas de detalle de servicio.

## 2. Stack real (verificado en `package.json`)

- **Astro 7.2** (`output` no configurado → build **estático puro**, sin adapter SSR)
- **React 19** vía `@astrojs/react`, usado _solo_ para aislar Sanity Studio (`SanityStudio.tsx`), no para UI de producto
- **Sanity 6.9 / `@sanity/astro` 3.5** — CMS headless, project `xbayv7k2`, dataset `production`
- **Tailwind CSS 3.4** con tokens de marca (ver §5)
- **TypeScript 6.0**, `astro check` pasa en 0 errores
- **Vercel** como hosting (headers de seguridad y rewrite de `/admin` en `vercel.json`), **con `@astrojs/vercel` adapter instalado desde el 2026-08-24**
- Sin framework de testing, sin ESLint/Prettier. CI básico desde el 2026-08-24 (`.github/workflows/ci.yml`: `npm ci` + `astro check` + `astro build` en cada push/PR a `main`) — todavía sin tests ni linter que correr ahí.

## 3. Arquitectura real

- **Renderizado mixto desde el 2026-08-24**: `astro.config.mjs` tiene `output: 'server'` + `adapter: vercel()`. Por defecto en este modo _todas_ las páginas se renderizan on-demand, así que cada página de contenido lleva `export const prerender = true;` explícito (`index.astro`, `404.astro`, `servicios/[slug].astro`, `admin/[...index].astro`) para seguir compilando a HTML estático — verificado en build: las 7 rutas de contenido salen en la fase `prerendering static routes`, y solo `/api/leads` queda empaquetado dentro de la función serverless (`.vercel/output/functions/_render.func`). **Importante**: en Astro 7, `getStaticPaths()` ya _no_ implica prerender automático en modo `server` — hay que declararlo explícito o el build lo ignora (pasó con `servicios/[slug].astro` y `admin/[...index].astro`, corregido).
- Astro Studio embebido en `/admin` como SPA React (`client:only="react"`), servido mediante rewrite de Vercel a `admin/index.html`. Requirió 5 commits consecutivos de fixes (ver `git log`) para estabilizar por conflictos de Vite SSR con Sanity — **zona fragil, tocar con cuidado**.
- Todas las páginas (`index.astro`, `servicios/[slug].astro`) intentan `client.fetch(...)` contra Sanity y **caen a datos hardcodeados (`fallbackServices`) si la query falla o devuelve vacío**. No hay evidencia de que el dataset `production` tenga contenido real cargado — es muy probable que **el sitio esté funcionando 100% con datos de fallback en este momento**.
- `src/pages/api/revalidate.ts` (el webhook stub que no hacía nada) **fue eliminado el 2026-08-24**. La estrategia correcta para refrescar contenido tras editar en Sanity, dado que las páginas siguen siendo estáticas, es un **Deploy Hook de Vercel**: crear uno en Vercel → Project Settings → Git → Deploy Hooks, y configurarlo como target del webhook de Sanity (Studio → API → Webhooks) para que cada edición dispare un rebuild completo. Esto es una tarea de configuración en las consolas de Vercel/Sanity, no de código — **pendiente de hacer por quien tenga acceso a esas cuentas**.
- **`/api/leads` (nuevo, 2026-08-24)**: API route real (`prerender = false`, corre como función serverless) que recibe el POST del `LeadCaptureForm`, valida server-side (campos requeridos, formato de email, dominios personales bloqueados, honeypot anti-spam) y persiste el lead como documento `lead` en Sanity vía `src/lib/sanityWriteClient.ts`. Requiere la env var `SANITY_API_WRITE_TOKEN` (server-only, ver §8) tanto en local como en Vercel — **sin ese token el endpoint responde 502 de forma controlada, no crashea**, verificado con smoke test local.
- **Anti-spam (nuevo, 2026-08-24)**: `LeadCaptureForm.astro` incluye un campo honeypot (`companyWebsite`, visualmente oculto vía CSS, no `display:none`) validado tanto en cliente como server-side en `/api/leads`. Si viene completo, la respuesta simula éxito sin persistir nada — verificado con smoke test.
- **SEO estructurado (nuevo, 2026-08-24)**: `BaseLayout.astro` acepta un prop `structuredData` y siempre emite JSON-LD `Organization`; `servicios/[slug].astro` agrega `Service` con los datos reales de cada servicio. Verificado en `dist/`: ambos scripts `application/ld+json` aparecen en el HTML generado.

## 4. Estado real vs. estado declarado

El `BACKLOG.md` anterior marcaba los Sprints 0–4 como completos y el proyecto como `READY FOR PRODUCTION`. La auditoría no sostiene esa conclusión. Brechas concretas encontradas:

| Área                         | Declarado                               | Real                                                                                                                                                                                                 |
| ---------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CMS integrado                | ✅ "Recuperación de datos desde Sanity" | Fetch existe pero corre sobre dataset probablemente vacío; toda la home vive de fallbacks hardcodeados en el `.astro`                                                                                |
| Captura de leads             | Implícito en "componentes core"         | **Resuelto el 2026-08-24**: `LeadCaptureForm.astro` ahora hace `fetch('/api/leads')`, que valida server-side y persiste en Sanity (`lead` document). Antes: solo `alert()` sin persistencia — ver §3 |
| Casos de estudio             | Sprint 2 marcado done                   | Existe schema `caseStudy.ts` en Sanity pero **cero páginas, rutas o componentes** los consumen. El link "Casos de Estudio" del nav apunta a `href="#"`                                               |
| Whitepapers (lead magnet)    | —                                       | Schema `whitepaper.ts` completo (con targetRole, PDF) pero **sin página de listado ni flujo de descarga**. Trabajo de CMS sin UI que lo use                                                          |
| Performance/Lighthouse       | "Superior a 90 en todas las métricas"   | Ninguna evidencia de auditoría ejecutada (no hay reportes, ni Lighthouse CI, ni Web Vitals reales). Además hay una regresión de fuentes (ver abajo) que penaliza CLS/perf                            |
| QA en múltiples dispositivos | Marcado done                            | Sin test suite, sin CI, sin evidencia de testing manual documentado                                                                                                                                  |
| Nav "FinOps"                 | —                                       | `href="#"`, no lleva a ninguna sección ni página                                                                                                                                                     |

**Conclusión:** el proyecto está en estado de _prototipo funcional con fallbacks_, no en estado de producción real con datos y flujos operativos. Ver `BACKLOG.md` reescrito para el plan honesto de qué falta.

## 5. Bugs concretos encontrados

1. **Fuentes rotas** — **Mitigado el 2026-08-24, no resuelto del todo.** `Codec Pro` es una fuente comercial: no hay licencia para incluir sus `.woff2` en el repo, así que `public/fonts/` seguirá vacío hasta que alguien con la licencia los suba. Lo que sí se corrigió: antes el fallback (`Plus Jakarta Sans`) tampoco estaba cargado, así que el sitio terminaba en sans-serif genérica del sistema sin que nadie lo notara. Ahora `BaseLayout.astro` carga `Plus Jakarta Sans` real vía Google Fonts, así que el fallback declarado en `tailwind.config.mjs`/`global.css` funciona de verdad. **Pendiente real**: conseguir la licencia de Codec Pro y subir `CodecPro-Regular.woff2` / `CodecPro-ExtraBold.woff2` a `public/fonts/` — en cuanto existan, se activan solos, sin tocar código (ver comentario en `global.css`).
2. ~~**Webhook de revalidación muerto**~~ — **Resuelto el 2026-08-24**: eliminado, reemplazado por el flujo de Deploy Hook documentado en §3.
3. ~~**Formulario de contacto no persiste nada**~~ — **Resuelto el 2026-08-24**: ver `/api/leads` en §3. Falta que alguien con acceso genere el `SANITY_API_WRITE_TOKEN` real y lo cargue en Vercel (§8) para que funcione en producción.
4. ~~**Links de navegación rotos**~~ — **Resuelto el 2026-08-24.** "Servicios" y "FinOps" ahora apuntan a `/#servicios` y `/#finops` (se agregó `id="finops"` a la sección del `TcoCalculator` en `index.astro`, que no tenía anchor). "Casos de Estudio" se **quitó del nav** en vez de dejarlo apuntando a `#`: no existe página de casos de estudio todavía (Épica B del backlog) y un link falso es peor que no tenerlo. Se reemplazó por "Contacto" → `/#contacto`, que sí existe. Cuando se construya la página de casos de estudio (Épica B), volver a añadir el link apuntando a esa ruta real.
5. ~~**Sin CSP en `vercel.json`**~~ — **Resuelto el 2026-08-24**, con alcance acotado a propósito: `Content-Security-Policy` cubre `/`, `/404` y `/servicios/(.*)` (las páginas de contenido). `/admin` queda deliberadamente afuera — el Studio embebido usa styled-components (inyecta `<style>` en runtime) y ya es la integración más frágil del repo (§3); una CSP estricta ahí sin poder probarla contra Vercel real es más riesgo que beneficio. Política: `default-src 'self'` + permitir Google Fonts (`style-src`/`font-src`) + `img-src` habilitado para `cdn.sanity.io` (para cuando se usen imágenes de Sanity, ver Épica B) + `frame-ancestors 'none'`. **Nota de mantenimiento**: cualquier página estática nueva debe agregarse al `source` de este bloque en `vercel.json` o no hereda la CSP.
6. ~~**Carpetas huérfanas en la raíz del repo**~~ — **Resuelto el 2026-08-24.** `dangerous-doppler/` e `interstellar-inclination/` eran proyectos Astro _starter_ (`npm create astro -- --template minimal`) sin relación con ArenaIT. `interstellar-inclination/` estaba commiteada como archivos normales; `dangerous-doppler/` estaba commiteada como referencia de submódulo huérfana (`160000`, sin `.gitmodules`) apuntando a su propio commit `ee36f02` ("Initial commit from Astro"), sin trabajo real más allá del scaffold. Ambas eliminadas; cambios en stage pendientes de commit.

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
- `src/pages/api/leads.ts` — API route real, persiste leads en Sanity (nuevo, 2026-08-24)
- Componentes: `ServiceCard`, `TcoCalculator` (cálculo 100% client-side, el CTA "Solicitar Auditoría FinOps" todavía no envía nada — ver Épica B del backlog), `LeadCaptureForm` (persiste vía `/api/leads` desde 2026-08-24), `SanityStudio.tsx` (wrapper React)
- `src/lib/sanityWriteClient.ts` — cliente Sanity server-only con token de escritura (nuevo, 2026-08-24)
- Schemas Sanity: `service`, `caseStudy` (sin UI), `whitepaper` (sin UI), `lead` (nuevo, 2026-08-24 — recibe los leads del formulario)

## 8. Referencias rápidas

- Sanity Project ID: `xbayv7k2` · Dataset: `production` · Studio: `/admin`
- Dominio de producción declarado en `astro.config.mjs`: `https://arenait.co`
- **`SANITY_API_WRITE_TOKEN`**: env var server-only requerida por `/api/leads`. Generar en sanity.io/manage (proyecto `xbayv7k2` → API → Tokens, permiso Editor+) y cargar en `.env` local **y** en Vercel Project Settings → Environment Variables. Sin esto el formulario de contacto responde error de forma controlada pero no guarda leads.
- **Deploy Hook pendiente de configurar** (fuera del código, ver §3): Vercel → Deploy Hooks → pegar la URL en Sanity Studio → API → Webhooks, para que las ediciones de contenido disparen un rebuild.
- Ver `AGENTS.md` para reglas de diseño que debe seguir cualquier agente que edite este repo.
- Ver `BACKLOG.md` para el plan de trabajo priorizado (reescrito el 2026-08-24 para reflejar el estado real de §4).
