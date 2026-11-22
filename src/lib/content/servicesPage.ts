import type { ServicesPage } from '../../types/sanity';

/** Respaldo de /servicios (documento `servicesPage` en Sanity). */
export const fallbackServicesPage: ServicesPage = {
  seoTitle: 'Servicios de software, Bizagi e IA',
  seoDescription:
    'Desde 2013, software a la medida, Bizagi, inteligencia artificial y outsourcing de talento TI para organizaciones públicas y privadas en Colombia.',

  heroEyebrow: 'Servicios',
  heroTitle: 'Software e IA para operaciones que no pueden fallar.',
  heroIntro:
    'Diseñamos, construimos y operamos soluciones a la medida y automatizamos procesos para organizaciones públicas y privadas. Incorporamos inteligencia artificial donde genera valor medible, con el control que exigen tus áreas de riesgo, seguridad y cumplimiento.',
  heroPrimaryCta: { label: 'Cuéntanos tu reto', href: '/contacto' },
  heroSecondaryCta: { label: 'Ver cómo trabajamos', href: '#como-trabajamos' },
  quickLinks: [
    { label: '01 Construimos', href: '#construimos' },
    { label: '02 Aplicamos IA', href: '#aplicamos-ia' },
    { label: '03 Operamos', href: '#operamos' },
    { label: 'Dónde hemos trabajado', href: '#donde-hemos-trabajado' },
    { label: 'Cómo trabajamos', href: '#como-trabajamos' },
    { label: 'Modelos de trabajo', href: '#modelos-de-trabajo' },
  ],

  pillars: [
    {
      key: 'construimos',
      number: '01',
      title: 'Construimos',
      heading: 'Software a la medida que se adapta a tu operación, no al revés.',
      intro:
        'Cuando una herramienta estándar ya no alcanza, construimos el sistema que tu negocio necesita y lo conectamos con los sistemas que ya tienes.',
    },
    {
      key: 'aplicamos-ia',
      number: '02',
      title: 'Aplicamos IA',
      heading: 'Datos e IA aplicados a procesos reales, con resultados medibles.',
      intro:
        'Identificamos dónde la inteligencia artificial reduce tiempos, errores o costos en tu operación, la probamos en un caso acotado y la escalamos cuando demuestra valor.',
    },
    {
      key: 'operamos',
      number: '03',
      title: 'Operamos',
      heading: 'Software en operación, con calidad, continuidad y el talento adecuado.',
      intro:
        'Lo que construimos, o lo que ya tienes, debe seguir funcionando, mejorar y adaptarse. Nos encargamos de que así sea, con nuestro equipo o reforzando el tuyo.',
    },
  ],

  serviceCtaLabel: 'Hablemos de tu proyecto →',

  sectorsTitle: 'Experiencia en sectores donde la operación no puede detenerse.',
  sectorsLink: { label: 'Ver proyectos →', href: '/proyectos' },

  processTitle: 'Un proceso claro, con IA y control humano en cada fase.',
  processPhases: [
    {
      number: '01',
      name: 'Diagnóstico',
      whatWeDo:
        'Priorizamos procesos por impacto y esfuerzo, evaluamos la viabilidad técnica y proponemos arquitectura, estimación y hoja de ruta.',
      quality: 'Alcance, duración y precio acordados antes de iniciar',
    },
    {
      number: '02',
      name: 'Piloto',
      whatWeDo:
        'Ponemos en funcionamiento un caso acotado, con datos reales y métricas de éxito definidas.',
      quality: 'Decisión de escalar basada en resultados',
    },
    {
      number: '03',
      name: 'Desarrollo',
      whatWeDo:
        'Construimos por incrementos, con asistentes de IA que agilizan el código y la documentación.',
      quality: 'Revisión humana del código en cada cambio',
    },
    {
      number: '04',
      name: 'QA',
      whatWeDo: 'Ejecutamos pruebas funcionales, automatizadas y de seguridad.',
      quality: 'Ninguna entrega sin pruebas aprobadas',
    },
    {
      number: '05',
      name: 'Implementación',
      whatWeDo: 'Ponemos en marcha la solución sin interrumpir la operación.',
      quality: 'Plan de despliegue y reversión',
    },
    {
      number: '06',
      name: 'Operación',
      whatWeDo: 'Mantenemos, monitoreamos y evolucionamos la solución.',
      quality: 'SLA y reportes periódicos',
    },
  ],
  processNotes: [
    'El piloto aplica cuando la solución requiere validar valor antes de escalar, como suele ocurrir con las iniciativas de IA. Si el piloto no demuestra valor, conservas los hallazgos y la documentación para tomar una decisión informada.',
    'La gestión del proyecto es transversal a todas las fases.',
  ],
  processCta: { label: 'Cuéntanos tu reto →', href: '/contacto?servicio=diagnostico' },

  modelsTitle: 'Elige cómo quieres trabajar con nosotros.',
  models: [
    {
      title: 'Proyecto con alcance definido',
      text: 'Objetivo, alcance y cronograma acordados, con entregas por hitos y seguimiento constante.',
    },
    {
      title: 'Célula dedicada',
      text: 'Un equipo autónomo para una iniciativa específica, con la agilidad que requieren los proyectos que no caben en el ciclo de tu proveedor principal.',
    },
    {
      title: 'Outsourcing de talento TI',
      text: 'Profesionales especializados en desarrollo, Bizagi, datos, QA y arquitectura, que trabajan bajo la dirección de tu equipo. [Ver servicio →](#outsourcing-talento-ti)',
    },
    {
      title: 'Bolsa de horas',
      text: 'Horas disponibles para soporte, mejoras y consultoría puntual, sin un compromiso de largo plazo.',
    },
    {
      title: 'Mantenimiento y soporte',
      text: 'Evolución continua de tus aplicaciones con acuerdos de nivel de servicio.',
    },
  ],

  securityTitle: 'Trabajamos con el cuidado que exigen tus áreas de riesgo y seguridad.',
  securityItems: [
    {
      title: 'Tu infraestructura',
      text: 'trabajamos en tus repositorios y ambientes cuando nos das acceso.',
    },
    {
      title: 'Tu política de datos',
      text: 'definimos contigo qué información puede usar la IA, con qué proveedores, dónde se aloja, qué se registra y cómo se audita.',
    },
    {
      title: 'Control humano',
      text: 'ningún agente ejecuta operaciones sensibles sin aprobación.',
    },
    {
      title: 'Trazabilidad',
      text: 'registramos las consultas, decisiones y acciones de los sistemas de IA.',
    },
    {
      title: 'Datos personales',
      text: 'tratamos la información conforme a la Ley 1581 de 2012.',
    },
    {
      title: 'Confidencialidad',
      text: 'firmamos acuerdos de confidencialidad cuando tu organización lo requiere.',
    },
    {
      title: 'Desarrollo seguro',
      text: 'aplicamos buenas prácticas OWASP.',
    },
  ],

  faq: [
    {
      question: '¿Cuánto tarda un proyecto?',
      answer:
        'Depende del alcance. Lo definimos contigo antes de iniciar y planificamos por etapas, con entregas incrementales para que veas avance desde el principio.',
    },
    {
      question: '¿Cómo se define el costo?',
      answer:
        'Según el modelo de trabajo y el alcance. Antes de iniciar acordamos contigo el alcance, la duración y el precio de cada etapa. El soporte se maneja con un plan mensual o con una bolsa de horas.',
    },
    {
      question: '¿Cómo se manejan mis datos en las soluciones de IA?',
      answer:
        'Lo definimos contigo desde el diagnóstico: qué información se usa, con qué proveedor de IA, dónde se aloja, qué se registra y cómo se audita, de acuerdo con tus políticas de seguridad y privacidad.',
    },
    {
      question: '¿Qué tecnologías usan?',
      answer:
        'Elegimos la tecnología según tu ecosistema y tus políticas. Trabajamos con Bizagi, .NET, Java, Python, Angular y Android nativo, con múltiples motores de bases de datos como SQL Server y PostgreSQL, en nubes como AWS, Azure y Google Cloud, y con proveedores corporativos de IA.',
    },
    {
      question: '¿Trabajan con Bizagi?',
      answer:
        'Sí. Contamos con profesionales certificados en Bizagi. Implementamos nuevos procesos, damos soporte, migramos a nuevas versiones de la plataforma e integramos Bizagi con tus sistemas y con capacidades de IA.',
    },
    {
      question: '¿Pueden trabajar junto a nuestro proveedor actual?',
      answer:
        'Sí. Complementamos a equipos internos y a proveedores principales en iniciativas específicas.',
    },
  ],

  closingTitle: '¿Tienes un proceso que la tecnología o la IA podrían resolver?',
  closingText: 'Cuéntanos qué necesitas. Te respondemos con una propuesta concreta.',
  closingLinks: [{ label: 'Cuéntanos tu reto', href: '/contacto' }],
  closingWhatsappLabel: 'WhatsApp',
};
