/**
 * Constructor mínimo de Portable Text para los respaldos del sitio (blog y
 * política): permite escribir el contenido como texto legible y producir la
 * misma estructura que guarda Sanity. Las claves (`_key`) son deterministas.
 *
 * Marcado en línea admitido: **negrita**. Solo importa TIPOS (`import type`):
 * lo ejecuta Node directamente desde `scripts/seed-content.mjs`.
 */
import type {
  PortableTextBlockNode,
  PortableTextContent,
  PortableTextSpan,
} from '../../types/sanity';

export type PtItem =
  readonly ['p' | 'h2' | 'h3' | 'quote', string] | readonly ['ul' | 'ol', readonly string[]];

function spans(text: string, prefix: string): PortableTextSpan[] {
  return text
    .split('**')
    .map((part, i) => ({ part, bold: i % 2 === 1 }))
    .filter(({ part }) => part !== '')
    .map(({ part, bold }, i) => ({
      _type: 'span' as const,
      _key: `${prefix}s${i + 1}`,
      text: part,
      marks: bold ? ['strong'] : [],
    }));
}

function block(
  key: string,
  text: string,
  extra: Partial<PortableTextBlockNode> = {},
): PortableTextBlockNode {
  return {
    _type: 'block',
    _key: key,
    style: 'normal',
    markDefs: [],
    children: spans(text, key),
    ...extra,
  };
}

const STYLES = { p: 'normal', h2: 'h2', h3: 'h3', quote: 'blockquote' } as const;

/** Convierte la lista de bloques simples en Portable Text. */
export function pt(items: readonly PtItem[]): PortableTextContent {
  const out: PortableTextContent = [];
  items.forEach((item, i) => {
    const key = `b${i + 1}`;
    const [kind, value] = item;
    if (kind === 'ul' || kind === 'ol') {
      (value as readonly string[]).forEach((text, j) =>
        out.push(
          block(`${key}i${j + 1}`, text, {
            listItem: kind === 'ul' ? 'bullet' : 'number',
            level: 1,
          }),
        ),
      );
    } else {
      out.push(block(key, value as string, { style: STYLES[kind] }));
    }
  });
  return out;
}
