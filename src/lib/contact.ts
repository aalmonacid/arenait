/**
 * Datos de contacto directo confirmados por el cliente. Fuente única para el
 * botón flotante, la página de contacto y el aviso de error del formulario.
 *
 * Número real de Andrés Arenas (Gerente), tomado de la firma de correo del
 * tablero de marca (`Tablero de Marca ArenaIT.pdf`, p. 5) y confirmado por el
 * cliente el 2026-09-04 — la tarjeta de presentación en la misma página
 * mostraba un dígito distinto (...6998), así que no se asumió cuál era el
 * correcto sin confirmación.
 */
const PHONE_INTERNATIONAL = '573002156898';
const PREFILLED_MESSAGE = 'Hola, quiero saber más sobre los servicios de Arena IT.';

/** Enlace de WhatsApp con mensaje prellenado (los datos pueden venir de los ajustes del sitio en Sanity). */
export function buildWhatsappUrl(
  phoneInternational: string = PHONE_INTERNATIONAL,
  message: string = PREFILLED_MESSAGE,
): string {
  return `https://wa.me/${phoneInternational.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_URL = buildWhatsappUrl();
