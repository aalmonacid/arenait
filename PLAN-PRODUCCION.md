# Plan a producción — ArenaIT

> Actualizado el 15/11/2026. Resume qué se hizo en el código, qué falta y **quién** debe hacerlo. No contiene secretos: los valores (tokens, URLs de webhook) se cargan directamente en Cloudflare/Sanity, nunca en el repo.
>
> **Avance estimado hacia producción: ~72 %.** Técnico listo (lint, tipos, 60 pruebas, build y CI en verde; `dev.arenait.co` verificado en vivo el 15/11/2026). El lanzamiento depende de cuentas, datos legales, contenido y dominio: ver «Pendientes por responsable» más abajo.

## Estado por área

| Área | Estado | Notas |
|---|---|---|
| Código (tipos, lint, build) | Listo | `astro check` 0 errores; ESLint 0 errores (17 warnings de `any` en el borde Sanity/GROQ) |
| Pruebas unitarias | Listo | 60 tests (validación de leads, rate limiting, aviso, correo, captcha, servicios) con `npm run test:unit` |
| Pruebas e2e | Pendiente de correr | La suite existe (`npm run test:e2e`) pero no corre en este equipo (el Playwright instalado espera otro Chromium); ejecutarla en una máquina normal |
| Diseño | Listo, pendiente de aprobación | Sistema editorial aplicado a todo el sitio; el cliente debe aprobar botones naranja y titulares nuevos |
| Seguridad (código) | Listo | CSP única en todo el sitio (excepto `/admin` y `/api`), endpoint de leads endurecido, leads con ID privado |
| Hosting | **Migrado a Cloudflare Workers (13/11/2026)** | Desplegado desde `main` en `dev.arenait.co`; Vercel Hobby no permite uso comercial. Falta asociar el dominio definitivo |
| Formulario de contacto | Listo y probado en Cloudflare | Captcha Turnstile, guardado en Sanity, correo al dueño y copia al visitante (Resend), regla de límite de envíos en el WAF |
| Seguridad (cuentas) | **Parcial (usted)** | Rotar claves expuestas en capturas/chat; ver «Acciones en Sanity» y «Cloudflare» |
| Rendimiento | Medido y mejorado | Lighthouse móvil del home: Performance 94 (88–95) y CLS 0 en 5 de 5 corridas (antes 74–90 y CLS 0.207); LCP ~1.1 s en home, contacto y casos (antes 2.6 s en contacto y casos). TBT variable (88–519 ms), sin tendencia clara. Medido el 12/11/2026 sobre `dev.arenait.co`, en emulación y sin control de CPU |
| Accesibilidad | AA verificado, AAA parcial | Correcciones aplicadas; ver «Accesibilidad» |
| SEO | Listo para activar | Indexación por variable de entorno; `noindex` sigue activo hasta que se active |
| Legal | **Bloqueado por el cliente** | Datos del responsable del tratamiento |

## Acciones en Sanity (proyecto `xbayv7k2`) — las hace usted

Requieren acceso a https://www.sanity.io/manage. No hay forma de hacerlas desde el código.

1. **CORS origins** (API → CORS origins): agregar `https://dev.arenait.co` y, al lanzar, el dominio final (`https://arenait.co` y/o `https://www.arenait.co`), con **«Allow credentials» activado**. Sin esto el Studio de `/admin` queda en blanco (error CORS comprobado el 12/11/2026).
2. **Privacidad de los leads** (bloqueante antes de activar el token). El dataset `production` responde consultas públicas sin autenticación. El código ya guarda cada lead con `_id` `lead.<uuid>` (los documentos con ID de ruta no se sirven sin token en datasets públicos), pero **debe confirmarlo y reforzarlo** así:
   - Opción recomendada: hacer el dataset **privado** (Datasets → `production` → visibilidad privada) y generar un **token de solo lectura** para el build del sitio (variable `SANITY_API_READ_TOKEN`; requiere un pequeño ajuste de código: avíseme y lo hago).
   - Alternativa: crear un dataset aparte (por ejemplo `leads`, privado) y apuntar el cliente de escritura a él (también requiere un ajuste de código).
   - Prueba obligatoria tras crear el primer lead de prueba: consultar sin token `https://xbayv7k2.api.sanity.io/v2024-01-01/data/query/production?query=*[_type=="lead"]` y confirmar que **no** devuelve el lead.
3. **Token de escritura**: API → Tokens → crear uno con el permiso mínimo necesario (Editor; si solo crea leads, no necesita más) y cargarlo como secreto del Worker de Cloudflare (Producción) con el nombre `SANITY_API_WRITE_TOKEN`. No lo comparta por correo ni chat.
4. **Webhook de contenido** (API → Webhooks): apuntar a la URL del Deploy Hook de Cloudflare (ver «Acciones en Cloudflare»), disparador «create, update, delete» sobre los tipos `service, project, siteSettings, homePage, servicesPage, aboutPage, projectsPage, testimonial`, para que editar contenido republique el sitio (los contactos `lead` no deben dispararlo).
5. **Usuarios y roles**: revisar quién tiene acceso al proyecto y con qué rol (principio de mínimo privilegio, alineado con ISO/IEC 27001). Activar autenticación de dos factores si la organización de Sanity lo permite.
6. **Contenido (22/11/2026)**: el contenido final del cliente vive en `src/lib/content/` (respaldo) y se carga al dataset con el script. Pasos, tras desplegar el código de la rama:
   1. `npm run seed:content -- --dry-run` y revisar el resumen (5 documentos únicos, 13 servicios, 9 proyectos publicados y los borradores pendientes).
   2. Con el token en `SANITY_API_WRITE_TOKEN` (solo en la sesión): `npm run seed:content` (se detiene si algún documento ya existe; `--force` los reemplaza; `--delete-legacy` borra los 6 servicios del modelo anterior).
   3. Actualizar el filtro del webhook de Sanity a `service, project, siteSettings, homePage, servicesPage, aboutPage, projectsPage, testimonial` y reconstruir el sitio.
   4. Verificar sin token que la consulta pública devuelve 9 proyectos y 0 pendientes, y que el Studio muestra los borradores.
   Autorizar un caso pendiente = publicar su borrador en el Studio (previa autorización escrita del cliente).

## Acciones en Cloudflare — estado

El sitio se migró de Vercel a Cloudflare Workers el 13/11/2026. Paso a paso y solución de problemas: `GUIA-HABILITACION.md`.

**Hecho y verificado**
- [x] Worker `arenait` conectado a `main`; compila y despliega con `npm run build` y `wrangler deploy --config dist/server/wrangler.json`.
- [x] Variable de compilación `TURNSTILE_SITE_KEY` y secretos del Worker en **Producción** (`SANITY_API_WRITE_TOKEN`, `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_TO_OWNER`).
- [x] Prueba de punta a punta: formulario con captcha, lead en Sanity, correo al dueño y copia al visitante.
- [x] Enlace de implementación + webhook de Sanity apuntando a `main`.
- [x] Regla de limitación de velocidad en el WAF sobre `/api/leads` (5 solicitudes, bloqueo corto del plan gratuito; probada: 429 con `error code: 1015`).
- [x] CORS de Sanity y hostnames de Turnstile para `dev.arenait.co`.

**Pendiente (usted)**
- [ ] Rotar el token de Sanity y la clave de Resend que se pegaron en un chat, y el Deploy Hook de Vercel que se vio en una captura; revocar los anteriores.
- [ ] Asociar el dominio definitivo al Worker (Domains & Routes). Hoy `arenait.co` redirige a `www.arenait.co`, que sirve el sitio anterior; conservarlo hasta confirmar el lanzamiento.
- [ ] El día del lanzamiento: `PUBLIC_SITE_URL` y `PUBLIC_ALLOW_INDEXING=true` como variables de **compilación**; dominio definitivo en hostnames de Turnstile y CORS de Sanity; revisar SSL/TLS y la redirección `arenait.co` ↔ `www`.
- [ ] Analítica: Web Analytics de Cloudflare (requiere permitir su script en `public/_headers`); hoy no hay ninguna activa.
- [ ] Desconectar el repositorio en Vercel y borrar la rama `migracion/cloudflare`.
- [ ] Primera semana: revisar los logs del Worker (respuestas `201` en `/api/leads`).

**Notas técnicas de la migración**
- Los secretos del servidor se leen con `astro:env/server` (esquema en `astro.config.mjs`); no existe `import.meta.env` para secretos en Workers.
- Cabeceras y CSP en `public/_headers` (solo aplican a archivos estáticos; las respuestas de `/api/*` y `/admin` las genera el Worker). Redirecciones 301 en `public/_redirects`.
- URLs sin barra final (`build.format: 'file'`, `trailingSlash: 'never'`); la canónica se normaliza en `BaseLayout.astro`.
- `/admin` se renderiza en el Worker (`prerender = false`) para que las rutas internas del Studio funcionen al recargar.
- Cloudflare separa los secretos de *Producción* y *Vista previa*: deben cargarse en Producción.

## Lanzamiento (orden sugerido)

1. Completar privacidad de leads, CORS y token (Sanity/Cloudflare) y hacer una **prueba real** de punta a punta con un lead de prueba; luego borrarlo del Studio.
2. Recibir y publicar los datos legales; revisión jurídica.
3. Aprobación de diseño por el cliente.
4. Configurar dominio y DNS; preparar las redirecciones 301 del sitio anterior.
5. Definir `PUBLIC_ALLOW_INDEXING=true` y `PUBLIC_SITE_URL` como variables de compilación en Cloudflare y redesplegar.
6. Registrar el sitio en Google Search Console y enviar `sitemap-index.xml`.
7. QA final contra el dominio real: consola sin violaciones de CSP, Lighthouse y axe en todas las páginas, formulario, `/admin`, menú móvil y 404.
8. Plan de reversión: dejar el sitio anterior accesible (o el DNS anterior a mano) hasta confirmar el lanzamiento.

## Accesibilidad (alcance real)

- **Verificado (axe-core, 11 rutas, desktop y móvil):** 0 violaciones de contraste AA.
- **Corregido en este ciclo:** botón «Aceptar» de cookies (ahora naranja con texto oscuro), textos grises de la política, etiquetas «pendiente», mensajes de error y éxito del formulario, nombre accesible del logo, áreas táctiles de enlaces pequeños y foco visible por defecto en todos los enlaces y botones.
- **Re-medido tras las correcciones (axe-core, 22 cargas):** 0 violaciones A/AA y de mejores prácticas; los fallos AAA de cookies, placeholders y grises quedaron resueltos. Foco con teclado medido: 6.66:1 sobre blanco y 8.75:1 sobre azul pizarra.
- **Único fallo AAA automatizado que queda:** el «IT» del logo en el footer (naranja `#FEA621` sobre `#294E6C`) mide 4.45:1 y se exige 4.5:1 (texto grande). Es un color de marca: el cliente decide si se usa blanco para «IT» en el footer, se oscurece ligeramente el fondo del footer o se acepta la excepción de logotipo de WCAG. Hasta entonces no se declara AAA completo.
- **No se puede certificar solo con herramientas:** varios criterios WCAG AAA (lenguaje claro, secuencia de lectura, zoom y lectores de pantalla) requieren revisión manual. Recomendación: declarar **AA verificado** y AAA como objetivo.

## Después del lanzamiento

- Revisar `npm audit` mensualmente. Al 15/11/2026 quedan 14 avisos en producción (12 moderados, 2 altos), todos en la cadena del CLI de Sanity y no en el runtime del Worker; `npm audit fix --force` baja Sanity a la v5, no aplicarlo.
- CI ya reintroducido (`.github/workflows/ci.yml`, pasa en `main`). Falta la suite e2e.
- Rate limiting con almacenamiento externo (KV/Durable Objects de Cloudflare) solo si el spam lo justifica.
- Medir con datos reales de analítica antes de plantear experimentos de conversión o una versión en inglés.

## Pendientes por responsable (15/11/2026)

### Antonio Almonacid (acceso a Sanity, Cloudflare, GitHub, Vercel)

| # | Acción | Dónde |
|---|---|---|
| 1 | Rotar el token de Sanity y la clave de Resend expuestos; revocar los anteriores y cargar los nuevos como secretos del Worker (Producción) | Sanity manage, Resend, Cloudflare |
| 2 | Desconectar Vercel (Settings → Git, o borrar el proyecto) y quitar la app en GitHub (Settings → Applications) para eliminar el estado rojo «Vercel» de cada commit | Vercel, GitHub |
| 3 | Proteger `main` (PR obligatorio y CI `verify` requerido) y activar secret scanning | GitHub → Settings |
| 4 | CORS de Sanity: quitar `arenait.vercel.app` y los `localhost`; dejar `dev.arenait.co` y, al lanzar, el dominio final (con y sin `www`) | Sanity manage |
| 5 | Confirmar `TURNSTILE_SECRET_KEY` en el entorno **Producción** del Worker (sin él el formulario responde 503) | Cloudflare |
| 6 | Confirmar en el panel que `workers.dev` y las URLs de vista previa están desactivados (ya está en `wrangler.jsonc`) | Cloudflare |
| 7 | Publicar **SPF y DMARC** en `arenait.co`. Hoy el apex solo tiene MX de Google y verificaciones: sin SPF ni DMARC se puede suplantar `@arenait.co` y los avisos pueden caer en spam. Sugerido: SPF que incluya Google (`include:_spf.google.com`) y empezar DMARC en `p=none` con reporte, subiendo a `quarantine` cuando los reportes salgan limpios. Validar con quien administre el correo antes de publicar | DNS (Cloudflare) |
| 8 | Revisar la consola del navegador en `/admin` (logueado): la CSP del Studio va en modo solo-reporte; si no hay violaciones, avisar para pasarla a modo bloqueo | Navegador |
| 9 | Decidir si el dataset `production` pasa a privado (con token de lectura para el build) o si leads van a un dataset aparte | Sanity manage |
| 10 | Opcional: registro CAA en el DNS; inventario de subdominios del dominio antes de volver a poner `includeSubDomains` en HSTS | DNS |

### Cliente (Andrés Arenas / Arena IT)

| # | Acción |
|---|---|
| 1 | Datos de la política de datos: razón social, NIT, domicilio, canal para ejercer derechos (ARCO); revisión jurídica de la política v1.1 |
| 2 | Aprobar el diseño (botones naranja, titulares, secciones) |
| 3 | Decidir dominio canónico: `arenait.co` o `www.arenait.co` |
| 4 | Contenido: capturas de Tauruswebs/Oviswebs, testimonios, más casos, grafía de la marca (decidida: «Arena IT»), correo de contacto y tiempo de respuesta |
| 5 | Decidir analítica (define el banner de cookies) y qué hacer con el naranja del «IT» del footer (4,45:1, AAA) |

### Antonio + Claude (prueba y corte)

| # | Acción |
|---|---|
| 1 | Prueba real del formulario en `dev.arenait.co` (captcha, lead en Sanity, correo al dueño, acuse) con un lead de prueba; consultar sin token que el lead **no** es público; borrar el lead de prueba |
| 2 | Día del corte: asociar el dominio al Worker; `PUBLIC_SITE_URL` y `PUBLIC_ALLOW_INDEXING=true` como variables de compilación; dominio final en Turnstile y CORS de Sanity; revisar que la regla del WAF sobre `/api/leads` aplica al dominio final; redirigir o dar de baja `dev.arenait.co` para que no quede indexable; redesplegar |
| 3 | Control de calidad sobre el dominio real: consola sin violaciones de CSP, Lighthouse y axe en todas las páginas, formulario, `/admin`, menú móvil y 404; Search Console y sitemap; mantener el sitio anterior unos días como reversión |

### Claude (cuando se pida)

Rate limit real (binding o KV), pruebas del handler `/api/leads`, e2e, fuente única de casos de estudio, `BlogPosting`, migas visibles, consolidar `Button`/`TextLink`, `overrides` de npm, 17 avisos de lint, analítica con CSP, CSP del Studio en modo bloqueo.
