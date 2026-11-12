import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkRateLimit } from './rateLimit';

// El Map interno persiste entre pruebas, así que cada prueba usa su propia clave.
let n = 0;
const key = () => `ip-test-${n++}`;

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-12T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('permite hasta el máximo y bloquea la siguiente solicitud', () => {
    const k = key();
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(k).limited).toBe(false);
    }
    const sixth = checkRateLimit(k);
    expect(sixth.limited).toBe(true);
    expect(sixth.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('no mezcla claves distintas', () => {
    const a = key();
    const b = key();
    for (let i = 0; i < 5; i++) checkRateLimit(a);
    expect(checkRateLimit(a).limited).toBe(true);
    expect(checkRateLimit(b).limited).toBe(false);
  });

  it('libera la clave cuando la ventana vence', () => {
    const k = key();
    for (let i = 0; i < 5; i++) checkRateLimit(k);
    expect(checkRateLimit(k).limited).toBe(true);

    vi.advanceTimersByTime(10 * 60 * 1000 + 1);
    expect(checkRateLimit(k).limited).toBe(false);
  });

  it('Retry-After refleja el tiempo restante hasta que salga la solicitud más antigua', () => {
    const k = key();
    for (let i = 0; i < 5; i++) checkRateLimit(k);
    vi.advanceTimersByTime(4 * 60 * 1000);
    const result = checkRateLimit(k);
    expect(result.limited).toBe(true);
    expect(result.retryAfterSeconds).toBe(6 * 60);
  });

  it('un cliente bloqueado que reintenta no extiende su propio castigo', () => {
    const k = key();
    for (let i = 0; i < 5; i++) checkRateLimit(k);
    for (let i = 0; i < 20; i++) checkRateLimit(k); // intentos bloqueados
    vi.advanceTimersByTime(10 * 60 * 1000 + 1);
    expect(checkRateLimit(k).limited).toBe(false);
  });

  it('respeta opciones personalizadas', () => {
    const k = key();
    expect(checkRateLimit(k, { maxRequests: 1, windowMs: 1000 }).limited).toBe(false);
    expect(checkRateLimit(k, { maxRequests: 1, windowMs: 1000 }).limited).toBe(true);
    vi.advanceTimersByTime(1001);
    expect(checkRateLimit(k, { maxRequests: 1, windowMs: 1000 }).limited).toBe(false);
  });
});
