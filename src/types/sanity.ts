/**
 * Tipos de los documentos de Sanity que consume el sitio. Deben mantenerse
 * alineados con los esquemas de `schemas/` y con el respaldo de
 * `src/lib/content/` (la misma forma, el mismo contenido).
 */

export type PillarKey = 'construimos' | 'aplicamos-ia' | 'operamos';
export type SectorKey = 'seguros' | 'financiero' | 'publico' | 'farmaceutico' | 'agropecuario';
export type ProjectCategory = 'bizagi' | 'software-a-la-medida';
export type ProjectAuthorization = 'autorizado' | 'entidad-publica' | 'anonimo' | 'pendiente';

/** Texto + enlace (botones y accesos rápidos). */
export interface LinkItem {
  _key?: string;
  label: string;
  href: string;
}

/** Título + texto (tarjetas, principios, modelos de trabajo). */
export interface TitleText {
  _key?: string;
  title: string;
  text: string;
}

export interface SeoFields {
  /** Sin la marca: el layout agrega « | Arena IT ». */
  seoTitle: string;
  seoDescription: string;
}

/** Cierre de página (CTA final). */
export interface ClosingFields {
  closingTitle: string;
  closingText?: string;
  closingLinks: LinkItem[];
  /** Si existe, se agrega el botón de WhatsApp (el número viene de los ajustes). */
  closingWhatsappLabel?: string;
}

export interface ServiceSchema {
  _id: string;
  title: string;
  slug: { current: string };
  icon?: string;
  /** Posición en el sitio (1 = primero). Sin orden, va al final. */
  order?: number;
  /** Sin efecto visible por ahora (el inicio muestra los tres pilares). */
  featured?: boolean;
  summary: string;
  /** Obsoleto: lo reemplazan `whenNeeded` y `whatWeDo`. */
  description?: string;
  pillar: PillarKey;
  /** H2 alternativo para buscadores (por ejemplo, en Bizagi). */
  seoHeading?: string;
  whenNeeded: string;
  whatWeDo: string;
  deliverables: string[];
  /** Encabezado del bloque de IA («IA en tus procesos Bizagi»). */
  aiTitle?: string;
  aiCapabilities?: string[];
  aiNote?: string;
  experience?: string;
  typicalCases?: string;
}

export interface ProjectSchema {
  _id: string;
  title: string;
  slug: { current: string };
  order?: number;
  client: string;
  /** Consultora o intermediario por el que se hizo el proyecto. */
  intermediary?: string;
  sector: SectorKey;
  category: ProjectCategory;
  serviceLabel: string;
  serviceAnchor: string;
  /** Segundo servicio relacionado (solo si el caso aplica a dos). */
  secondaryServiceLabel?: string;
  secondaryServiceAnchor?: string;
  technologies?: string;
  challenge: string;
  whatWeDid: string[];
  result: string;
  note?: string;
  authorization: ProjectAuthorization;
  featuredOnHome?: boolean;
  /** Posición entre los destacados del inicio (1 = primero). */
  homeOrder?: number;
  homeSummary?: string;
}

export interface SectorSchema {
  _key?: string;
  key: SectorKey;
  /** Etiqueta corta (filtros y tarjetas): «Público». */
  label: string;
  /** Etiqueta cuando va sola (cuadrículas): «Sector público». Si falta, usa `label`. */
  gridLabel?: string;
  /** Qué hemos hecho en el sector (bloque «Dónde hemos trabajado»). */
  description: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  defaultDescription: string;
  whatsappNumber: string;
  whatsappMessage: string;
  managerName: string;
  managerRole: string;
  sectors: SectorSchema[];
}

export interface PillarIntro {
  _key?: string;
  key: PillarKey;
  number: string;
  title: string;
  text: string;
}

export interface HomePage extends SeoFields, ClosingFields {
  heroEyebrow: string;
  heroTitle: string;
  /** Fragmento final del titular que se subraya (debe ser el final de `heroTitle`). */
  heroTitleHighlight?: string;
  heroIntro: string;
  heroPrimaryCta: LinkItem;
  heroSecondaryCta: LinkItem;
  quickLinks: LinkItem[];
  servicesTitle: string;
  pillars: PillarIntro[];
  pillarLinkLabel: string;
  allServicesLink: LinkItem;
  processTitle: string;
  processSteps: TitleText[];
  processLink: LinkItem;
  projectsTitle: string;
  projectsLink: LinkItem;
  sectorsTitle: string;
}

export interface ServicesPillar {
  _key?: string;
  key: PillarKey;
  number: string;
  title: string;
  heading: string;
  intro: string;
}

export interface ProcessPhase {
  _key?: string;
  number: string;
  name: string;
  whatWeDo: string;
  quality: string;
}

export interface ServicesPage extends SeoFields, ClosingFields {
  heroEyebrow: string;
  heroTitle: string;
  heroIntro: string;
  heroPrimaryCta: LinkItem;
  heroSecondaryCta: LinkItem;
  quickLinks: LinkItem[];
  pillars: ServicesPillar[];
  /** Texto del botón de cada servicio (lleva a /contacto?servicio=<slug>). */
  serviceCtaLabel: string;
  sectorsTitle: string;
  sectorsLink: LinkItem;
  processTitle: string;
  processPhases: ProcessPhase[];
  processNotes: string[];
  processCta: LinkItem;
  modelsTitle: string;
  models: TitleText[];
  securityTitle: string;
  /** `title` = tema («Tu infraestructura»), `text` = lo que hacemos (minúscula inicial). */
  securityItems: TitleText[];
  faq: { _key?: string; question: string; answer: string }[];
}

export interface AboutPage extends SeoFields, ClosingFields {
  heroEyebrow: string;
  heroTitle: string;
  heroIntro: string;
  whoTitle: string;
  whoParagraphs: string[];
  missionVisionTitle: string;
  mission: string;
  vision: string;
  principlesTitle: string;
  principles: TitleText[];
  sectorsTitle: string;
}

export interface ProjectFilterOption {
  _key?: string;
  key: ProjectCategory;
  label: string;
  /** Encabezado del grupo de proyectos de esa categoría. */
  groupTitle: string;
}

export interface ProjectsPage extends SeoFields, ClosingFields {
  heroTitle: string;
  heroIntro: string;
  serviceFilterLabel: string;
  sectorFilterLabel: string;
  allLabel: string;
  serviceFilters: ProjectFilterOption[];
  experienceBizagiTitle: string;
  experienceBizagiItems: string[];
  experienceTechTitle: string;
  experienceTechItems: string[];
  emptyMessage: string;
  emptyLinkLabel: string;
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

/* ---------- Texto enriquecido (Portable Text) ---------- */

/** Fragmento de texto con sus marcas: `strong`, `em` o la clave de un enlace de `markDefs`. */
export interface PortableTextSpan {
  _type: 'span';
  _key?: string;
  text: string;
  marks?: string[];
}

export interface PortableTextLinkDef {
  _key: string;
  _type: 'link';
  href?: string;
}

/** Párrafo, título (h2, h3), cita o ítem de lista (`listItem`). */
export interface PortableTextBlockNode {
  _type: 'block';
  _key?: string;
  style?: 'normal' | 'h2' | 'h3' | 'blockquote';
  listItem?: 'bullet' | 'number';
  level?: number;
  children: PortableTextSpan[];
  markDefs?: PortableTextLinkDef[];
}

/** Imagen dentro del texto: sin `alt` no se publica. */
export interface PortableTextImage {
  _type: 'image';
  _key?: string;
  alt?: string;
  caption?: string;
  asset?: { _ref?: string };
}

export type PortableTextContent = (PortableTextBlockNode | PortableTextImage)[];

/* ---------- Blog ---------- */

export interface PostSchema {
  _id?: string;
  title: string;
  slug: { current: string };
  /** Resumen del listado y descripción para buscadores. */
  description: string;
  /** Fecha de publicación en formato AAAA-MM-DD. */
  publishDate: string;
  author?: string;
  tags?: string[];
  coverImage?: { alt?: string; asset?: { _ref?: string } };
  body: PortableTextContent;
}

/* ---------- Política de tratamiento de datos (una versión por documento) ---------- */

export type PolicySectionData = 'none' | 'responsible' | 'rightsChannel';

export interface PolicySection {
  _key?: string;
  /** Con su numeración: «1. Responsable del tratamiento». */
  title: string;
  /** Ancla de la sección (`#cookies`); opcional. */
  anchor?: string;
  body?: PortableTextContent;
  /** Datos del responsable o canal de derechos que se muestran bajo el texto. */
  showData?: PolicySectionData;
}

export interface PolicyResponsible {
  legalName?: string;
  nit?: string;
  address?: string;
  rightsChannel?: string;
}

export interface PrivacyPolicy {
  _id?: string;
  /** Número de versión, solo dígitos y puntos (`1.1`). Único entre versiones. */
  version: string;
  /** Fecha desde la que rige, AAAA-MM-DD. */
  effectiveDate: string;
  responsible?: PolicyResponsible;
  intro?: PortableTextContent;
  sections: PolicySection[];
  /** Qué cambió frente a la versión anterior. */
  changeSummary?: string;
}
