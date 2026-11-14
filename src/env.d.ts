/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

// Solo variables de COMPILACIÓN (se leen con import.meta.env al generar el sitio).
// Los secretos de ejecución del Worker (SANITY_API_WRITE_TOKEN, TURNSTILE_SECRET_KEY,
// RESEND_API_KEY, MAIL_FROM, MAIL_TO_OWNER, LEAD_NOTIFY_WEBHOOK_URL) se declaran en el
// `env.schema` de astro.config.mjs y se importan desde 'astro:env/server'.
interface ImportMetaEnv {
  // 'true' en producción para permitir la indexación (quita noindex y abre robots.txt).
  readonly PUBLIC_ALLOW_INDEXING?: string;
  // Dominio canónico del sitio (sitemap, canonical, Open Graph).
  readonly PUBLIC_SITE_URL?: string;
  // Clave de SITIO del captcha Cloudflare Turnstile: es pública (se imprime en el
  // formulario al construir). El secreto es de ejecución y vive en el Worker.
  readonly TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
