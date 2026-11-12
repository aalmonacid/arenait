# Plan a producción — ArenaIT

> Actualizado el 12/11/2026. Resume qué se hizo en el código, qué falta y **quién** debe hacerlo. No contiene secretos: los valores (tokens, URLs de webhook) se cargan directamente en Vercel/Sanity, nunca en el repo.

## Estado por área

| Área | Estado | Notas |
|---|---|---|
| Código (tipos, lint, build) | Listo | `astro check` 0 errores; ESLint 0 errores (16 warnings de `any` en el borde Sanity/GROQ) |
| Pruebas unitarias | Listo | 32 tests (validación de leads, rate limiting, aviso de leads) con `npm run test:unit` |
| Pruebas e2e | Pendiente de correr | La suite existe (`npm run test:e2e`) pero no corre en este equipo (el Playwright instalado espera otro Chromium); ejecutarla en una máquina normal |
| Diseño | Listo, pendiente de aprobación | Sistema editorial aplicado a todo el sitio; el cliente debe aprobar botones naranja y titulares nuevos |
| Seguridad (código) | Listo | CSP única en todo el sitio (excepto `/admin` y `/api`), endpoint de leads endurecido, leads con ID privado |
| Seguridad (cuentas) | **Pendiente (usted)** | Ver «Acciones en Sanity» y «Acciones en Vercel» |
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
3. **Token de escritura**: API → Tokens → crear uno con el permiso mínimo necesario (Editor; si solo crea leads, no necesita más) y cargarlo en Vercel como `SANITY_API_WRITE_TOKEN`. No lo comparta por correo ni chat.
4. **Webhook de contenido** (API → Webhooks): apuntar a la URL del Deploy Hook de Vercel (ver abajo), disparador «create, update, delete» sobre los tipos `service`, `caseStudy`, `testimonial`, para que editar contenido republique el sitio.
5. **Usuarios y roles**: revisar quién tiene acceso al proyecto y con qué rol (principio de mínimo privilegio, alineado con ISO/IEC 27001). Activar autenticación de dos factores si la organización de Sanity lo permite.
6. **Contenido**: cargar servicios, casos y testimonios en el Studio, **o** aceptar formalmente que el contenido actual del código (`src/lib/fallbackContent.ts`) es el contenido de producción. Hoy el dataset tiene 0 documentos de cada tipo.

## Acciones en Vercel — las hace usted

Requieren acceso al proyecto de Vercel.

1. **Variables de entorno** (Settings → Environment Variables), por entorno:

   | Variable | Entorno | Valor |
   |---|---|---|
   | `SANITY_API_WRITE_TOKEN` | Production y Preview | Token del paso 3 de Sanity |
   | `LEAD_NOTIFY_WEBHOOK_URL` | Production | URL de un webhook entrante (Slack/Teams/Make) — **opcional**, ver «Decisiones» |
   | `PUBLIC_ALLOW_INDEXING` | **Solo Production**, el día del lanzamiento | `true` |
   | `PUBLIC_SITE_URL` | Production | Dominio canónico definitivo, por ejemplo `https://arenait.co` |

   `PUBLIC_ALLOW_INDEXING` **no** debe definirse en Preview ni en el dominio de staging.
2. **Deploy Hook** (Settings → Git → Deploy Hooks): crear uno sobre la rama `main` y pegar su URL en el webhook de Sanity (paso 4 de Sanity).
3. **Web Analytics**: activarlo en el proyecto (Analytics → Enable). Sin esto `/_vercel/insights/script.js` responde 404.
4. **Dominios** (Settings → Domains): agregar el dominio definitivo y configurar el DNS en Cloudflare según lo que indique Vercel. Hoy `arenait.co` redirige a `www.arenait.co`, que sirve el sitio anterior.
5. **Protección del entorno**: confirmar que Preview/staging no sea público si no se desea (Deployment Protection).
6. **Logs**: durante la primera semana revisar Functions → `/api/leads` para confirmar que llegan solicitudes y respuestas `201`.

## Acciones con el cliente

Todo contenido dirigido al cliente debe ser revisado por una persona del equipo antes de enviarse.

**Bloqueante legal**

1. Razón social completa, NIT y domicilio legal (certificado de existencia y representación legal y RUT).
2. Correo o canal designado para ejercer los derechos de los titulares (ARCO) y quién lo atiende.
3. Revisión de la Política de Tratamiento de Datos por el área jurídica. El texto actual es una estructura base conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013; **no es asesoría legal definitiva**.
4. Confirmar si el aviso de leads a un tercero (Slack, Teams, etc.) debe declararse en la política. El aviso que implementé no envía datos personales (solo empresa, servicio y enlace al Studio).

**Decisiones**

5. **Dominio canónico**: `arenait.co` o `www.arenait.co` (hoy el sitio viejo vive en `www`). Planear las redirecciones 301 de las URL del sitio anterior (por ejemplo `/nosotros.html`).
6. **¿Quién atiende los leads y en qué plazo?** Y por qué canal quieren el aviso (correo, Slack, Teams).
7. **Aprobación de diseño**: botones primarios naranja con texto oscuro (el blanco sobre azul `#0075C9` mide 4.8:1 y no cumple AAA), titulares nuevos de cada página, las 5 etapas de «Cómo trabajamos» y la lista de sectores.
8. **Contacto de seguridad**: un correo para `/.well-known/security.txt` (reporte de vulnerabilidades). No lo creé porque no tengo un correo confirmado.

**Contenido**

9. Capturas reales de Tauruswebs y Oviswebs (con autorización de Sadep y sin datos de sus clientes).
10. Datos de contacto público (correo, teléfono), dirección física y redes sociales; año de fundación y tamaño del equipo, si desean publicarlos.
11. Revisión y aprobación de los 2 artículos del blog.
12. Más casos de estudio y testimonios reales, con permiso escrito de uso.

## Lanzamiento (orden sugerido)

1. Completar privacidad de leads, CORS y token (Sanity/Vercel) y hacer una **prueba real** de punta a punta con un lead de prueba; luego borrarlo del Studio.
2. Recibir y publicar los datos legales; revisión jurídica.
3. Aprobación de diseño por el cliente.
4. Configurar dominio y DNS; preparar las redirecciones 301 del sitio anterior.
5. Definir `PUBLIC_ALLOW_INDEXING=true` y `PUBLIC_SITE_URL` en Production y redesplegar.
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

- Revisar `npm audit` mensualmente; las 5 vulnerabilidades altas restantes dependen de `@astrojs/vercel` y `sanity` (sin corrección upstream disponible el 12/11/2026).
- Reintroducir CI (retirado a pedido del equipo) cuando se quiera una red de seguridad automática.
- Rate limiting con almacenamiento externo (Upstash/Vercel KV) solo si el spam lo justifica.
- Medir con datos reales de Vercel Analytics antes de plantear experimentos de conversión o una versión en inglés.
