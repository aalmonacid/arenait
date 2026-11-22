import type { AboutPage } from '../../types/sanity';

/** Respaldo de /nosotros (documento `aboutPage` en Sanity). */
export const fallbackAboutPage: AboutPage = {
  seoTitle: 'Quiénes somos',
  seoDescription:
    'Arena IT es una empresa colombiana de tecnología. Desde 2013 desarrollamos software a la medida, procesos en Bizagi e inteligencia artificial.',

  heroEyebrow: 'Nosotros',
  heroTitle: 'Tecnología que funciona en la operación diaria.',
  heroIntro:
    'Arena IT es una empresa colombiana de tecnología. Desde 2013 diseñamos, construimos y operamos soluciones a la medida, automatizamos procesos en Bizagi e incorporamos inteligencia artificial para organizaciones públicas y privadas.',

  whoTitle: 'Del diseño de la solución a su operación en producción.',
  whoParagraphs: [
    'Acompañamos a nuestros clientes desde el diagnóstico hasta el mantenimiento de sus aplicaciones, con un enfoque en que el software funcione para la operación diaria y no solo en la demo.',
    'Trabajamos como equipo de proyecto, como célula dedicada o reforzando a los equipos internos y a los proveedores principales de nuestros clientes.',
  ],

  missionVisionTitle: 'Hacia dónde trabajamos.',
  mission:
    'Diseñar, construir y operar soluciones de software, automatización e inteligencia artificial que resuelvan problemas reales de la operación de nuestros clientes, con calidad, seguridad y control.',
  vision:
    'Ser el aliado tecnológico de referencia para las organizaciones públicas y privadas que necesitan software a la medida, automatización de procesos e inteligencia artificial con resultados medibles.',

  principlesTitle: 'Cuatro principios en cada proyecto.',
  principles: [
    {
      title: 'La operación primero',
      text: 'Una solución vale cuando funciona en el día a día de tu equipo, no solo en la presentación.',
    },
    {
      title: 'IA con control humano',
      text: 'Aplicamos inteligencia artificial donde genera valor medible, con aprobación humana en las acciones críticas.',
    },
    {
      title: 'Especialización en Bizagi',
      text: 'Contamos con profesionales certificados en Bizagi para implementar, soportar y migrar tus procesos.',
    },
    {
      title: 'Trabajo junto a tu equipo',
      text: 'Complementamos a tus equipos internos y a tus proveedores principales en iniciativas específicas.',
    },
  ],

  sectorsTitle: 'Experiencia en sectores donde la operación no puede detenerse.',

  closingTitle: 'Hablemos de tu proyecto.',
  closingLinks: [
    { label: 'Cuéntanos tu reto', href: '/contacto' },
    { label: 'Ver proyectos', href: '/proyectos' },
  ],
};
