# Arena IT

Sitio web de Arena IT: software a la medida, procesos en Bizagi e inteligencia artificial para operaciones reales, con acompañamiento desde el diseño hasta el mantenimiento en producción.

> Estado real del proyecto (qué funciona, qué falta, decisiones): [`CONTEXT.md`](./CONTEXT.md). Plan de trabajo priorizado: [`BACKLOG.md`](./BACKLOG.md). Reglas de diseño y arquitectura: [`AGENTS.md`](./AGENTS.md). Plan de mejoras de la auditoría del 14/11/2026: [`PLAN-MEJORAS.md`](./PLAN-MEJORAS.md). Puesta en producción: [`PLAN-PRODUCCION.md`](./PLAN-PRODUCCION.md) y [`GUIA-HABILITACION.md`](./GUIA-HABILITACION.md).

## Stack

- Astro 7 (`output: 'server'`, versión fijada en `7.4.8`) con Tailwind CSS 3 y TypeScript.
- Sanity (CMS) con el Studio embebido en `/admin`.
- Cloudflare Workers (`@astrojs/cloudflare`, configuración en `wrangler.jsonc`). Cabeceras y CSP en `public/_headers` (archivos estáticos) y `src/middleware.ts` (respuestas del Worker); redirecciones en `public/_redirects`.
- Formulario de contacto: Cloudflare Turnstile (captcha), Sanity (guarda el lead) y Resend (correo).

## Iniciar el proyecto

1. Copiar `.env.example` a `.env` y completar lo necesario (sin secretos reales en el repositorio).
2. `npm install`
3. `npm run dev`

## Comandos

| Comando                                           | Qué hace                                  |
| ------------------------------------------------- | ----------------------------------------- |
| `npm run dev`                                     | Servidor de desarrollo                    |
| `npm run build`                                   | `astro check` + build de producción       |
| `npm run check`                                   | Solo comprobación de tipos                |
| `npm run lint`                                    | ESLint                                    |
| `npm run test:unit`                               | Pruebas unitarias (Vitest)                |
| `npm run test:e2e`                                | Pruebas e2e (Playwright)                  |
| `node scripts/make-images.mjs`                    | Regenera imágenes OG, de `/nosotros` y favicon |
| `npm run seed:content -- --dry-run`               | Resumen de la carga de contenido a Sanity (sin escribir) |
| `npm run verify:live -- <url> [--prod]`           | Verificación de solo lectura de un sitio publicado (cabeceras, SEO, sitemap, política, privacidad de leads) |
| `npm run og:generate`                             | Regenera las imágenes OG de `/servicios`, `/proyectos` y `/contacto` |

## Diseño (Swiss Minimalist)

- **Colores**: primario `#0075C9`, secundario `#294E6C`, acento `#FEA621`, interactivo `#0446F1`; neutros `#FFFFFF`, `#F8FAFC`, `#E2E8F0`, `#0F172A`.
- **Tipografía**: Plus Jakarta Sans (autoalojada).
- **Accesibilidad**: WCAG AA verificado con axe-core; AAA es un objetivo, no un cumplimiento declarado.
- **Prohibido**: estéticas cyberpunk, gradientes de neón y fondos oscuros estilo matriz.

Las cifras, certificaciones (ISO 27001, TOGAF, etc.) y SLA que aparecieron en versiones anteriores del sitio nunca fueron reales y no deben reintroducirse sin confirmación del cliente.
