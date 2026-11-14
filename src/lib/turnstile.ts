/**
 * Verificación del captcha Cloudflare Turnstile en el servidor.
 *
 * Turnstile se activa solo si existe la variable `TURNSTILE_SECRET_KEY` (y la
 * de sitio `TURNSTILE_SITE_KEY` para mostrar el widget). Sin ellas el
 * formulario sigue funcionando sin captcha, así el sitio no se rompe antes de
 * configurar las claves.
 *
 * Si la verificación no puede completarse (red caída, respuesta inválida) se
 * rechaza el envío: abrir la puerta cuando el captcha falla anularía su
 * propósito.
 */
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(
  secret: string,
  token: string,
  remoteIp?: string,
  fetchImpl: typeof fetch = fetch,
  expectedHostname?: string,
): Promise<boolean> {
  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp && remoteIp !== 'unknown') body.set('remoteip', remoteIp);

  try {
    const response = await fetchImpl(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return false;
    const data = (await response.json()) as { success?: boolean; hostname?: string };
    if (data.success !== true) return false;
    // Un token emitido para OTRO sitio (cualquier widget de Turnstile con otra
    // clave pública no pasaría, pero esto cierra el caso de claves compartidas).
    if (expectedHostname && data.hostname && data.hostname !== expectedHostname) return false;
    return true;
  } catch (error) {
    console.error('No se pudo verificar el captcha:', error);
    return false;
  }
}
