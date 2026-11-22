import type { ServiceSchema } from '../../types/sanity';

/**
 * Respaldo de los 13 servicios (documentos `service` en Sanity), organizados en
 * tres pilares. El `slug` es el ancla de /servicios y el valor de
 * `/contacto?servicio=`. Texto acordado con el cliente (SiteBenchmark,
 * 22/11/2026). El `summary` es la primera oración de «Qué hacemos», sin enlaces.
 *
 * Íconos: solo el set del tablero de marca (`src/components/Icon.astro`).
 */
export const fallbackServices: ServiceSchema[] = [
  // ---------- 01 · Construimos ----------
  {
    _id: 'fallback-desarrollo-software-a-la-medida',
    title: 'Desarrollo de software a la medida',
    slug: { current: 'desarrollo-software-a-la-medida' },
    pillar: 'construimos',
    order: 1,
    featured: false,
    icon: 'code',
    summary:
      'Diseñamos y desarrollamos aplicaciones web, móviles y portales transaccionales a partir de cómo opera realmente tu empresa.',
    whenNeeded:
      'Tus procesos críticos dependen de hojas de cálculo, de sistemas que no se comunican entre sí o de herramientas que obligan a tu equipo a trabajar alrededor de ellas.',
    whatWeDo:
      'Diseñamos y desarrollamos aplicaciones web, móviles y portales transaccionales a partir de cómo opera realmente tu empresa.',
    deliverables: [
      'Arquitectura documentada y aprobada antes de construir',
      'Entregas incrementales con avance visible en cada sprint',
      'Documentación y despliegue en tu infraestructura o en la nube',
      'Pruebas automatizadas desde el inicio',
    ],
  },
  {
    _id: 'fallback-integracion-automatizacion-procesos',
    title: 'Integración y automatización de procesos',
    slug: { current: 'integracion-automatizacion-procesos' },
    pillar: 'construimos',
    order: 2,
    featured: false,
    icon: 'deploy',
    summary:
      'Conectamos tus sistemas mediante APIs y servicios de integración, y automatizamos flujos de trabajo de principio a fin.',
    whenNeeded:
      'La información se digita dos veces, tus sistemas (ERP, CRM, core y plataformas de terceros) no se comunican y los procesos dependen de pasos manuales.',
    whatWeDo:
      'Conectamos tus sistemas mediante APIs y servicios de integración, y automatizamos flujos de trabajo de principio a fin, con desarrollo a la medida o sobre plataformas de procesos como [Bizagi](#bizagi).',
    deliverables: [
      'Mapa de integraciones y flujos actuales y objetivo',
      'APIs e integraciones documentadas, monitoreadas y seguras',
      'Automatización de tareas repetitivas con trazabilidad de cada paso',
    ],
  },
  {
    _id: 'fallback-modernizacion-migracion-sistemas',
    title: 'Modernización y migración de sistemas legados',
    slug: { current: 'modernizacion-migracion-sistemas' },
    pillar: 'construimos',
    order: 3,
    featured: false,
    icon: 'refresh',
    summary: 'Modernizamos o migramos aplicaciones por etapas, sin detener la operación diaria.',
    whenNeeded:
      'Un sistema crítico funciona, pero es costoso de mantener, difícil de cambiar o depende de tecnología sin soporte.',
    whatWeDo: 'Modernizamos o migramos aplicaciones por etapas, sin detener la operación diaria.',
    deliverables: [
      'Diagnóstico técnico del sistema actual y ruta de modernización por fases',
      'Migración de datos validada y plan de reversión',
      'Convivencia controlada entre el sistema anterior y el nuevo durante la transición',
    ],
  },
  {
    _id: 'fallback-bizagi',
    title: 'Automatización de procesos con Bizagi',
    slug: { current: 'bizagi' },
    pillar: 'construimos',
    order: 4,
    featured: false,
    icon: 'tasks',
    seoHeading: 'Implementación y desarrollo en Bizagi',
    summary:
      'Modelamos, automatizamos e implementamos procesos en Bizagi, y los integramos con tus sistemas (ERP, CRM, core y aplicaciones propias).',
    whenNeeded:
      'Tus procesos de negocio (aprobaciones, solicitudes, radicaciones, gestión de casos) dependen de correos, formatos y seguimiento manual, o ya tienes Bizagi y necesitas sacarle más provecho.',
    whatWeDo:
      'Modelamos, automatizamos e implementamos procesos en Bizagi, y los integramos con tus sistemas (ERP, CRM, core y aplicaciones propias). También damos soporte a tu plataforma Bizagi y la migramos a nuevas versiones. Contamos con profesionales certificados en Bizagi.',
    deliverables: [
      'Levantamiento y modelado de procesos (BPMN) validado con las áreas responsables',
      'Procesos automatizados en Bizagi con reglas de negocio, formularios e indicadores',
      'Integraciones con tus sistemas mediante servicios y APIs',
      'Soporte de la plataforma y de los procesos implementados',
      'Migración de versiones de Bizagi',
    ],
    aiTitle: 'IA en tus procesos Bizagi',
    aiCapabilities: [
      'Clasificación de solicitudes y casos para enrutarlos automáticamente al área o flujo correspondiente',
      'Extracción de información de documentos (formularios, soportes, PDF) para prellenar los datos del caso',
      'Asistencia en decisiones con resúmenes, análisis y recomendaciones dentro de las tareas, con validación humana',
      'Agentes y asistentes conversacionales que consultan información y ejecutan acciones sobre los procesos',
    ],
    aiNote:
      'Implementamos estas capacidades con las funciones de IA de la plataforma Bizagi (AI Agents, AI Workers, Ask Ada) o, si tu versión no las incluye, integrando servicios de IA mediante conectores y APIs.',
    experience:
      'Implementación, soporte, desempeño, migración y carga de datos en proyectos Bizagi para aseguradoras, entidades financieras y entidades públicas. [Ver proyectos →](/proyectos?servicio=bizagi)',
    typicalCases:
      'Solicitudes y aprobaciones internas, vinculación de clientes y proveedores, gestión de PQRS, radicación y trámite de reclamaciones, y flujos de compras.',
  },

  // ---------- 02 · Aplicamos IA ----------
  {
    _id: 'fallback-business-intelligence-analitica',
    title: 'Business Intelligence y analítica',
    slug: { current: 'business-intelligence-analitica' },
    pillar: 'aplicamos-ia',
    order: 5,
    featured: false,
    icon: 'chart',
    summary:
      'Convertimos los datos que ya genera tu operación en indicadores confiables y tableros útiles.',
    whenNeeded:
      'Tienes datos en muchos sistemas, pero los reportes llegan tarde, no coinciden entre áreas o terminan en tableros que nadie abre.',
    whatWeDo:
      'Convertimos los datos que ya genera tu operación en indicadores confiables y tableros útiles. Cuando aporta valor, incorporamos consultas en lenguaje natural para que los usuarios de negocio pregunten directamente a sus datos.',
    deliverables: [
      'Consolidación de datos de distintas fuentes',
      'Modelo de datos e indicadores acordados con las áreas usuarias',
      'Tableros con fuentes trazables y actualización automática',
    ],
  },
  {
    _id: 'fallback-automatizacion-documental-ia',
    title: 'Automatización documental con IA',
    slug: { current: 'automatizacion-documental-ia' },
    pillar: 'aplicamos-ia',
    order: 6,
    featured: false,
    icon: 'shield-check',
    summary:
      'Aplicamos IA para clasificar documentos, extraer su información y validarla contra tus reglas de negocio, con revisión humana en los casos que lo requieren.',
    whenNeeded:
      'Tu equipo lee, digita y valida a mano facturas, pedidos, formularios, contratos, pólizas, manifiestos, soportes o solicitudes.',
    whatWeDo:
      'Aplicamos IA para clasificar documentos, extraer su información y validarla contra tus reglas de negocio, con revisión humana en los casos que lo requieren.',
    deliverables: [
      'Extracción y validación automática de datos hacia tus sistemas',
      'Revisión humana para los casos con menor nivel de confianza',
      'Trazabilidad de cada documento procesado',
      'Medición de exactitud por campo y de horas de trabajo liberadas',
    ],
  },
  {
    _id: 'fallback-asistentes-ia',
    title: 'Asistentes de IA sobre tu información',
    slug: { current: 'asistentes-ia' },
    pillar: 'aplicamos-ia',
    order: 7,
    featured: false,
    icon: 'wrench',
    summary:
      'Construimos asistentes que responden con base en la información de tu empresa, integrados a Teams, WhatsApp o a tu portal web.',
    whenNeeded:
      'El conocimiento de tu empresa está repartido en documentos, correos, políticas y en la experiencia de pocas personas.',
    whatWeDo:
      'Construimos asistentes que responden con base en la información de tu empresa, integrados a Teams, WhatsApp o a tu portal web.',
    deliverables: [
      'Respuestas con referencia a la fuente',
      'Permisos de acceso según el rol de cada usuario',
      'Evaluación de la calidad de las respuestas con preguntas reales de tu operación',
    ],
  },
  {
    _id: 'fallback-agentes-ia',
    title: 'Agentes de IA que ejecutan tareas',
    slug: { current: 'agentes-ia' },
    pillar: 'aplicamos-ia',
    order: 8,
    featured: false,
    icon: 'deploy',
    summary:
      'Construimos agentes que consultan tus sistemas (ERP, CRM, bases de datos) y ejecutan acciones con aprobación humana en los pasos críticos.',
    whenNeeded: 'Tu equipo debe entrar a varios sistemas para completar tareas repetitivas.',
    whatWeDo:
      'Construimos agentes que consultan tus sistemas (ERP, CRM, bases de datos) y ejecutan acciones con aprobación humana en los pasos críticos.',
    deliverables: [
      'Integración con tus sistemas mediante APIs',
      'Aprobación humana en acciones críticas',
      'Registro de auditoría de cada acción',
      'Medición de las tareas completadas',
    ],
  },
  {
    _id: 'fallback-modelos-predictivos',
    title: 'Modelos predictivos',
    slug: { current: 'modelos-predictivos' },
    pillar: 'aplicamos-ia',
    order: 9,
    featured: false,
    icon: 'chart',
    summary:
      'Desarrollamos modelos de machine learning a partir de tus datos históricos y los integramos a los procesos donde se toman las decisiones.',
    whenNeeded:
      'Quieres anticiparte a situaciones de riesgo, demanda, deserción de clientes, fallas, fraude o cartera, en lugar de reaccionar a ellas.',
    whatWeDo:
      'Desarrollamos modelos de machine learning a partir de tus datos históricos y los integramos a los procesos donde se toman las decisiones.',
    deliverables: [
      'Evaluación de calidad y suficiencia de los datos antes de construir',
      'Modelo validado con métricas de desempeño acordadas',
      'Monitoreo del modelo en producción para detectar pérdida de precisión',
    ],
  },
  {
    _id: 'fallback-integracion-ia-sistemas',
    title: 'IA integrada a tus sistemas actuales',
    slug: { current: 'integracion-ia-sistemas' },
    pillar: 'aplicamos-ia',
    order: 10,
    featured: false,
    icon: 'code',
    summary:
      'Incorporamos capacidades de IA (resúmenes, clasificación, búsqueda inteligente, recomendaciones y asistentes) dentro del software que ya usas, sea propio o desarrollado por nosotros.',
    whenNeeded:
      'No quieres un sistema nuevo, sino que tus aplicaciones actuales sean más inteligentes.',
    whatWeDo:
      'Incorporamos capacidades de IA (resúmenes, clasificación, búsqueda inteligente, recomendaciones y asistentes) dentro del software que ya usas, sea propio o desarrollado por nosotros.',
    deliverables: [
      'Funcionalidades de IA integradas sin reemplazar tu plataforma',
      'Elección del modelo según tu política de datos (nube propia, proveedores corporativos o modelos privados)',
      'Medición del uso y del impacto de cada funcionalidad',
    ],
  },

  // ---------- 03 · Operamos ----------
  {
    _id: 'fallback-mantenimiento-soporte-software',
    title: 'Mantenimiento evolutivo y soporte',
    slug: { current: 'mantenimiento-soporte-software' },
    pillar: 'operamos',
    order: 11,
    featured: false,
    icon: 'wrench',
    summary:
      'Damos soporte, corregimos, actualizamos versiones y evolucionamos tus aplicaciones con tiempos de respuesta acordados.',
    whenNeeded:
      'Tus aplicaciones necesitan soporte, correcciones, actualizaciones de versión o nuevas funcionalidades, y tu equipo no tiene la capacidad para atenderlas.',
    whatWeDo:
      'Damos soporte, corregimos, actualizamos versiones y evolucionamos tus aplicaciones con tiempos de respuesta acordados.',
    deliverables: ['Acuerdos de nivel de servicio (SLA)', 'Reportes periódicos', 'Plan de evolución'],
  },
  {
    _id: 'fallback-aseguramiento-calidad-qa',
    title: 'Aseguramiento de la calidad (QA)',
    slug: { current: 'aseguramiento-calidad-qa' },
    pillar: 'operamos',
    order: 12,
    featured: false,
    icon: 'shield-check',
    summary:
      'Probamos cada entrega antes de que llegue a tus usuarios, para detectar errores en desarrollo y no en producción.',
    whenNeeded:
      'Los errores se detectan en producción, las entregas generan reprocesos o no tienes pruebas que respalden cada cambio.',
    whatWeDo:
      'Probamos cada entrega antes de que llegue a tus usuarios, para detectar errores en desarrollo y no en producción. Combinamos pruebas funcionales, automatizadas, de rendimiento y de seguridad, apoyadas en herramientas de IA para ampliar la cobertura.',
    deliverables: ['Plan de pruebas', 'Automatización de pruebas reutilizable', 'Reportes de calidad por entrega'],
  },
  {
    _id: 'fallback-outsourcing-talento-ti',
    title: 'Outsourcing de talento TI',
    slug: { current: 'outsourcing-talento-ti' },
    pillar: 'operamos',
    order: 13,
    featured: false,
    icon: 'refresh',
    seoHeading: 'Outsourcing de recursos TI y especialistas Bizagi',
    summary:
      'Ponemos a tu disposición profesionales especializados que se integran a tu equipo o a tus proyectos y trabajan bajo tu dirección.',
    whenNeeded:
      'Tu equipo necesita capacidad adicional o conocimiento especializado para un proyecto, una temporada de alta demanda o una tecnología que no maneja internamente.',
    whatWeDo:
      'Ponemos a tu disposición profesionales especializados que se integran a tu equipo o a tus proyectos y trabajan bajo tu dirección. Nos encargamos de la selección, la contratación y el acompañamiento.',
    deliverables: [
      'Profesionales seleccionados según el perfil técnico y la cultura de tu equipo',
      'Acompañamiento y seguimiento al desempeño',
      'Flexibilidad para ajustar el equipo según la etapa del proyecto',
    ],
  },
];
