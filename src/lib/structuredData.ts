/**
 * Constructores puros de datos estructurados (JSON-LD, schema.org).
 *
 * Reglas (AGENTS.md): solo se describe lo que ya está publicado en el sitio.
 * Sin certificaciones, valoraciones, premios, cifras, precios, clientes
 * nombrados ni «partner» de terceros. Los campos opcionales ausentes se omiten
 * (nunca `undefined`, `null` ni cadenas vacías).
 */

export type JsonLdValue = string | number | boolean | JsonLdObject | JsonLdValue[];
export interface JsonLdObject {
  [key: string]: JsonLdValue;
}

const CONTEXT = 'https://schema.org';

/** Quita `undefined`, `null`, cadenas vacías (tras recortar) y objetos/listas vacíos. */
function clean(value: unknown): JsonLdValue | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') return value.trim() === '' ? undefined : value;
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    const items = value.map(clean).filter((v): v is JsonLdValue => v !== undefined);
    return items.length > 0 ? items : undefined;
  }
  if (typeof value === 'object') {
    const out: JsonLdObject = {};
    for (const [key, v] of Object.entries(value)) {
      const cleaned = clean(v);
      if (cleaned !== undefined) out[key] = cleaned;
    }
    return Object.keys(out).length > 0 ? out : undefined;
  }
  return undefined;
}

function node(fields: Record<string, unknown>): JsonLdObject {
  return (clean({ '@context': CONTEXT, ...fields }) as JsonLdObject | undefined) ?? {};
}

/**
 * Serializa para incrustar en `<script type="application/ld+json">`.
 * Escapa «<» (y los separadores U+2028/U+2029) para que un valor con
 * «</script>» no pueda cerrar la etiqueta ni inyectar marcado.
 */
const BACKSLASH = String.fromCharCode(92);
const UNSAFE_CHARS = new RegExp(`[<${String.fromCharCode(0x2028, 0x2029)}]`, 'g');

export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(
    UNSAFE_CHARS,
    (char) => `${BACKSLASH}u${char.charCodeAt(0).toString(16).padStart(4, '0')}`,
  );
}

/** URL absoluta a partir del origen del sitio y una ruta. */
export function absoluteUrl(origin: string, path = '/'): string {
  return new URL(path, origin.endsWith('/') ? origin : `${origin}/`).toString();
}

export interface OrganizationInput {
  name: string;
  url: string;
  description?: string;
  /** URL absoluta del logo (archivo real en /public). */
  logo?: string;
  /** Año de fundación, solo si ya está publicado en el contenido del sitio. */
  foundingDate?: string;
  /** Solo perfiles oficiales ya presentes en el sitio. */
  sameAs?: string[];
}

export function organizationSchema(input: OrganizationInput): JsonLdObject {
  return node({
    '@type': 'Organization',
    name: input.name,
    url: input.url,
    description: input.description,
    logo: input.logo,
    foundingDate: input.foundingDate,
    sameAs: input.sameAs,
  });
}

export interface WebSiteInput {
  name: string;
  url: string;
  description?: string;
  inLanguage?: string;
}

export function webSiteSchema(input: WebSiteInput): JsonLdObject {
  return node({
    '@type': 'WebSite',
    name: input.name,
    url: input.url,
    description: input.description,
    inLanguage: input.inLanguage,
  });
}

export interface BlogPostingInput {
  headline: string;
  description?: string;
  /** ISO 8601. */
  datePublished: string;
  /** Si falta, el autor es la organización. */
  authorName?: string;
  publisherName: string;
  publisherUrl: string;
  /** URL absoluta de la página del artículo. */
  url: string;
  image?: string;
}

export function blogPostingSchema(input: BlogPostingInput): JsonLdObject {
  return node({
    '@type': 'BlogPosting',
    headline: input.headline,
    description: input.description,
    datePublished: input.datePublished,
    author: { '@type': 'Organization', name: input.authorName || input.publisherName },
    publisher: { '@type': 'Organization', name: input.publisherName, url: input.publisherUrl },
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
    image: input.image,
  });
}

export interface BreadcrumbItem {
  name: string;
  /** URL absoluta. */
  url: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]): JsonLdObject {
  return node({
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
}

export interface ServiceInput {
  name: string;
  description?: string;
  url: string;
}

export function serviceListSchema(
  services: ServiceInput[],
  provider: { name: string; url: string },
): JsonLdObject {
  return node({
    '@type': 'ItemList',
    itemListElement: services.map((service, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: service.name,
        description: service.description,
        url: service.url,
        provider: { '@type': 'Organization', name: provider.name, url: provider.url },
      },
    })),
  });
}

export function faqPageSchema(items: { question: string; answer: string }[]): JsonLdObject {
  return node({
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  });
}

export function collectionPageSchema(input: {
  name: string;
  description?: string;
  url: string;
  itemNames: string[];
}): JsonLdObject {
  return node({
    '@type': 'CollectionPage',
    name: input.name,
    description: input.description,
    url: input.url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: input.itemNames.map((name, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name,
      })),
    },
  });
}
