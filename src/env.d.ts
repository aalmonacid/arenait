/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

interface ImportMetaEnv {
  // Token de escritura de Sanity, solo server-side (usado por src/pages/api/leads.ts).
  // Nunca prefijar con PUBLIC_ — no debe llegar al bundle de cliente.
  readonly SANITY_API_WRITE_TOKEN: string;
  // Webhook entrante opcional (Slack/Teams/Make...) para avisar de leads nuevos.
  // Server-only. Sin esta variable no se envía ningún aviso.
  readonly LEAD_NOTIFY_WEBHOOK_URL?: string;
  // 'true' en producción para permitir la indexación (quita noindex y abre robots.txt).
  readonly PUBLIC_ALLOW_INDEXING?: string;
  // Captcha Cloudflare Turnstile. La clave de sitio es pública (se imprime en el
  // formulario al construir); el secreto es server-only. Sin ellas no hay captcha.
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
  readonly TURNSTILE_SECRET_KEY?: string;
  // Correo con Resend (server-only). Sin RESEND_API_KEY y MAIL_FROM no se envía nada.
  readonly RESEND_API_KEY?: string;
  readonly MAIL_FROM?: string;
  // Buzón que recibe cada contacto nuevo (opcional).
  readonly MAIL_TO_OWNER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
