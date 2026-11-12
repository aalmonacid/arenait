import { describe, expect, it, vi } from 'vitest';
import { buildNotificationText, notifyNewLead } from './leadNotify';
import type { Lead } from './leadValidation';

const lead: Lead = {
  fullName: 'Ana Pérez',
  company: 'Empresa SAS',
  corporateEmail: 'ana@empresa.com',
  phone: '3001234567',
  serviceOfInterest: 'Business Intelligence',
  message: 'Texto privado del visitante',
  source: 'lead-capture-form',
  policyAccepted: true,
  policyVersion: '2026-09-04',
};

describe('buildNotificationText', () => {
  it('incluye empresa, servicio y enlace al Studio', () => {
    const text = buildNotificationText(lead, 'https://dev.arenait.co/admin');
    expect(text).toContain('Empresa SAS');
    expect(text).toContain('Business Intelligence');
    expect(text).toContain('https://dev.arenait.co/admin');
  });

  it('NO incluye datos personales del visitante', () => {
    const text = buildNotificationText(lead, 'https://dev.arenait.co/admin');
    for (const secret of ['Ana', 'ana@empresa.com', '3001234567', 'Texto privado']) {
      expect(text).not.toContain(secret);
    }
  });

  it('tiene textos de respaldo cuando faltan empresa o servicio', () => {
    const text = buildNotificationText({ ...lead, company: '', serviceOfInterest: '' }, 'x');
    expect(text).toContain('sin empresa indicada');
    expect(text).toContain('sin servicio indicado');
  });
});

describe('notifyNewLead', () => {
  it('no hace nada sin URL de webhook', async () => {
    const fetchMock = vi.fn();
    expect(await notifyNewLead(undefined, lead, 'x', fetchMock)).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('envía un POST JSON al webhook', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    const ok = await notifyNewLead('https://hooks.example/abc', lead, 'https://x/admin', fetchMock);
    expect(ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://hooks.example/abc');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body).text).toContain('Empresa SAS');
  });

  it('devuelve false sin lanzar si el webhook responde con error', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    expect(await notifyNewLead('https://hooks.example/abc', lead, 'x', fetchMock)).toBe(false);
  });

  it('devuelve false sin lanzar si la red falla', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchMock = vi.fn().mockRejectedValue(new Error('timeout'));
    expect(await notifyNewLead('https://hooks.example/abc', lead, 'x', fetchMock)).toBe(false);
    spy.mockRestore();
  });
});
