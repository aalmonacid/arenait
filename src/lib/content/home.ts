import type { HomePage } from '../../types/sanity';

/** Respaldo del inicio (documento `homePage` en Sanity). */
export const fallbackHomePage: HomePage = {
  seoTitle: 'Software a la medida, Bizagi e IA',
  seoDescription:
    'Desde 2013, software a la medida, procesos en Bizagi e inteligencia artificial para organizaciones públicas y privadas en Colombia.',

  heroEyebrow: 'Software a la medida, Bizagi e IA',
  heroTitle: 'Software e IA para operaciones reales.',
  heroTitleHighlight: 'reales.',
  heroIntro:
    'Desde 2013 diseñamos, construimos y operamos soluciones a la medida, procesos en Bizagi e inteligencia artificial para organizaciones públicas y privadas.',
  heroPrimaryCta: { label: 'Cuéntanos tu reto', href: '/contacto' },
  heroSecondaryCta: { label: 'Ver servicios', href: '/servicios' },
  quickLinks: [
    { label: 'Servicios', href: '#servicios' },
    { label: 'Cómo trabajamos', href: '#como-trabajamos' },
    { label: 'Proyectos', href: '#proyectos' },
    { label: 'Sectores', href: '#sectores' },
  ],

  servicesTitle: 'Un solo equipo para construir, aplicar IA y operar.',
  pillars: [
    {
      key: 'construimos',
      number: '01',
      title: 'Construimos',
      text: 'Software a la medida, integración de sistemas, modernización de aplicaciones y automatización de procesos con Bizagi.',
    },
    {
      key: 'aplicamos-ia',
      number: '02',
      title: 'Aplicamos IA',
      text: 'Business Intelligence, automatización documental, asistentes y agentes de IA, y modelos predictivos aplicados a tu operación.',
    },
    {
      key: 'operamos',
      number: '03',
      title: 'Operamos',
      text: 'Mantenimiento evolutivo, aseguramiento de la calidad y outsourcing de talento TI para que tus aplicaciones sigan funcionando.',
    },
  ],
  pillarLinkLabel: 'Ver servicios →',
  allServicesLink: { label: 'Ver todos los servicios', href: '/servicios' },

  processTitle: 'Un proceso claro, con IA y control humano en cada fase.',
  processSteps: [
    {
      title: 'Diagnóstico',
      text: 'Priorizamos procesos por impacto y esfuerzo antes de escribir código.',
    },
    {
      title: 'Piloto',
      text: 'Validamos un caso acotado cuando la solución lo requiere.',
    },
    {
      title: 'Desarrollo',
      text: 'Construimos por incrementos, con revisión humana del código.',
    },
    {
      title: 'QA',
      text: 'Ninguna entrega sale sin pruebas aprobadas.',
    },
    {
      title: 'Implementación',
      text: 'Ponemos en marcha la solución sin interrumpir la operación.',
    },
    {
      title: 'Operación',
      text: 'Mantenemos y evolucionamos la solución con acuerdos de nivel de servicio.',
    },
  ],
  processLink: { label: 'Ver cómo trabajamos', href: '/servicios#como-trabajamos' },

  projectsTitle: 'Proyectos que hemos entregado.',
  projectsLink: { label: 'Ver todos los proyectos', href: '/proyectos' },

  sectorsTitle: 'Experiencia en sectores donde la operación no puede detenerse.',

  closingTitle: '¿Tienes un reto operativo que el software o la IA pueden resolver?',
  closingText: 'Cuéntanos qué necesitas. Te respondemos con una propuesta concreta.',
  closingLinks: [{ label: 'Cuéntanos tu reto', href: '/contacto' }],
  closingWhatsappLabel: 'WhatsApp',
};
