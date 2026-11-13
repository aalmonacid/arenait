# Guía de habilitación: Sanity y Vercel

> Paso a paso para dejar funcionando el panel de contenido, el guardado de contactos y la publicación automática. No contiene secretos: el token y las URL se cargan solo en Vercel/Sanity. Los nombres exactos de los menús pueden variar un poco según la versión de cada consola.

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

## 3. Vercel — variables de entorno

En el proyecto de Vercel: **Settings → Environment Variables.**

| Variable | Valor | Entornos |
|---|---|---|
| `SANITY_API_WRITE_TOKEN` | el token del paso 2 (márcala como sensible si Vercel lo ofrece) | Production y Preview |
| `LEAD_NOTIFY_WEBHOOK_URL` | URL de un webhook entrante de Slack/Teams (opcional) | Production |

Después de guardar, **vuelve a desplegar** (Deployments → último despliegue → ⋯ → Redeploy): las variables solo aplican a despliegues nuevos.

**No definas todavía** `PUBLIC_ALLOW_INDEXING` ni `PUBLIC_SITE_URL`: son para el día del lanzamiento.

## 4. Vercel y Sanity — publicación automática (Deploy Hook + webhook)

1. En Vercel: **Settings → Git → Deploy Hooks.** Nombre `Contenido Sanity`, rama `main` → **Create.** Copia la URL (es un secreto: quien la tenga puede forzar despliegues).
2. En Sanity: **API → Webhooks → Create webhook.**
   - Nombre: `Republicar sitio`
   - URL: la del Deploy Hook
   - Dataset: `production`
   - Eventos: **Create, Update, Delete**
   - **Filtro:** `_type in ["service", "caseStudy", "testimonial"]` — así **los contactos (`lead`) no disparan un despliegue** cada vez que llega uno.
   - Método: POST · estado: habilitado.

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

1. **Contactos:** envía un formulario real desde `/contacto` y comprueba que aparece como *Lead* en el panel. Revisa en Vercel (**Logs** de la función `/api/leads`) que respondió `201`.
2. **Privacidad del lead (obligatoria):** sin iniciar sesión ni usar token, abre
   `https://xbayv7k2.api.sanity.io/v2024-01-01/data/query/production?query=*[_type=="lead"]`
   y confirma que **no devuelve el lead**. Si lo devuelve, no publiques el formulario: hay que mover los leads a un dataset privado (avísame para ajustar el código).
3. Borra el lead de prueba desde el panel.
4. **Servicios:** en el panel edita un servicio de prueba (título, orden o destacado), pulsa **Publish** y espera a que Vercel redespliegue (1–2 minutos); verifica el cambio en el sitio. Crea uno nuevo y elimínalo para comprobar ambos casos.

## Qué administra el cliente desde el panel

| Contenido | Crear / modificar / eliminar | Nota |
|---|---|---|
| Servicios | Sí | Ícono desde una lista; campos de orden y destacado (se recomiendan 2 destacados) |
| Casos de estudio | Sí | Incluye subir capturas |
| Testimonios | Sí | No muestran nada sin contenido |
| Artículos del blog | No | Son archivos del proyecto |
| Guías descargables | No | Página desactivada |

## Al lanzar (no antes)

1. Vercel: agregar el dominio definitivo (Settings → Domains) y configurar el DNS en Cloudflare según indique Vercel.
2. Vercel: definir `PUBLIC_SITE_URL` y `PUBLIC_ALLOW_INDEXING=true` **solo en Production** y redesplegar.
3. Sanity: agregar el dominio definitivo a CORS origins.
4. Registrar el sitio en Google Search Console y enviar el mapa del sitio.
5. Vercel: activar **Analytics** (pestaña Analytics → Enable).
