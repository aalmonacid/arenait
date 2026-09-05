export interface ServiceSchema {
  _id: string;
  title: string;
  slug: { current: string };
  icon?: string;
  summary: string;
  description: string;
}

export interface CaseStudySchema {
  _id: string;
  title: string;
  slug: { current: string };
  client: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string[];
  screenshots?: unknown[];
}

export interface TestimonialSchema {
  _id: string;
  authorName: string;
  role?: string;
  company?: string;
  quote: string;
  photo?: unknown;
}

export interface WhitepaperSchema {
  _id: string;
  title: string;
  slug: { current: string };
  summary?: string;
  // Referencia al archivo en Sanity — NUNCA se debe proyectar/consultar este
  // campo desde una página prerenderizada: el _ref de un asset `file` de
  // Sanity permite reconstruir su URL de descarga directamente (no requiere
  // dereferenciarlo), así que incluirlo en el HTML inicial ya sería
  // filtrar el PDF sin pasar por el formulario. Solo se lee server-side,
  // después de validar el submit, en src/pages/api/whitepaper-download.ts.
  pdfFile?: { asset?: { _ref: string; url?: string } };
  // Valores reales del schema (c-level/vp-engineering/enterprise-architect)
  // son del posicionamiento de "misión crítica" ya descartado — no
  // renderizar el valor literal en UI pública, ver PendingContentTag.
  targetRole?: string;
}
