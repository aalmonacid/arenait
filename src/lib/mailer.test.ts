import { describe, expect, it, vi } from 'vitest';
import { buildCopyEmail, buildOwnerEmail, isMailConfigured, oneLine, sendEmail } from './mailer';
import type { Lead } from './leadValidation';

const lead: Lead = {
  fullName: 'Ana Pérez',
  company: 'Empresa SAS',
  corporateEmail: 'ana@empresa.com',
  phone: '3001234567',
  serviceOfInterest: 'Business Intelligence',
  message: 'Necesitamos un tablero.\nGracias',
  source: 'lead-capture-form',
  policyAccepted: true,
  policyVersion: '1.0',
};

const mail = { to: 'a@b.co', subject: 's', text: 't' };

describe('oneLine', () => {
  it('quita saltos de línea y recorta', () => {
    expect(oneLine('hola\r\nBcc: x@y.com   mundo')).toBe('hola Bcc: x@y.com mundo');
    expect(oneLine('x'.repeat(300)).length).toBe(120);
  });
});

describe('buildOwnerEmail', () => {
  it('incluye el detalle completo y responde al visitante', () => {
    const m = buildOwnerEmail(lead, 'dueno@arenait.co', 'https://dev.arenait.co/admin');
    expect(m.to).toBe('dueno@arenait.co');
    expect(m.replyTo).toBe('ana@empresa.com');
    expect(m.subject).toContain('Empresa SAS');
    for (const piece of [
      'Ana Pérez',
      'ana@empresa.com',
      '3001234567',
      'Business Intelligence',
      'Necesitamos un tablero.',
    ]) {
      expect(m.text).toContain(piece);
    }
  });

  it('el asunto nunca tiene saltos de línea aunque el nombre los traiga', () => {
    const m = buildOwnerEmail(
      { ...lead, company: '', fullName: 'Ana\nBcc: x@y.com' },
      'd@x.co',
      'u',
    );
    expect(m.subject).not.toMatch(/[\r\n]/);
  });
});

describe('buildCopyEmail', () => {
  it('va al visitante, con su mensaje y la nota de "si no fuiste tú"', () => {
    const m = buildCopyEmail(lead);
    expect(m.to).toBe('ana@empresa.com');
    expect(m.text).toContain('Necesitamos un tablero.');
    expect(m.text).toContain('Si no fuiste tú');
    expect(m.replyTo).toBeUndefined();
  });
});

describe('sendEmail', () => {
  const cfg = { apiKey: 'k', from: 'ArenaIT <contacto@arenait.co>' };

  it('no envía nada sin configuración', async () => {
    const f = vi.fn();
    expect(isMailConfigured({})).toBe(false);
    expect(await sendEmail({}, mail, f)).toBe(false);
    expect(f).not.toHaveBeenCalled();
  });

  it('envía un POST a Resend con autorización y cuerpo JSON', async () => {
    const f = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const ok = await sendEmail(cfg, { ...mail, replyTo: 'r@b.co' }, f);
    expect(ok).toBe(true);
    const [url, init] = f.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.headers.Authorization).toBe('Bearer k');
    const body = JSON.parse(init.body);
    expect(body.to).toEqual(['a@b.co']);
    expect(body.reply_to).toBe('r@b.co');
    expect(body.from).toBe(cfg.from);
  });

  it('devuelve false sin lanzar si el proveedor rechaza o la red falla', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const rejected = vi.fn().mockResolvedValue({ ok: false, status: 422 });
    const down = vi.fn().mockRejectedValue(new Error('x'));
    expect(await sendEmail(cfg, mail, rejected)).toBe(false);
    expect(await sendEmail(cfg, mail, down)).toBe(false);
    spy.mockRestore();
  });
});
