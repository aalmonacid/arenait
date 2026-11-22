/**
 * Opciones del formulario de contacto: fuente única para el formulario
 * (LeadCaptureForm.astro), la validación del Worker (leadValidation.ts) y los
 * correos y avisos (mailer.ts, leadNotify.ts).
 *
 * El `value` de cada servicio es el slug del servicio en /servicios (la misma
 * ancla que usa `?servicio=`); el `value` de cada modelo es un código técnico.
 * Una prueba (`leadOptions.test.ts`) obliga a que todos los servicios del
 * respaldo de contenido estén aquí.
 */
export interface LeadOption {
  value: string;
  label: string;
}

export interface LeadOptionGroup {
  group: string;
  options: LeadOption[];
}

export const SERVICE_OPTION_GROUPS: LeadOptionGroup[] = [
  {
    group: 'Construimos',
    options: [
      { value: 'desarrollo-software-a-la-medida', label: 'Desarrollo de software a la medida' },
      {
        value: 'integracion-automatizacion-procesos',
        label: 'Integración y automatización de procesos',
      },
      {
        value: 'modernizacion-migracion-sistemas',
        label: 'Modernización y migración de sistemas legados',
      },
      { value: 'bizagi', label: 'Automatización de procesos con Bizagi' },
    ],
  },
  {
    group: 'Aplicamos IA',
    options: [
      { value: 'business-intelligence-analitica', label: 'Business Intelligence y analítica' },
      { value: 'automatizacion-documental-ia', label: 'Automatización documental con IA' },
      { value: 'asistentes-ia', label: 'Asistentes de IA sobre tu información' },
      { value: 'agentes-ia', label: 'Agentes de IA que ejecutan tareas' },
      { value: 'modelos-predictivos', label: 'Modelos predictivos' },
      { value: 'integracion-ia-sistemas', label: 'IA integrada a tus sistemas actuales' },
    ],
  },
  {
    group: 'Operamos',
    options: [
      { value: 'mantenimiento-soporte-software', label: 'Mantenimiento evolutivo y soporte' },
      { value: 'aseguramiento-calidad-qa', label: 'Aseguramiento de la calidad (QA)' },
      { value: 'outsourcing-talento-ti', label: 'Outsourcing de talento TI' },
    ],
  },
  {
    group: 'Otros',
    options: [
      { value: 'diagnostico', label: 'Diagnóstico' },
      { value: 'otro', label: 'Otro' },
    ],
  },
];

export const SERVICE_OPTIONS: LeadOption[] = SERVICE_OPTION_GROUPS.flatMap((g) => g.options);

export const INTEREST_MODEL_OPTIONS: LeadOption[] = [
  { value: 'proyecto-alcance-definido', label: 'Proyecto con alcance definido' },
  { value: 'celula-dedicada', label: 'Célula dedicada' },
  { value: 'outsourcing-talento-ti', label: 'Outsourcing de talento TI' },
  { value: 'bolsa-de-horas', label: 'Bolsa de horas' },
  { value: 'mantenimiento-soporte', label: 'Mantenimiento y soporte' },
  { value: 'no-se', label: 'Aún no lo sé' },
];

const SERVICE_LABELS = new Map(SERVICE_OPTIONS.map((o) => [o.value, o.label]));
const MODEL_LABELS = new Map(INTEREST_MODEL_OPTIONS.map((o) => [o.value, o.label]));

export const isKnownService = (value: string): boolean => SERVICE_LABELS.has(value);
export const isKnownInterestModel = (value: string): boolean => MODEL_LABELS.has(value);

/**
 * Etiqueta visible de un servicio. Los contactos anteriores guardaban el título
 * y los nuevos guardan el slug: un valor que no está en la lista se devuelve
 * tal cual, para que los correos nunca fallen ni pierdan información.
 */
export const serviceLabel = (value: string): string => SERVICE_LABELS.get(value) ?? value;
export const interestModelLabel = (value: string): string => MODEL_LABELS.get(value) ?? value;
