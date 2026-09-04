/**
 * Rate limiting básico en memoria, por clave (normalmente IP), para endpoints
 * expuestos públicamente como `/api/leads`.
 *
 * LIMITACIÓN REAL — leer antes de confiar en esto como protección fuerte:
 * Este proyecto corre `/api/leads` como función serverless de Vercel
 * (`prerender = false`, sin Edge Runtime ni Redis/Upstash ni ningún store
 * externo — ver CONTEXT.md §3). El `Map` de abajo vive en memoria del
 * proceso de la función:
 *   - Se reinicia en cada cold start (Vercel puede crear una instancia nueva
 *     en cualquier momento, especialmente tras inactividad).
 *   - NO se comparte entre instancias concurrentes: si Vercel escala a N
 *     instancias en paralelo, un atacante distribuido en el tiempo/carga
 *     puede terminar con hasta N * MAX_REQUESTS solicitudes efectivas.
 * Esto es "best-effort": frena un bot simple que golpea el endpoint en ráfaga
 * contra una misma instancia caliente, pero NO es una defensa robusta contra
 * abuso distribuido o sostenido. Si el volumen de spam lo justifica (ver
 * BACKLOG.md, Épica D/J), la solución real es un store externo compartido
 * (Upstash Redis, Vercel KV, etc.) — evaluar en ese momento, no antes.
 */

interface RateLimitOptions {
  /** Máximo de solicitudes permitidas dentro de la ventana. */
  maxRequests: number;
  /** Duración de la ventana deslizante, en milisegundos. */
  windowMs: number;
}

export interface RateLimitResult {
  limited: boolean;
  /** Segundos sugeridos para el header `Retry-After` cuando `limited` es true. */
  retryAfterSeconds: number;
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  maxRequests: 5,
  windowMs: 10 * 60 * 1000, // 10 minutos
};

// key -> timestamps (ms epoch) de solicitudes dentro de la ventana actual.
const hits = new Map<string, number[]>();

/**
 * Registra una solicitud para `key` y evalúa si debe limitarse, usando una
 * ventana deslizante: se cuentan las solicitudes de esa clave en los últimos
 * `windowMs` milisegundos.
 *
 * No hay limpieza periódica en segundo plano (no hay `setInterval` en un
 * entorno serverless de ejecución corta) — la limpieza de entradas viejas
 * ocurre de forma perezosa, en cada llamada, sobre la clave consultada.
 */
export function checkRateLimit(
  key: string,
  options: Partial<RateLimitOptions> = {},
): RateLimitResult {
  const { maxRequests, windowMs } = { ...DEFAULT_OPTIONS, ...options };
  const now = Date.now();
  const windowStart = now - windowMs;

  const existing = hits.get(key) ?? [];
  const recent = existing.filter((timestamp) => timestamp > windowStart);

  if (recent.length >= maxRequests) {
    const oldestInWindow = recent[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldestInWindow + windowMs - now) / 1000));
    // No agregamos este intento fallido a la ventana: un cliente bloqueado
    // que reintenta no debe extender su propio castigo indefinidamente.
    hits.set(key, recent);
    return { limited: true, retryAfterSeconds };
  }

  recent.push(now);
  hits.set(key, recent);
  return { limited: false, retryAfterSeconds: 0 };
}
