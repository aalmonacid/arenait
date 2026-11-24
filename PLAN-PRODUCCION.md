# Plan a producción — ArenaIT

> Actualizado el 24/11/2026. Resume qué se hizo en el código, qué falta y **quién** debe hacerlo. No contiene secretos: los valores (tokens, URLs de webhook) se cargan directamente en Cloudflare/Sanity, nunca en el repo.
>
> **Avance estimado hacia producción: ≈ 79 %** (estimación con los pesos por frente del documento de control; no es una medida exacta; el 22/11/2026 el mismo cálculo daba ≈ 71 %). Lo técnico está en ≈ 93 % y lo no técnico, que depende del cliente, en ≈ 54 %. Lo que depende de Antonio y de Claude está cerca del 95 %: código, pruebas (141 unitarias y 23 e2e), CI, contenido cargado en Sanity, secretos, WAF, webhook, SPF/DMARC y prueba de correo en `dev.arenait.co`. Lo que falta depende del cliente y de lo legal: aprobación del contenido, del portafolio y de la política, autorizaciones de casos, destino de los leads y el corte de dominio. **El 24/11/2026 se envió la nota de revisión al cliente.**
>
> **Datos de operación:** Antonio administra el DNS de `arenait.co` en Cloudflare (no hace falta pedirlo al cliente para el corte de dominio). Los leads del formulario deben llegar a una cuenta de correo del cliente: hoy `MAIL_TO_OWNER` apunta a un correo de Antonio, de pruebas, y el cambio es solo ese secreto en Cloudflare, sin código.

## Estado por área

| Área | Estado | Notas |
|---|---|---|
| Código (tipos, lint, build) | Listo | `astro check` 0 errores; ESLint 0 errores y 0 advertencias (24/11/2026) |
| Pruebas unitarias | Listo | 141 tests con `npm run test:unit` |
| Pruebas e2e | Listo | 23 pruebas en Chromium con `npm run test:e2e` (24/11/2026), incluidas las 5 del formulario con `/api/leads` simulado. `playwright.config.ts` espera hasta 180 s a que arranque el servidor de desarrollo (con 60 s fallaba en la primera carga) |
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
4. **Webhook de contenido** (API → Webhooks): apuntar a la URL del Deploy Hook de Cloudflare (ver «Acciones en Cloudflare»), disparador «create, update, delete» sobre los tipos `service, project, siteSettings, homePage, servicesPage, aboutPage, projectsPage, testimonial, post, privacyPolicy`, para que editar contenido republique el sitio (los contactos `lead` no deben dispararlo).
5. **Usuarios y roles**: revisar quién tiene acceso al proyecto y con qué rol (principio de mínimo privilegio, alineado con ISO/IEC 27001). Activar autenticación de dos factores si la organización de Sanity lo permite.
6. **Contenido (22/11/2026)**: el contenido final del cliente vive en `src/lib/content/` (respaldo) y se carga al dataset con el script. Pasos, tras desplegar el código de la rama:
   1. `npm run seed:content -- --dry-run` y revisar el resumen (5 documentos únicos, 13 servicios, 9 proyectos publicados, 2 artículos del blog, la versión 1.1 de la política de datos y los borradores pendientes).
   2. Con el token en `SANITY_API_WRITE_TOKEN` (solo en la sesión): `npm run seed:content` (se detiene si algún documento ya existe; `--force` los reemplaza; `--delete-legacy` borra los 6 servicios del modelo anterior).
   3. Actualizar el filtro del webhook de Sanity a `service, project, siteSettings, homePage, servicesPage, aboutPage, projectsPage, testimonial, post, privacyPolicy` y reconstruir el sitio.
   4. Verificar sin token que la consulta pública devuelve 9 proyectos y 0 pendientes, y que el Studio muestra los borradores.
   Autorizar un caso pendiente = publicar su borrador en el Studio (previa autorización escrita del cliente).

   **Hecho el 24/11/2026:** carga real con `--force --delete-legacy` (42 operaciones; se borraron los 6 servicios antiguos). Verificado sin token con `verify:live`: 13 servicios, 9 proyectos, 2 artículos, 2 versiones de la política, 0 proyectos con autorización `pendiente` y 0 leads públicos. El filtro del webhook ya incluye los 10 tipos (se quitó el tipo obsoleto `caseStudy`) y una edición de prueba en el Studio disparó el despliegue. El token `seed-content` (Editor) es local: revocarlo en Sanity y quitarlo del `.env` cuando no haya más cargas.

## Acciones en Cloudflare — estado

El sitio se migró de Vercel a Cloudflare Workers el 13/11/2026. Paso a paso y solución de problemas: `GUIA-HABILITACION.md`.

**Hecho y verificado**
- [x] Worker `arenait` conectado a `main`; compila y despliega con `npm run build` y `wrangler deploy --config dist/server/wrangler.json`.
- [x] Variable de compilación `TURNSTILE_SITE_KEY` y secretos del Worker en **Producción** (`SANITY_API_WRITE_TOKEN`, `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_TO_OWNER`).
- [x] Prueba de punta a punta: formulario con captcha, lead en Sanity, correo al dueño y copia al visitante.
- [x] Enlace de implementación + webhook de Sanity apuntando a `main`.
- [x] Regla de limitación de velocidad en el WAF sobre `/api/leads` (5 solicitudes, bloqueo corto del plan gratuito; probada: 429 con `error code: 1015`).
- [x] CORS de Sanity y hostnames de Turnstile para `dev.arenait.co`.
- [x] (24/11/2026) Secretos confirmados en **Producción** (`MAIL_FROM`, `MAIL_TO_OWNER`, `RESEND_API_KEY`, `SANITY_API_WRITE_TOKEN`, `TURNSTILE_SECRET_KEY`) y regla de límite `Limite formulario contacto` activa (bloquea POST a `/api/leads`).
- [x] (24/11/2026) Token de Sanity y clave de Resend rotados; Vercel desconectado del repositorio; la rama `migracion/cloudflare` ya no existe.
- [x] (24/11/2026) `main` protegido con un ruleset de GitHub: no se puede borrar ni reescribir (force push). No exige PR ni checks: se decidió mantener el flujo de fusión local y `push` directo; el CI se revisa después del push.
- [x] (24/11/2026) SPF (`v=spf1 include:_spf.google.com ~all`) y DMARC (`p=none`, reportes a `datos@arenait.co`) publicados en `arenait.co`. DKIM y SPF de Resend ya existían (`resend._domainkey`, `rsend`).
- [x] (24/11/2026) Prueba real del formulario en `dev.arenait.co`: lead guardado en Sanity, aviso y copia de acuse entregados en la bandeja principal en 11 s, SPF, DMARC y DKIM de Amazon SES en PASS. La firma DKIM propia de `arenait.co` dio `temperror` puntual; el DNS responde bien desde 1.1.1.1 y 8.8.8.8. Repetir una prueba y confirmar PASS antes de pasar DMARC a `quarantine`. El lead de prueba se borró.

**Pendiente (usted)**
- [ ] Asociar el dominio definitivo al Worker (Domains & Routes). Hoy `arenait.co` redirige a `www.arenait.co`, que sirve el sitio anterior; conservarlo hasta confirmar el lanzamiento.
- [ ] El día del lanzamiento: `PUBLIC_SITE_URL` y `PUBLIC_ALLOW_INDEXING=true` como variables de **compilación**; dominio definitivo en hostnames de Turnstile y CORS de Sanity; revisar SSL/TLS y la redirección `arenait.co` ↔ `www`.
- [ ] Analítica: Web Analytics de Cloudflare (requiere permitir su script en `public/_headers`); hoy no hay ninguna activa.
- [ ] Cambiar `MAIL_TO_OWNER` (secreto en Producción) a la cuenta de correo del cliente cuando la confirme, antes del lanzamiento.
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
7. QA final contra el dominio real: `npm run verify:live -- https://arenait.co --prod` (cabeceras, indexación, canonical, sitemap, versión de la política y privacidad de leads en Sanity; solo lectura), consola sin violaciones de CSP, Lighthouse y axe en todas las páginas, formulario, `/admin`, menú móvil y 404.
8. Plan de reversión: dejar el sitio anterior accesible (o el DNS anterior a mano) hasta confirmar el lanzamiento.

## Accesibilidad (alcance real)

- **Verificado (axe-core, 11 rutas, desktop y móvil):** 0 violaciones de contraste AA.
- **Corregido en este ciclo:** botón «Aceptar» de cookies (ahora naranja con texto oscuro), textos grises de la política, etiquetas «pendiente», mensajes de error y éxito del formulario, nombre accesible del logo, áreas táctiles de enlaces pequeños y foco visible por defecto en todos los enlaces y botones.
- **Re-medido tras las correcciones (axe-core, 22 cargas):** 0 violaciones A/AA y de mejores prácticas; los fallos AAA de cookies, placeholders y grises quedaron resueltos. Foco con teclado medido: 6.66:1 sobre blanco y 8.75:1 sobre azul pizarra.
- **Único fallo AAA automatizado que queda:** el «IT» del logo en el footer (naranja `#FEA621` sobre `#294E6C`) mide 4.45:1 y se exige 4.5:1 (texto grande). Es un color de marca: el cliente decide si se usa blanco para «IT» en el footer, se oscurece ligeramente el fondo del footer o se acepta la excepción de logotipo de WCAG. Hasta entonces no se declara AAA completo.
- **No se puede certificar solo con herramientas:** varios criterios WCAG AAA (lenguaje claro, secuencia de lectura, zoom y lectores de pantalla) requieren revisión manual. Recomendación: declarar **AA verificado** y AAA como objetivo.

## Después del lanzamiento

- Revisar `npm audit` mensualmente. Al 23/11/2026 quedan 13 avisos en producción (12 moderados, 1 alto: `js-yaml`), todos en la cadena del CLI de Sanity (`@sanity/cli` → `@vercel/frameworks`) y no en el runtime del Worker. Se subió `sanity` a 6.24.0 y un `overrides` de `smol-toml` eliminó el otro alto. El de `js-yaml` no se puede corregir sin romper el CLI (exige js-yaml 4, que elimina `safeLoad`): queda como deuda hasta que `@sanity/cli` actualice. `npm audit fix --force` baja Sanity a la v5: no aplicarlo. El paso del CI es informativo (`continue-on-error`).
- CI ya reintroducido (`.github/workflows/ci.yml`, pasa en `main`). Falta la suite e2e.
- Rate limiting con almacenamiento externo (KV/Durable Objects de Cloudflare) solo si el spam lo justifica.
- Medir con datos reales de analítica antes de plantear experimentos de conversión o una versión en inglés.

## Pendientes por responsable (15/11/2026)

### Antonio Almonacid (acceso a Sanity, Cloudflare, GitHub, Vercel)

| # | Acción | Dónde |
|---|---|---|
| 1 | ~~Rotar el token de Sanity y la clave de Resend expuestos~~ **Hecho** | Sanity manage, Resend, Cloudflare |
| 2 | ~~Desconectar Vercel~~ **Hecho (24/11/2026)** | Vercel, GitHub |
| 3 | Proteger `main`: **hecho** el ruleset contra borrado y force push (24/11/2026); queda opcional exigir PR y el CI `verify`, y activar secret scanning | GitHub → Settings |
| 4 | CORS de Sanity: quitar `arenait.vercel.app` y los `localhost`; dejar `dev.arenait.co` y, al lanzar, el dominio final (con y sin `www`) | Sanity manage |
| 5 | ~~Confirmar `TURNSTILE_SECRET_KEY` en Producción~~ **Hecho (24/11/2026)** | Cloudflare |
| 6 | Confirmar en el panel que `workers.dev` y las URLs de vista previa están desactivados (ya está en `wrangler.jsonc`) | Cloudflare |
| 7 | **SPF y DMARC publicados el 24/11/2026** (SPF con Google; DMARC en `p=none` con reportes a `datos@arenait.co`). Pendiente: subir DMARC a `quarantine` cuando los reportes salgan limpios y el DKIM propio dé PASS | DNS (Cloudflare) |
| 8 | Revisar la consola del navegador en `/admin` (logueado): la CSP del Studio va en modo solo-reporte; si no hay violaciones, avisar para pasarla a modo bloqueo | Navegador |
| 9 | Decidir si el dataset `production` pasa a privado (con token de lectura para el build) o si leads van a un dataset aparte | Sanity manage |
| 10 | Opcional: registro CAA en el DNS; inventario de subdominios del dominio antes de volver a poner `includeSubDomains` en HSTS | DNS |

### Cliente (Andrés Arenas / Arena IT)

El 24/11/2026 Antonio envió al cliente la nota de revisión de contenido, portafolio PDF y política v1.2, con las decisiones pendientes. Se espera su respuesta.

| # | Acción |
|---|---|
| 0 | Indicar la cuenta de correo que recibirá los leads del formulario (`MAIL_TO_OWNER`), probar que el alias `datos@arenait.co` entrega a alguien (la prueba quedó a cargo del cliente) y responder la nota de revisión |
| 1 | Revisión jurídica de la política v1.2 (ya incluye razón social y NIT del RUT, domicilio a nivel de ciudad y el canal `datos@arenait.co`; por decisión del cliente no se publica la dirección de la sede) |
| 1b | Crear el alias de correo `datos@arenait.co` (canal para ejercer derechos): debe existir antes de publicar la política v1.2 |
| 2 | Aprobar el diseño (botones naranja, titulares, secciones) |
| 3 | Decidir dominio canónico: `arenait.co` o `www.arenait.co` |
| 4 | Contenido: capturas de Tauruswebs/Oviswebs, testimonios, más casos, grafía de la marca (decidida: «Arena IT»), correo de contacto y tiempo de respuesta |
| 5 | Decidir analítica (define el banner de cookies) y qué hacer con el naranja del «IT» del footer (4,45:1, AAA) |

### Antonio + Claude (prueba y corte)

| # | Acción |
|---|---|
| 1 | ~~Prueba real del formulario en `dev.arenait.co`~~ **Hecha el 24/11/2026** (ver «Hecho y verificado»); el lead de prueba se borró y `verify:live` confirma 0 leads públicos |
| 2 | Día del corte: asociar el dominio al Worker; `PUBLIC_SITE_URL` y `PUBLIC_ALLOW_INDEXING=true` como variables de compilación; dominio final en Turnstile y CORS de Sanity; revisar que la regla del WAF sobre `/api/leads` aplica al dominio final; redirigir o dar de baja `dev.arenait.co` para que no quede indexable; redesplegar |
| 3 | Control de calidad sobre el dominio real: consola sin violaciones de CSP, Lighthouse y axe en todas las páginas, formulario, `/admin`, menú móvil y 404; Search Console y sitemap; mantener el sitio anterior unos días como reversión |

### Claude (cuando se pida)

Rate limit real (binding o KV), pruebas del handler `/api/leads`, e2e, fuente única de casos de estudio, `BlogPosting`, migas visibles, consolidar `Button`/`TextLink`, `overrides` de npm, 17 avisos de lint, analítica con CSP, CSP del Studio en modo bloqueo.
