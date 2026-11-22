/**
 * Enlaces dentro de un texto editable en Sanity. El texto se guarda como una
 * cadena simple y los enlaces se escriben `[texto](/ruta)` o `[texto](#ancla)`.
 * Solo se aceptan destinos internos: cualquier otro destino (http:, javascript:,
 * //dominio) se descarta y queda únicamente el texto, para que un valor del
 * Studio no pueda inyectar enlaces externos ni esquemas peligrosos.
 */
export interface InlineSegment {
  text: string;
  href?: string;
}

const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const SAFE_HREF = /^(\/(?!\/)|#)/;

export function parseInlineLinks(input: string): InlineSegment[] {
  const out: InlineSegment[] = [];
  let last = 0;
  for (const match of input.matchAll(LINK_RE)) {
    const index = match.index ?? 0;
    if (index > last) out.push({ text: input.slice(last, index) });
    const [, text, href] = match;
    out.push(SAFE_HREF.test(href) ? { text, href } : { text });
    last = index + match[0].length;
  }
  if (last < input.length) out.push({ text: input.slice(last) });
  return out;
}

/** El mismo texto sin la marca de enlaces (metadatos, JSON-LD). */
export function stripInlineLinks(input: string): string {
  return input.replace(LINK_RE, '$1');
}
