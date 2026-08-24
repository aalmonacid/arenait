/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

interface ImportMetaEnv {
  // Token de escritura de Sanity, solo server-side (usado por src/pages/api/leads.ts).
  // Nunca prefijar con PUBLIC_ — no debe llegar al bundle de cliente.
  readonly SANITY_API_WRITE_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
