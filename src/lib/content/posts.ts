/**
 * Respaldo del blog: los artículos publicados antes de pasar a Sanity, con el
 * mismo texto. Se usan cuando Sanity no tiene ningún artículo completo (regla
 * «todo o nada», ver contentRules.ts) y los carga `scripts/seed-content.mjs`.
 * La URL de cada artículo es `/blog/<slug>`.
 *
 * Importante para el script de carga: solo `import type` y extensión `.ts`.
 */
import type { PostSchema } from '../../types/sanity';
import { pt } from './ptBuilder.ts';

export const fallbackPosts: PostSchema[] = [
  {
    _id: 'post-desarrollo-a-la-medida-vs-erp-saas-generico',
    title: 'Desarrollo a la medida vs. ERP/SaaS genérico: cómo decidir',
    slug: { current: 'desarrollo-a-la-medida-vs-erp-saas-generico' },
    description:
      'Un ERP o SaaS genérico no siempre es la opción rápida y barata que parece, y el desarrollo a la medida no siempre es la respuesta correcta. Una guía práctica para decidir con criterios, no con moda.',
    publishDate: '2026-09-04',
    author: 'Equipo Arena IT',
    tags: ['desarrollo a la medida', 'ERP', 'decisiones de TI'],
    body: pt([
      [
        'p',
        'Tarde o temprano, toda empresa que crece llega a la misma pregunta: ¿compramos una solución ya hecha o construimos la nuestra? La respuesta que se da con más frecuencia — “empieza con un SaaS, es más rápido y barato” — es cierta a veces, y falsa otras. Depende de qué proceso estás resolviendo y de cuánto se parece tu operación a la de una empresa promedio de tu sector.',
      ],
      ['h2', 'Lo que un ERP o SaaS genérico sí resuelve bien'],
      [
        'p',
        'No hay que pelear con esto: para procesos estándar — contabilidad, nómina, facturación electrónica, CRM básico — un producto genérico bien elegido es casi siempre la decisión correcta. La razón es simple: esos procesos ya fueron resueltos miles de veces por otras empresas antes que la tuya, y el proveedor del SaaS ha invertido años puliendo esos flujos. Además, obtienes implementación rápida, soporte estandarizado, actualizaciones incluidas y una curva de aprendizaje que tu equipo puede resolver con documentación pública, sin depender de que una sola persona entienda el sistema.',
      ],
      ['h2', 'Dónde empieza a fallar'],
      [
        'p',
        'El problema aparece cuando el proceso que quieres resolver **no es estándar** — es la forma particular en que tu empresa opera, y esa forma es justamente lo que te diferencia de la competencia. Ahí, el software genérico obliga a elegir entre dos caminos, ambos incómodos: adaptar tu proceso al software (renunciando a lo que hacías bien) o personalizar el software hasta un punto en que deja de ser “genérico” — y empiezas a pagar por licencias, por consultoría de personalización, y por actualizaciones que rompen tus customizaciones cada cierto tiempo.',
      ],
      [
        'p',
        'Otra señal común: terminas pagando por módulos que no usas porque vienen empaquetados, o descubres que la integración entre el SaaS y el resto de tus sistemas (el sistema de producción, el de logística, el que ya construiste hace años) requiere un desarrollo aparte de todas formas. En ese punto, el argumento de “es más barato” empieza a debilitarse: no estás comparando “SaaS” contra “a la medida”, estás comparando “SaaS + personalización + integraciones + licencias recurrentes por usuario” contra un sistema propio.',
      ],
      ['h2', 'Cuándo el desarrollo a la medida tiene sentido'],
      ['p', 'El desarrollo a la medida rinde cuando se cumple al menos una de estas condiciones:'],
      [
        'ul',
        [
          '**El proceso es tu ventaja competitiva.** Si la forma en que gestionas producción, inventario, o atención es parte de por qué tus clientes te eligen a ti y no a otro, forzar ese proceso dentro de un molde genérico diluye justamente lo que te diferencia.',
          '**La integración es el problema real**, no una funcionalidad puntual. Cuando ya operas con varios sistemas y lo que necesitas es que hablen entre sí de forma confiable, un desarrollo propio — o una implementación bien hecha, ver más abajo — suele ser más sostenible que forzar un SaaS a jugar de intermediario.',
          '**La escala o el tipo de operación no calza** en los supuestos del producto genérico. Esto es frecuente en sectores con procesos especializados (agroindustria, manufactura, operación logística con reglas propias) donde el SaaS “para todos” simplemente no modela bien lo que pasa en campo.',
          '**Quieres control total sobre tus datos y tu arquitectura**, sin depender de que un proveedor externo decida cambiar precios, dejar de dar soporte a un módulo, o migrar su plataforma sin avisarte con tiempo suficiente.',
        ],
      ],
      ['h2', 'Un marco simple para decidir'],
      [
        'p',
        'Antes de comprometerte con cualquiera de los dos caminos, vale la pena responder tres preguntas con honestidad:',
      ],
      [
        'ol',
        [
          '**¿El proceso que quiero resolver es el mismo que resuelve cualquier empresa de mi sector, o es distinto porque así opero yo?** Si es lo primero, el SaaS gana casi siempre.',
          '**¿Cuánto voy a tener que personalizar el SaaS para que funcione como necesito?** Si la respuesta es “bastante”, calcula el costo total (licencias + personalización + mantenimiento de esas personalizaciones), no solo el precio de la licencia.',
          '**¿Qué pasa si el proveedor cambia las reglas?** Sube el precio, descontinúa el módulo que usas, o cambia su API. Si esa dependencia es un riesgo que tu negocio no puede absorber, es una razón real a favor de construir algo propio.',
        ],
      ],
      ['h2', 'La respuesta honesta no siempre es “construyamos algo nuevo”'],
      [
        'p',
        'Vale la pena decirlo con claridad: no toda necesidad de tecnología se resuelve mejor con desarrollo a la medida. Parte de lo que hacemos en Arena IT es justamente **implementación de aplicaciones** — poner en marcha bien una solución que tu empresa ya eligió o que evaluamos juntos, cuidando que la transición no interrumpa tu operación diaria. A veces la decisión correcta es un SaaS bien implementado y bien integrado; otras veces es un sistema construido desde cero para tu operación. La diferencia la marca el proceso que estás resolviendo, no la moda del momento — y esa es la conversación que vale la pena tener antes de firmar cualquier contrato.',
      ],
    ]),
  },
  {
    _id: 'post-senales-sistema-necesita-mantenimiento-no-rewrite',
    title: 'Señales de que tu sistema necesita evolución, no un rewrite completo',
    slug: { current: 'senales-sistema-necesita-mantenimiento-no-rewrite' },
    description:
      'Cuando un sistema empieza a doler, la reacción instintiva es reescribirlo desde cero. Casi nunca es la decisión correcta. Cómo distinguir un problema de mantenimiento de uno que sí justifica empezar de nuevo.',
    publishDate: '2026-09-04',
    author: 'Equipo Arena IT',
    tags: ['mantenimiento', 'migración de software', 'sistemas legados'],
    body: pt([
      [
        'p',
        'Hay un momento en la vida de casi todo sistema en el que alguien en la empresa dice: “esto ya no da más, hay que reescribirlo desde cero”. A veces tiene razón. La mayoría de las veces, no. Confundir un problema de mantenimiento con uno que exige un rewrite completo es una de las decisiones más caras que puede tomar un área de TI, porque un rewrite total no solo cuesta en desarrollo: cuesta en el tiempo que el equipo deja de construir funcionalidad nueva mientras reconstruye lo que ya existía, y en el riesgo de que el sistema nuevo tarde más de lo previsto en llegar al nivel de confiabilidad del que reemplaza.',
      ],
      ['h2', 'Por qué la reacción instintiva suele ser la equivocada'],
      [
        'p',
        'Un sistema que lleva años en producción, aunque se sienta “viejo”, tiene algo que un sistema nuevo no tiene el primer día: conocimiento acumulado sobre casos borde, reglas de negocio que se fueron ajustando con la operación real, e integraciones que ya funcionan aunque no se vean elegantes en el código. Reescribir desde cero significa, en la práctica, volver a descubrir todo ese conocimiento — incluyendo las reglas que nadie documentó porque “todo el mundo las sabía” — mientras el sistema viejo sigue operando en paralelo o, peor, se apaga antes de que el nuevo esté listo del todo.',
      ],
      [
        'p',
        'Eso no significa que nunca haya que reescribir. Significa que la decisión debe tomarse mirando dónde está realmente el dolor, no la sensación general de que “esto se ve anticuado”.',
      ],
      ['h2', 'Señales de que el camino correcto es mantenimiento y evolución incremental'],
      [
        'ul',
        [
          '**Los problemas están concentrados, no distribuidos.** Si los errores, la lentitud o los bugs se repiten en un módulo o un flujo específico, y el resto del sistema funciona de forma estable, el problema es local — se resuelve interviniendo esa parte, no todo el sistema.',
          '**El negocio sigue validando el proceso, solo cambió (o envejeció) la tecnología.** Si la forma en que el sistema modela tu operación sigue siendo correcta y lo que falla es la capa técnica — una versión desactualizada, una dependencia sin soporte, una base de datos que no escala — el problema es de actualización, no de diseño.',
          '**Se puede aislar y reemplazar por partes.** Cuando es posible identificar un módulo, migrarlo o reconstruirlo, y conectarlo de vuelta al resto del sistema sin parar toda la operación, tienes una ruta de migración gradual disponible — que casi siempre es menos riesgosa que un reemplazo total de un solo golpe.',
          '**El costo real es de rendimiento o de deuda técnica acumulada**, no de arquitectura rota. Código que necesita refactorización, pruebas que faltan, o procesos manuales que deberían automatizarse son señales de que el sistema necesita inversión sostenida, no una demolición.',
        ],
      ],
      ['h2', 'Señales de que sí vale la pena evaluar un rewrite (o una migración profunda)'],
      [
        'ul',
        [
          '**La arquitectura impide cualquier cambio sin romper otra cosa.** Si cada modificación pequeña obliga a tocar partes no relacionadas del sistema y el riesgo de romper algo en producción es constante, el problema ya no es puntual: es estructural.',
          '**La tecnología base ya no tiene soporte ni comunidad activa.** Un lenguaje, framework o motor de base de datos sin actualizaciones de seguridad ni gente disponible en el mercado que sepa mantenerlo es un riesgo que crece con el tiempo, no que se estabiliza.',
          '**El modelo de datos ya no refleja cómo opera el negocio hoy.** Cuando la operación cambió de fondo — nuevas líneas de negocio, procesos que ya no se parecen a los que existían cuando se diseñó el sistema — y el sistema actual solo puede simular esos cambios con parches sobre parches, ahí sí conviene evaluar rediseñar, aunque no necesariamente reescribir todo de un solo golpe.',
        ],
      ],
      ['h2', 'Cómo decidir en la práctica'],
      [
        'p',
        'Antes de comprometerse con cualquiera de los dos caminos, lo primero es una auditoría técnica honesta: qué partes del sistema realmente duelen (generan incidentes, bloquean features, consumen soporte) y cuáles solo “se ven viejas” pero funcionan bien. Esa distinción cambia por completo el alcance del proyecto — y en muchos casos reduce lo que parecía un rewrite de meses a una migración por etapas de partes concretas.',
      ],
      [
        'p',
        'El mantenimiento continuo, además, es la mejor forma de no llegar nunca a la pregunta del rewrite forzado: un sistema al que se le da seguimiento — actualizaciones de versión, corrección de deuda técnica antes de que se acumule, migración de las partes que van quedando obsoletas — rara vez llega al punto en que la única opción viable es empezar de cero. Es, literalmente, la diferencia entre construir un sistema que evoluciona con tu negocio y uno que un día deja de poder acompañarlo.',
      ],
    ]),
  },
];
