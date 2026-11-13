# Guía de habilitación: Sanity y Cloudflare

> Paso a paso para dejar funcionando el panel de contenido, el guardado de contactos y la publicación automática. No contiene secretos: el token y las URL se cargan solo en Cloudflare/Sanity. Los nombres exactos de los menús pueden variar un poco según la versión de cada consola.

**Orden recomendado:** 1 → 2 → 3 → 4 → 5 → 6. Los pasos de dominio e indexación (final) van al lanzamiento, no ahora.

## 1. Sanity — permitir que el panel abra (CORS)

1. Entra a https://www.sanity.io/manage y abre el proyecto `xbayv7k2`.
2. **API → CORS origins → Add CORS origin.**
3. Origen: `https://dev.arenait.co` · marca **Allow credentials** · guarda.
4. (Opcional, para trabajar en local) agrega `http://localhost:4321` con credenciales.
5. Al lanzar, repite con el dominio definitivo (`https://arenait.co` o `https://www.arenait.co`).

**Prueba:** abre `https://dev.arenait.co/admin`, inicia sesión y confirma que ves el listado de tipos (Servicio, Caso de estudio, Testimonio, Lead, etc.). Si queda en blanco, revisa la consola del navegador: un error de CORS indica que falta este paso.

## 2. Sanity — crear el token de escritura

1. **API → Tokens → Add API token.**
2. Nombre: `arenait-web-write` · permiso: **Editor** (el mínimo que puede crear documentos).
3. Copia el token **una sola vez** y guárdalo en un gestor de contraseñas. No lo pegues en chats, correos ni archivos del proyecto.

## 3. Cloudflare — crear el sitio y cargar variables

El sitio se despliega como **Worker** de Cloudflare (páginas estáticas + `/api/leads`), no como Pages. Los nombres de los menús pueden variar; verifícalos en la documentación de Cloudflare.

1. **Workers & Pages → Create → Import a repository** → conecta `aalmonacid/arenait` (autoriza solo ese repositorio).
2. Configuración (después en **Settings → Builds**):
   - **Nombre del proyecto:** `arenait` (debe coincidir con `wrangler.jsonc`).
   - **Rama de producción:** `main`.
   - **Comando de compilación:** `npm run build`
   - **Comando de implementación:** `npx wrangler deploy --config dist/server/wrangler.json`
   - **Comando de versión (vista previa):** `npx wrangler versions upload --config dist/server/wrangler.json`
   - Los dos últimos necesitan `--config`: el adaptador genera la configuración final en `dist/server/`.
3. **Variables de compilación** (se leen al construir; **Settings → Builds → Variables y secretos**):

| Variable | Valor |
|---|---|
| `TURNSTILE_SITE_KEY` | Site Key de Turnstile (paso 7); es pública |
| `PUBLIC_SITE_URL`, `PUBLIC_ALLOW_INDEXING` | **solo al lanzar** |

4. **Secretos del Worker** (se leen al ejecutar `/api/leads`; **Settings → Variables y secretos** del Worker, fuera de Builds, tipo *Secreto*):

| Secreto | Valor |
|---|---|
| `SANITY_API_WRITE_TOKEN` | token del paso 2 (permiso **Editor**) |
| `TURNSTILE_SECRET_KEY` | Secret Key de Turnstile (paso 7) |
| `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_TO_OWNER` | ver paso 8 |
| `LEAD_NOTIFY_WEBHOOK_URL` | opcional (Slack/Teams) |

**Cuidado con el entorno.** Cloudflare separa *Producción* y *Vista previa*. Los secretos deben existir en **Producción**: si solo están en Vista previa, el formulario falla con «No se pudo guardar la solicitud». Cloudflare puede mostrar un aviso para copiar variables a `wrangler.jsonc`: no lo apliques (los secretos nunca van en el repositorio).

Cambiar una variable de **compilación** exige un build nuevo (**Retry build**); los **secretos** aplican al siguiente despliegue.

## 4. Publicación automática (Deploy Hook + webhook de Sanity)

1. En el Worker: **Settings → Builds → Enlaces de implementación → + Agregar.** Nombre `Contenido Sanity`, rama `main`. Copia la URL al crearlo (es un secreto: quien la tenga puede forzar compilaciones).
2. En Sanity: **API → Webhooks → Create webhook.**
   - Nombre: `Republicar sitio` · URL: la del enlace de implementación · Dataset: `production`
   - Eventos: **Create, Update, Delete**
   - **Filtro:** `_type in ["service", "caseStudy", "testimonial"]` — así los contactos (`lead`) no disparan un despliegue.
   - Método: POST · habilitado.
3. Prueba: edita un servicio, pulsa **Publish** y confirma que arranca una compilación sobre `main` (1–2 minutos).

## 5. Cargar los 6 servicios en el panel

Requiere haber desplegado el código con los campos nuevos (orden, destacado e ícono desplegable) y tener a mano el token del paso 2.

```powershell
cd C:\DATOS\ArenaIT
$env:SANITY_API_WRITE_TOKEN = "<pega aquí el token>"
node scripts/seed-services.mjs --dry-run     # revisa qué cargaría, sin escribir
node scripts/seed-services.mjs               # carga los 6 servicios
Remove-Item Env:SANITY_API_WRITE_TOKEN       # limpia el token de la sesión
```

- Si el panel ya tiene servicios, el script **se detiene** para no pisar lo editado; con `--force` reemplaza solo los de igual ID.
- Alternativa manual: crear los 6 en el panel con los textos de `scripts/seed/services.json`.
- **Importante:** el sitio usa el respaldo del código solo mientras el panel tiene **cero** servicios. En cuanto hay uno, usa únicamente los del panel. Por eso se cargan los 6 juntos; y si el cliente borra todos, el sitio vuelve a mostrar los 6 del respaldo.

Pide a Andrés Arenas que se una al proyecto como **Editor** (Sanity → Members → Invite) para que administre su contenido.

## 6. Prueba de punta a punta

1. **Contactos:** envía un formulario real desde `/contacto` y comprueba que aparece como *Lead* en el panel. Revisa en Cloudflare (**Workers → Logs**) que `/api/leads` respondió `201`.
2. **Privacidad del lead (obligatoria):** sin iniciar sesión ni usar token, abre
   `https://xbayv7k2.api.sanity.io/v2024-01-01/data/query/production?query=*[_type=="lead"]`
   y confirma que **no devuelve el lead**. Si lo devuelve, no publiques el formulario: hay que mover los leads a un dataset privado (avísame para ajustar el código).
3. Borra el lead de prueba desde el panel.
4. **Servicios:** en el panel edita un servicio de prueba (título, orden o destacado), pulsa **Publish** y espera a que Cloudflare redespliegue (1–2 minutos); verifica el cambio en el sitio. Crea uno nuevo y elimínalo para comprobar ambos casos.

## 7. Captcha del formulario (Cloudflare Turnstile)

Sin las claves el formulario funciona igual, pero sin captcha. Turnstile es gratuito y no muestra imágenes ni acertijos en la mayoría de los casos (verifica los valores vigentes en la documentación de Cloudflare).

1. Cloudflare → **Turnstile → Add widget.** Nombre `arenait-contacto`. Hostnames: `dev.arenait.co` (al lanzar, agrega también el dominio definitivo y su `www`). Modo **Managed**. Crea el widget.
2. Copia la **Site Key** (pública) y la **Secret Key** (secreta).
3. Cloudflare (paso 3): `TURNSTILE_SITE_KEY` como variable de **compilación** y `TURNSTILE_SECRET_KEY` como **secreto**.
4. **Redeploy.** La clave pública se imprime al construir el sitio, así que sin redespliegue no aparece el widget.
5. Prueba: en `/contacto` debe verse la verificación; envía un mensaje y confirma que llega. Si pones solo una de las dos variables, el formulario falla: ponlas juntas.

Para probar sin riesgo existen claves de prueba de Cloudflare (la clave de sitio `1x00000000000000000000AA` siempre aprueba), útiles solo en local.

## 8. Correo: copia al visitante y aviso al dueño (Resend)

Sin estas variables no se envía ningún correo; el formulario sigue guardando los contactos. Si el visitante marca «Enviarme una copia» y no hay correo configurado, la pantalla de éxito le avisa que no pudo enviarse.

1. Crea una cuenta en https://resend.com (revisa en su página los límites y precios vigentes del plan gratuito).
2. **Domains → Add Domain** con tu dominio (por ejemplo `arenait.co`) y agrega en Cloudflare los registros DNS que Resend indique. **Si ya usan correo en ese dominio, no reemplaces el registro SPF existente:** solo puede haber uno, se combina. Espera a que figure como verificado.
3. **API Keys → Create** con permiso solo de envío. Cópiala una vez.
4. Cloudflare → secretos del Worker (paso 3):
   - `RESEND_API_KEY` = la clave
   - `MAIL_FROM` = `ArenaIT <contacto@arenait.co>` (el dominio debe ser el verificado)
   - `MAIL_TO_OWNER` = el correo de Andrés Arenas, que recibe cada contacto nuevo (puedes poner el tuyo para las pruebas)
5. **Redeploy** y prueba enviando el formulario marcando la copia.

Qué recibe cada quien: **el dueño** recibe el detalle completo (nombre, empresa, correo, teléfono, servicio y mensaje) y puede **responder directamente al correo**, porque la respuesta va al visitante. **El visitante** (si lo pide) recibe una copia de lo que escribió, con una nota de «si no fuiste tú, ignóralo».

**Política de datos:** el captcha (Cloudflare) y el envío de correo (Resend) son terceros que tratan datos del visitante. Pide al área jurídica que revise si deben nombrarse en la Política de Tratamiento de Datos.

## 9. Límite de envíos (regla del WAF de Cloudflare)

El límite en memoria del código no es global en Cloudflare; la protección real es esta regla, en la **zona** `arenait.co`.

1. **Seguridad → WAF → Reglas de limitación de velocidad → Crear regla.**
2. Nombre `Limite formulario contacto`. Expresión:

```
(http.request.uri.path eq "/api/leads" and http.request.method eq "POST")
```

3. Característica: IP · 5 solicitudes · el periodo más largo que permita el plan gratuito (hoy 10 segundos) · acción **Bloquear**.
4. **Prueba** (no escribe datos): 10 POST seguidos con captcha inválido deben dar 400 las primeras 5 y luego **429** con `error code: 1015` (bloqueo de Cloudflare). Verificada el 13/11/2026.

El plan gratuito permite una sola regla y ventanas cortas; verifica los límites vigentes en el panel.

## Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| El formulario dice «No se pudo guardar la solicitud» | Mira **Observability → Logs** del Worker. `403 … permission "create" required`: el Worker no recibe `SANITY_API_WRITE_TOKEN` (secreto en el entorno equivocado, p. ej. solo en Vista previa) o el token no es **Editor**. `401 Unauthorized`: token revocado o mal copiado. |
| El captcha no se verifica en el servidor | `TURNSTILE_SECRET_KEY` no está en el Worker de **Producción**. Prueba: un captcha inválido debe responder 400, no 502. |
| El captcha no aparece | `TURNSTILE_SITE_KEY` debe estar como variable de **compilación** y hacerse un build nuevo; el dominio debe estar en los hostnames del widget. |
| El Studio carga pero no inicia sesión | Falta el dominio en CORS origins de Sanity (con credenciales). |
| Compila pero falla el despliegue («Could not read file: dist/server/wrangler.json») | El build corrió sobre una rama sin el adaptador de Cloudflare: revisa la **rama de producción**. |
| Publicar en Sanity no actualiza el sitio | Revisa el registro de intentos del webhook en Sanity y que el filtro incluya el tipo editado. |

## Qué administra el cliente desde el panel

| Contenido | Crear / modificar / eliminar | Nota |
|---|---|---|
| Servicios | Sí | Ícono desde una lista; campos de orden y destacado (se recomiendan 2 destacados) |
| Casos de estudio | Sí | Incluye subir capturas |
| Testimonios | Sí | No muestran nada sin contenido |
| Artículos del blog | No | Son archivos del proyecto |
| Guías descargables | No | Página desactivada |

## Al lanzar (no antes)

1. Cloudflare: en el Worker, **Settings → Domains & Routes → Add custom domain** con el dominio definitivo (el DNS ya está en Cloudflare, se crea solo).
2. Cloudflare: definir `PUBLIC_SITE_URL` y `PUBLIC_ALLOW_INDEXING=true` como variables de **compilación** y volver a desplegar.
3. Sanity: agregar el dominio definitivo a CORS origins.
4. Registrar el sitio en Google Search Console y enviar el mapa del sitio.
5. Cloudflare: activar **Web Analytics** del sitio (requiere permitir su script en la CSP de `public/_headers`; hoy no hay analítica activa).
