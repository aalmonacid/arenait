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
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
