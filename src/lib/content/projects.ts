import type { ProjectSchema } from '../../types/sanity';

/**
 * Respaldo de los proyectos publicables (documentos `project` en Sanity).
 *
 * IMPORTANTE (repo público): aquí solo van los casos que el cliente autorizó a
 * mostrar (por nombre, como entidad pública, o de forma anónima). Los casos
 * pendientes de autorización NO se escriben en el código: viven en un archivo
 * local ignorado (scripts/seed/private/) y se cargan a Sanity como borradores.
 *
 * `order` sigue la numeración del documento del cliente (hay huecos: son los
 * casos pendientes). El año o período solo aparece dentro del resultado cuando
 * el cliente lo decidió así.
 */
export const fallbackProjects: ProjectSchema[] = [
  {
    _id: 'fallback-project-implementacion-procesos-bizagi-entidades-publicas',
    title: 'Implementación de procesos Bizagi en entidades públicas',
    slug: { current: 'implementacion-procesos-bizagi-entidades-publicas' },
    order: 4,
    client: 'Entidades públicas de Bogotá y Cundinamarca',
    intermediary: 'Aperce',
    sector: 'publico',
    category: 'bizagi',
    serviceLabel: 'Bizagi (desarrollo e implementación)',
    serviceAnchor: 'bizagi',
    challenge: 'Desarrollar e implementar en Bizagi procesos de varias entidades públicas.',
    whatWeDid: [
      'Brindamos apoyo técnico en el desarrollo de procesos en Bizagi para la Secretaría Distrital de Gobierno, la Secretaría Jurídica Distrital y la Gobernación de Cundinamarca.',
    ],
    result: 'Procesos implementados y en uso por las entidades.',
    authorization: 'entidad-publica',
    featuredOnHome: true,
    homeOrder: 2,
    homeSummary: 'Procesos implementados y en uso por las entidades.',
  },
  {
    _id: 'fallback-project-migracion-nube-proyecto-bizagi',
    title: 'Migración a la nube de un proyecto Bizagi',
    slug: { current: 'migracion-nube-proyecto-bizagi' },
    order: 5,
    client: 'Entidad financiera',
    intermediary: 'Aperce',
    sector: 'financiero',
    category: 'bizagi',
    serviceLabel: 'Bizagi (migración)',
    serviceAnchor: 'bizagi',
    challenge: 'Trasladar a la nube un proyecto Bizagi en operación.',
    whatWeDid: ['Brindamos apoyo técnico en la migración del proyecto Bizagi a la nube.'],
    result:
      'Proyecto Bizagi operando en la nube, migrado sin interrupción del servicio, entre 2025 y 2026.',
    authorization: 'anonimo',
    featuredOnHome: true,
    homeOrder: 1,
    homeSummary: 'Proyecto Bizagi operando en la nube, migrado sin interrupción del servicio.',
  },
  {
    _id: 'fallback-project-carga-inicial-datos-bizagi',
    title: 'Carga inicial de datos desde múltiples fuentes en Bizagi',
    slug: { current: 'carga-inicial-datos-bizagi' },
    order: 6,
    client: 'Banco colombiano',
    intermediary: 'Aperce',
    sector: 'financiero',
    category: 'bizagi',
    serviceLabel: 'Bizagi (carga de datos)',
    serviceAnchor: 'bizagi',
    challenge:
      'Consolidar en un proyecto Bizagi, antes de su puesta en marcha, información proveniente de múltiples fuentes.',
    whatWeDid: [
      'Realizamos la carga inicial de datos desde múltiples fuentes hacia el proyecto Bizagi.',
    ],
    result:
      'Información de múltiples fuentes consolidada en Bizagi para el inicio de la operación del proceso.',
    authorization: 'anonimo',
  },
  {
    _id: 'fallback-project-aplicacion-movil-gestion-ganadera',
    title: 'Desarrollo de la aplicación móvil de una plataforma de gestión ganadera',
    slug: { current: 'aplicacion-movil-gestion-ganadera' },
    order: 8,
    client: 'SADEP',
    sector: 'agropecuario',
    category: 'software-a-la-medida',
    serviceLabel: 'Desarrollo de software a la medida',
    serviceAnchor: 'desarrollo-software-a-la-medida',
    technologies: 'Android nativo, sincronización en la nube',
    challenge:
      'Capturar en campo la información de las fincas ganaderas y sincronizarla con la versión de escritorio.',
    whatWeDid: [
      'Desarrollamos la versión móvil de TaurusWebs en Android nativo para la captura de datos en campo.',
      'Implementamos la sincronización desde y hacia la nube de los cambios realizados en los dispositivos móviles, lo que permite sincronizarlos con la versión de escritorio.',
    ],
    result:
      'Información de campo capturada desde el móvil y sincronizada con la versión de escritorio.',
    note: 'TaurusWebs es un producto de SADEP.',
    authorization: 'autorizado',
    featuredOnHome: true,
    homeOrder: 3,
    homeSummary:
      'Información de campo capturada desde el móvil y sincronizada con la versión de escritorio.',
  },
  {
    _id: 'fallback-project-sistema-procesamiento-solicitudes-bizagi',
    title: 'Desarrollo de un sistema de procesamiento de solicitudes integrado con Bizagi',
    slug: { current: 'sistema-procesamiento-solicitudes-bizagi' },
    order: 10,
    client: 'Banco colombiano',
    intermediary: 'Aperce',
    sector: 'financiero',
    category: 'software-a-la-medida',
    serviceLabel: 'Desarrollo de software a la medida',
    serviceAnchor: 'desarrollo-software-a-la-medida',
    technologies: '.NET, Web API, servicio de Windows, SQL Server, integración con Bizagi',
    challenge: 'Procesar un alto volumen de solicitudes que requerían ejecutar varias tareas en Bizagi.',
    whatWeDid: [
      'Desarrollamos una API en .NET que recibe las solicitudes a procesar y las registra en SQL Server.',
      'Desarrollamos un servicio de Windows que se ejecuta periódicamente y realiza en Bizagi las tareas de cada solicitud pendiente.',
    ],
    result: 'Alto volumen de solicitudes procesado dentro de los procesos de Bizagi.',
    authorization: 'anonimo',
  },
  {
    _id: 'fallback-project-arquitectura-migracion-portal-web',
    title: 'Arquitectura y migración de un portal web',
    slug: { current: 'arquitectura-migracion-portal-web' },
    order: 11,
    client: 'Firma internacional del sector asegurador',
    intermediary: 'Aperce',
    sector: 'seguros',
    category: 'software-a-la-medida',
    serviceLabel: 'Desarrollo de software a la medida (arquitectura y migración)',
    serviceAnchor: 'desarrollo-software-a-la-medida',
    technologies: '.NET, Angular',
    challenge: 'Evolucionar el portal web existente hacia una nueva arquitectura.',
    whatWeDid: [
      'Realizamos la consultoría y el diseño de la arquitectura del nuevo portal en .NET y Angular.',
      'Migramos el portal desde su versión anterior.',
    ],
    result:
      'Portal operando en la nueva arquitectura en .NET y Angular, sin afectar a los usuarios existentes.',
    authorization: 'anonimo',
  },
  {
    _id: 'fallback-project-sistema-nube-taurusweb-ovisweb',
    title:
      'Desarrollo de un sistema en la nube para centralizar la información del ecosistema TaurusWebs y OvisWebs',
    slug: { current: 'sistema-nube-taurusweb-ovisweb' },
    order: 12,
    client: 'SADEP',
    sector: 'agropecuario',
    category: 'software-a-la-medida',
    serviceLabel: 'Desarrollo de software a la medida',
    serviceAnchor: 'desarrollo-software-a-la-medida',
    challenge:
      'Permitir que varias personas trabajen sobre la misma finca y que la información capturada llegue a todos los equipos.',
    whatWeDid: [
      'Diseñamos, desarrollamos e implementamos un sistema en la nube para centralizar la información de TaurusWebs y OvisWebs.',
      'Habilitamos el trabajo de varias personas sobre la misma finca, con propagación de la información capturada a los demás equipos.',
      'Modificamos los aplicativos de escritorio para sincronizar la información.',
    ],
    result:
      'Información centralizada en la nube y sincronizada entre los equipos que trabajan sobre la misma finca.',
    note: 'TaurusWebs y OvisWebs son productos de SADEP.',
    authorization: 'autorizado',
  },
  {
    _id: 'fallback-project-centralizacion-informacion-supermercados',
    title: 'Centralización de información de supermercados en SQL Server',
    slug: { current: 'centralizacion-informacion-supermercados' },
    order: 13,
    client: 'Compañía farmacéutica multinacional',
    intermediary: 'Firma de investigación de mercados',
    sector: 'farmaceutico',
    category: 'software-a-la-medida',
    serviceLabel: 'Modernización y migración de sistemas legados',
    serviceAnchor: 'modernizacion-migracion-sistemas',
    secondaryServiceLabel: 'Business Intelligence y analítica',
    secondaryServiceAnchor: 'business-intelligence-analitica',
    technologies: 'SQL Server, SSIS',
    challenge:
      'Reducir el cruce de información, que tardaba cerca de 12 horas y perdía la conexión con un servidor externo, y dejar de depender de infraestructura de terceros.',
    whatWeDid: [
      'Migramos la información de supermercados, de la base de datos local en Access y del servidor externo, a una base de datos centralizada en SQL Server.',
      'Desarrollamos procesos ETL en SSIS para cargar la información en la nueva base de datos.',
      'Normalizamos la información y trasladamos los cálculos existentes a la nueva base de datos.',
      'Desarrollamos reportes en SQL.',
    ],
    result:
      'El proceso completo de cruce de información pasó de cerca de 12 horas a 30 minutos, con la información centralizada y normalizada en una base de datos propia y los cálculos históricos preservados.',
    authorization: 'anonimo',
  },
  {
    _id: 'fallback-project-aplicacion-web-captura-documentos',
    title: 'Desarrollo de una aplicación web para la captura de documentos digitalizados',
    slug: { current: 'aplicacion-web-captura-documentos' },
    order: 14,
    client: 'Empresa de BPO',
    sector: 'seguros',
    category: 'software-a-la-medida',
    serviceLabel: 'Desarrollo de software a la medida',
    serviceAnchor: 'desarrollo-software-a-la-medida',
    technologies: 'PHP, PostgreSQL',
    challenge:
      'Permitir al área usuaria visualizar y capturar rápidamente la información de los documentos de sus clientes.',
    whatWeDid: [
      'Desarrollamos a la medida una aplicación web para visualizar los documentos digitalizados y capturar su información.',
      'Incluimos la asignación de lotes de documentos a los digitadores.',
      'Desarrollamos informes para enviar al cliente.',
    ],
    result:
      'Captura ágil de la información de los documentos, con el trabajo distribuido por lotes entre los digitadores e informes listos para el cliente.',
    authorization: 'anonimo',
  },
];
