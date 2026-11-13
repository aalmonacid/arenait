/**
 * Rate limiting básico en memoria, por clave (normalmente IP), para endpoints
 * expuestos públicamente como `/api/leads`.
 *
 * LIMITACIÓN REAL — leer antes de confiar en esto como protección fuerte:
 * Este proyecto corre `/api/leads` como Worker de Cloudflare, sin store externo
 * (KV, Durable Objects, Redis) — ver CONTEXT.md §3. El `Map` de abajo vive en
 * la memoria del isolate del Worker:
 *   - Se reinicia cuando Cloudflare recicla el isolate.
 *   - NO se comparte entre isolates ni entre centros de datos: la protección
 *     real debe ser una regla de «Rate limiting» de Cloudflare sobre
 *     `/api/leads` (WAF → Rate limiting rules), que sí es global.
 * Esto es "best-effort": frena una ráfaga simple contra un mismo isolate, pero
 * NO es una defensa robusta contra abuso distribuido o sostenido.
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
