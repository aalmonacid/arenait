import type { Rule as SanityRule, ValidationContext } from 'sanity';
import { richText } from './portableText';
import { todayInBogota } from '../src/lib/contentRules';

/**
 * Política de Tratamiento de Datos Personales: UNA VERSIÓN POR DOCUMENTO.
 * Cada contacto guarda el número de versión que aceptó; conservar el texto
 * exacto de cada versión es la evidencia de consentimiento (Ley 1581 de 2012).
 *
 * Para cambiar la política: duplica la última versión, sube el número y pon la
 * fecha desde la que rige; no edites una versión ya publicada. El sitio muestra
 * como vigente la de fecha más reciente que no sea futura y publica una página
 * por versión (/politica-de-tratamiento-de-datos/version-1-1).
 *
 * Protección: un documento YA PUBLICADO cuya fecha de entrada en vigor ya pasó
 * es de solo lectura en el Studio (`readOnly`). Los borradores y las versiones
 * con fecha futura siguen editables. Es una protección del Studio, no del API.
 */
export const privacyPolicySchema = {
  name: 'privacyPolicy',
  title: 'Política de datos (versión)',
  type: 'document',
  description:
    'Para cambiar la política, duplica la última versión, sube el número y la fecha. No edites una versión ya publicada: es la evidencia de lo que aceptó cada contacto.',
  readOnly: ({ document }: { document?: { _id?: string; effectiveDate?: string } }) =>
    Boolean(
      document?._id &&
      !document._id.startsWith('drafts.') &&
      document.effectiveDate &&
      document.effectiveDate <= todayInBogota(),
    ),
  fields: [
    {
      name: 'version',
      title: 'Versión',
      type: 'string',
      description:
        'Solo números separados por punto (1.2, 2.0). No puede repetirse. Es la parte final de la URL de esta versión (1.2 → /version-1-2).',
      validation: (Rule: SanityRule) =>
        Rule.required().custom(async (value: string | undefined, context: ValidationContext) => {
          if (!value) return true;
          if (!/^[0-9]+(\.[0-9]+)*$/.test(value.trim())) {
            return 'Usa solo números separados por punto (por ejemplo, 1.2).';
          }
          const id = String(context.document?._id ?? '').replace(/^drafts\./, '');
          const client = context.getClient({ apiVersion: '2024-01-01' });
          const repeated: number = await client.fetch(
            `count(*[_type == "privacyPolicy" && version == $version && !(_id in [$id, "drafts." + $id])])`,
            { version: value.trim(), id },
          );
          return repeated > 0
            ? `Ya existe otra versión ${value.trim()}. Usa un número distinto.`
            : true;
        }),
    },
    {
      name: 'effectiveDate',
      title: 'Rige desde',
      type: 'date',
      description:
        'La versión vigente es la de fecha más reciente que no sea futura. Una versión con fecha futura se publica pero no rige hasta ese día (el sitio se reconstruye al publicar: si la fecha es futura, hay que reconstruirlo ese día).',
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: 'changeSummary',
      title: 'Nota interna: qué cambió frente a la versión anterior',
      type: 'text',
      rows: 3,
      description: 'Solo para el equipo: no se muestra en el sitio. Opcional.',
    },
    {
      name: 'responsible',
      title: 'Responsable del tratamiento',
      type: 'object',
      description:
        'Datos del responsable. Si un campo se deja vacío, la página muestra «pendiente de confirmar con el cliente». No inventes valores.',
      options: { collapsible: true, collapsed: false },
      fields: [
        { name: 'legalName', title: 'Razón social completa', type: 'string' },
        { name: 'nit', title: 'NIT', type: 'string' },
        { name: 'address', title: 'Domicilio legal', type: 'string' },
        {
          name: 'rightsChannel',
          title: 'Correo o canal para ejercer derechos (ARCO)',
          type: 'string',
        },
      ],
    },
    richText('intro', 'Introducción', {
      description: 'Texto que va antes de las secciones.',
    }),
    {
      name: 'sections',
      title: 'Secciones',
      type: 'array',
      validation: (Rule: SanityRule) => Rule.required().min(1),
      of: [
        {
          type: 'object',
          name: 'policySection',
          title: 'Sección',
          fields: [
            {
              name: 'title',
              title: 'Título',
              type: 'string',
              description: 'Con su numeración: «1. Responsable del tratamiento».',
              validation: (Rule: SanityRule) => Rule.required(),
            },
            {
              name: 'anchor',
              title: 'Ancla (opcional)',
              type: 'string',
              description:
                'Permite enlazar a la sección (/politica-de-tratamiento-de-datos#cookies). Conserva «cookies» y «encargados»: el aviso de cookies y otras páginas enlazan a ellas.',
              validation: (Rule: SanityRule) =>
                Rule.custom((value: string | undefined) =>
                  !value || /^[a-z][a-z0-9-]*$/.test(value)
                    ? true
                    : 'Solo minúsculas, números y guiones, empezando por una letra.',
                ),
            },
            richText('body', 'Texto de la sección'),
            {
              name: 'showData',
              title: 'Mostrar bajo el texto',
              type: 'string',
              initialValue: 'none',
              options: {
                layout: 'dropdown',
                list: [
                  { title: 'Nada', value: 'none' },
                  {
                    title: 'Datos del responsable (razón social, NIT, domicilio)',
                    value: 'responsible',
                  },
                  { title: 'Canal para ejercer derechos', value: 'rightsChannel' },
                ],
              },
            },
          ],
          preview: { select: { title: 'title', subtitle: 'anchor' } },
        },
      ],
    },
  ],
  orderings: [
    {
      title: 'Rige desde (más reciente primero)',
      name: 'effectiveDateDesc',
      by: [{ field: 'effectiveDate', direction: 'desc' }],
    },
  ],
  preview: {
    select: { version: 'version', date: 'effectiveDate' },
    prepare: ({ version, date }: { version?: string; date?: string }) => ({
      title: `Versión ${version ?? '(sin número)'}`,
      subtitle: date ? `Rige desde ${date.split('-').reverse().join('/')}` : 'Sin fecha',
    }),
  },
};
