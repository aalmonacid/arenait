import type { CaseStudySchema, ServiceSchema } from '../types/sanity';

/**
 * Contenido real de respaldo, usado mientras el dataset de Sanity (`production`)
 * no tenga estos documentos cargados. No son datos inventados: son el copy
 * acordado con el cliente (ver copy-arenait-textos-reales.md).
 */
export const fallbackServices: ServiceSchema[] = [
  {
    _id: 'fallback-desarrollo-a-la-medida',
    title: 'Desarrollo de software a la medida',
    slug: { current: 'desarrollo-a-la-medida' },
    icon: 'code',
    summary:
      'Construimos el sistema que tu negocio necesita, diseñado desde cero para tu operación.',
    description:
      'Construimos el sistema que tu negocio necesita, diseñado desde cero para tu operación — no una plantilla adaptada a la fuerza.',
  },
  {
    _id: 'fallback-implementacion-de-aplicaciones',
    title: 'Implementación de aplicaciones',
    slug: { current: 'implementacion-de-aplicaciones' },
    icon: 'deploy',
    summary:
      'Ponemos en marcha las soluciones tecnológicas que tu empresa eligió o que diseñamos contigo.',
    description:
      'Ponemos en marcha las soluciones tecnológicas que tu empresa eligió o que diseñamos contigo, cuidando que la transición no interrumpa tu operación diaria.',
  },
  {
    _id: 'fallback-gestion-de-proyectos-de-ti',
    title: 'Gestión de proyectos de TI',
    slug: { current: 'gestion-de-proyectos-de-ti' },
    icon: 'tasks',
    summary:
      'Lideramos tus proyectos tecnológicos con metodología clara, alcance definido y comunicación constante.',
    description:
      'Lideramos tus proyectos tecnológicos con metodología clara, alcance definido y comunicación constante, para que siempre sepas en qué punto va tu inversión.',
  },
  {
    _id: 'fallback-business-intelligence',
    title: 'Business Intelligence',
    slug: { current: 'business-intelligence' },
    icon: 'chart',
    summary:
      'Transformamos los datos que ya genera tu operación en reportes e indicadores que se usan para decidir.',
    description:
      'Transformamos los datos que ya genera tu operación en reportes e indicadores que se usan para decidir, no en dashboards que nadie abre.',
  },
  {
    _id: 'fallback-aseguramiento-de-la-calidad',
    title: 'Aseguramiento de la calidad (QA / Testing)',
    slug: { current: 'aseguramiento-de-la-calidad' },
    icon: 'shield-check',
    summary: 'Probamos cada entrega de software antes de que llegue a tus usuarios.',
    description:
      'Probamos cada entrega de software antes de que llegue a tus usuarios, para detectar errores en desarrollo, no en producción.',
  },
  {
    _id: 'fallback-mantenimiento-y-migracion-de-software',
    title: 'Mantenimiento y migración de software',
    slug: { current: 'mantenimiento-y-migracion-de-software' },
    icon: 'wrench',
    summary:
      'El software vivo necesita evolucionar — damos mantenimiento y migramos lo que ya construiste.',
    description:
      'El software vivo necesita evolucionar. Damos mantenimiento, actualizamos versiones y migramos aplicaciones legadas para que sigan respondiendo a tu negocio.',
  },
];

export const fallbackCaseStudies: CaseStudySchema[] = [
  {
    _id: 'fallback-sadep',
    title: 'Gestión remota de fincas ganaderas',
    slug: { current: 'sadep' },
    client: 'SADEP LTDA',
    industry: 'Agroindustria / Ganadería',
    challenge:
      'Sadep necesitaba centralizar la captura de datos, la generación de indicadores y la simulación de producción en operaciones ganaderas dispersas, sin depender de procesos manuales.',
    solution:
      'Construimos dos plataformas a la medida — Tauruswebs (ganado bovino) y Oviswebs (ganado ovino-caprino) — para captura de datos, gestión de producción, generación de indicadores y simulación, con administración remota de finca.',
    results: [
      'Sadep opera y supervisa sus fincas de forma remota, con datos centralizados y trazables en un solo sistema.',
    ],
  },
];
