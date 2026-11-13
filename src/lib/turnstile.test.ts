import { describe, expect, it, vi } from 'vitest';
import { verifyTurnstile } from './turnstile';

const okJson = (success: boolean) =>
  vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success }) });

describe('verifyTurnstile', () => {
  it('rechaza un token vacío sin llamar a Cloudflare', async () => {
    const f = vi.fn();
    expect(await verifyTurnstile('secret', '', '1.2.3.4', f)).toBe(false);
    expect(f).not.toHaveBeenCalled();
  });

  it('acepta cuando Cloudflare responde success:true y envía secreto, token e IP', async () => {
    const f = okJson(true);
    expect(await verifyTurnstile('S', 'T', '1.2.3.4', f)).toBe(true);
    const [url, init] = f.mock.calls[0];
    expect(url).toContain('challenges.cloudflare.com/turnstile/v0/siteverify');
    const body = init.body as URLSearchParams;
    expect(body.get('secret')).toBe('S');
    expect(body.get('response')).toBe('T');
    expect(body.get('remoteip')).toBe('1.2.3.4');
  });

  it('no envía la IP cuando es desconocida', async () => {
    const f = okJson(true);
    await verifyTurnstile('S', 'T', 'unknown', f);
    expect((f.mock.calls[0][1].body as URLSearchParams).has('remoteip')).toBe(false);
  });

  it('rechaza si Cloudflare dice success:false', async () => {
    expect(await verifyTurnstile('S', 'T', undefined, okJson(false))).toBe(false);
  });

  it('falla cerrado ante error HTTP, JSON inválido o red caída', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const httpError = vi.fn().mockResolvedValue({ ok: false });
    const badJson = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error('x');
      },
    });
    const down = vi.fn().mockRejectedValue(new Error('red'));
    expect(await verifyTurnstile('S', 'T', undefined, httpError)).toBe(false);
    expect(await verifyTurnstile('S', 'T', undefined, badJson)).toBe(false);
    expect(await verifyTurnstile('S', 'T', undefined, down)).toBe(false);
    spy.mockRestore();
  });
});
