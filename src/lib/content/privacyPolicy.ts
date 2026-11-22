/**
 * Respaldo de la Política de Tratamiento de Datos Personales: la versión 1.1
 * (15/11/2026) con su texto exacto, tal como estaba en la página antes de
 * pasar a Sanity. Se usa cuando Sanity no tiene ninguna versión completa
 * (regla «todo o nada», ver contentRules.ts) y la carga `scripts/seed-content.mjs`
 * como `privacyPolicy-1-1`.
 *
 * Los datos del responsable siguen sin confirmar: vacíos, la página los muestra
 * con `PendingContentTag`. No inventar valores (ver BACKLOG.md, Épica G).
 *
 * Importante para el script de carga: solo `import type` y extensión `.ts`.
 */
import type { PrivacyPolicy } from '../../types/sanity';
import { FALLBACK_POLICY_VERSION } from '../legal.ts';
import { pt } from './ptBuilder.ts';

export const fallbackPrivacyPolicies: PrivacyPolicy[] = [
  {
    _id: 'privacyPolicy-1-1',
    version: FALLBACK_POLICY_VERSION,
    effectiveDate: '2026-11-15',
    intro: pt([
      [
        'p',
        'Esta política regula el tratamiento de los datos personales recolectados a través de este sitio web (incluyendo el formulario de contacto), en cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013 de la República de Colombia.',
      ],
    ]),
    sections: [
      {
        title: '1. Responsable del tratamiento',
        showData: 'responsible',
      },
      {
        title: '2. Datos que recolectamos',
        body: pt([
          [
            'p',
            'A través del formulario de contacto de este sitio recolectamos: nombre completo, empresa, correo electrónico, teléfono (opcional), servicio de interés y el mensaje que nos escribas.',
          ],
        ]),
      },
      {
        title: '3. Finalidad del tratamiento',
        body: pt([
          [
            'p',
            'Los datos recolectados se usan exclusivamente para: (i) responder a tu solicitud de contacto, (ii) elaborar y dar seguimiento a propuestas comerciales, y (iii) mantener un registro interno de nuestras relaciones comerciales. No vendemos ni compartimos tus datos con terceros para fines distintos a los aquí descritos.',
          ],
        ]),
      },
      {
        title: '4. Derechos del titular',
        body: pt([
          ['p', 'Como titular de tus datos personales, tienes derecho a:'],
          [
            'ul',
            [
              '**Conocer** los datos personales que tratamos sobre ti.',
              '**Actualizar y rectificar** tus datos cuando sean parciales, inexactos, incompletos o estén desactualizados.',
              '**Suprimir** tus datos cuando su tratamiento no respete los principios, derechos y garantías constitucionales y legales.',
              '**Revocar la autorización** otorgada para el tratamiento de tus datos, en cualquier momento.',
            ],
          ],
        ]),
      },
      {
        title: '5. Mecanismos para ejercer tus derechos',
        body: pt([
          [
            'p',
            'Puedes ejercer cualquiera de los derechos anteriores escribiendo al siguiente canal:',
          ],
        ]),
        showData: 'rightsChannel',
      },
      {
        title: '6. Vigencia',
        body: pt([
          [
            'p',
            'Los datos personales se conservarán mientras exista una relación comercial vigente o potencial, o hasta que el titular solicite su supresión conforme a la sección anterior, lo que ocurra primero.',
          ],
        ]),
      },
      {
        title: '7. Proveedores que tratan datos por encargo',
        anchor: 'encargados',
        body: pt([
          [
            'p',
            'Para operar este sitio y atender tu solicitud usamos proveedores tecnológicos que tratan datos por cuenta nuestra y solo para esa finalidad:',
          ],
          [
            'ul',
            [
              '**Sanity**: almacenamiento de las solicitudes recibidas por el formulario.',
              '**Cloudflare**: alojamiento del sitio, protección contra tráfico abusivo y verificación anti-spam (Turnstile) al enviar el formulario.',
              '**Resend**: envío de los correos de aviso interno y de confirmación al visitante.',
            ],
          ],
          [
            'p',
            'Algunos de estos proveedores pueden almacenar o procesar datos en servidores ubicados fuera de Colombia. En ese caso la transmisión o transferencia se hace conforme a la Ley 1581 de 2012 y sus decretos reglamentarios.',
          ],
        ]),
      },
      {
        title: '8. Cookies',
        anchor: 'cookies',
        body: pt([
          [
            'p',
            'Este sitio usa únicamente cookies propias esenciales, necesarias para su funcionamiento básico (por ejemplo, recordar tu elección sobre este mismo aviso). Hoy no usamos cookies de analítica, medición ni publicidad de terceros.',
          ],
          [
            'p',
            'Si en el futuro se incorpora una herramienta de analítica u otra tecnología que use cookies no esenciales, esta sección se actualizará para describirla con precisión antes de activarla, y su uso quedará condicionado a que aceptes el aviso de cookies del sitio.',
          ],
        ]),
      },
    ],
  },
];
