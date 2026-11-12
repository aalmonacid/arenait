import { describe, expect, it } from 'vitest';
import {
  LIMITS,
  MAX_BODY_BYTES,
  isAllowedOrigin,
  leadDocumentId,
  validateLead,
} from './leadValidation';

const valid = {
  fullName: 'Ana Pérez',
  company: 'Empresa SAS',
  corporateEmail: 'ana@empresa.com',
  phone: '3001234567',
  serviceOfInterest: 'Business Intelligence',
  message: 'Necesitamos un tablero de indicadores.',
  source: 'lead-capture-form',
  companyWebsite: '',
  policyAccepted: true,
  policyVersion: '2026-09-04',
};

describe('validateLead', () => {
  it('acepta un payload válido y lo normaliza', () => {
    const result = validateLead({ ...valid, fullName: '  Ana Pérez  ' });
    expect(result.kind).toBe('ok');
    if (result.kind === 'ok') {
      expect(result.lead.fullName).toBe('Ana Pérez');
      expect(result.lead.policyAccepted).toBe(true);
    }
  });

  it('acepta correos de dominios personales (ya no se bloquean)', () => {
    expect(validateLead({ ...valid, corporateEmail: 'ana@gmail.com' }).kind).toBe('ok');
  });

  it('detecta el honeypot antes que cualquier otra validación', () => {
    const result = validateLead({ ...valid, fullName: '', companyWebsite: 'http://spam.example' });
    expect(result.kind).toBe('honeypot');
  });

  it('rechaza cuerpos que no son objetos', () => {
    for (const body of [null, 'texto', 42, [], undefined]) {
      expect(validateLead(body).kind).toBe('invalid');
    }
  });

  it('exige nombre y correo', () => {
    expect(validateLead({ ...valid, fullName: '   ' }).kind).toBe('invalid');
    expect(validateLead({ ...valid, corporateEmail: '' }).kind).toBe('invalid');
  });

  it('rechaza correos con formato inválido', () => {
    for (const email of ['sin-arroba', 'a@b', '@x.com', 'a b@x.com']) {
      expect(validateLead({ ...valid, corporateEmail: email }).kind).toBe('invalid');
    }
  });

  it('exige aceptar la política: solo true estricto cuenta', () => {
    expect(validateLead({ ...valid, policyAccepted: false }).kind).toBe('invalid');
    expect(validateLead({ ...valid, policyAccepted: 'true' }).kind).toBe('invalid');
    expect(validateLead({ ...valid, policyAccepted: 1 }).kind).toBe('invalid');
  });

  it('aplica el tope de longitud a cada campo', () => {
    for (const key of Object.keys(LIMITS) as (keyof typeof LIMITS)[]) {
      const payload = { ...valid, [key]: 'x'.repeat(LIMITS[key] + 1) };
      // el correo largo además incumple formato, pero igual debe rechazarse
      expect(validateLead(payload).kind, key).toBe('invalid');
    }
  });

  it('permite exactamente el tope de longitud', () => {
    const result = validateLead({ ...valid, message: 'x'.repeat(LIMITS.message) });
    expect(result.kind).toBe('ok');
  });

  it('elimina caracteres de control pero conserva saltos de línea', () => {
    const result = validateLead({ ...valid, message: 'línea 1\n\u0000línea 2\u0007' });
    expect(result.kind).toBe('ok');
    if (result.kind === 'ok') expect(result.lead.message).toBe('línea 1\nlínea 2');
  });

  it('ignora un source desconocido', () => {
    const result = validateLead({ ...valid, source: 'otro-sitio' });
    expect(result.kind).toBe('ok');
    if (result.kind === 'ok') expect(result.lead.source).toBe('lead-capture-form');
  });

  it('ignora campos extra que no pertenecen al lead', () => {
    const result = validateLead({ ...valid, _id: 'hack', _type: 'otro', admin: true });
    expect(result.kind).toBe('ok');
    if (result.kind === 'ok') {
      expect(Object.keys(result.lead)).not.toContain('_id');
      expect(Object.keys(result.lead)).not.toContain('admin');
    }
  });
});

describe('isAllowedOrigin', () => {
  const url = 'https://dev.arenait.co/api/leads';

  it('acepta el mismo origen', () => {
    expect(isAllowedOrigin(url, 'https://dev.arenait.co')).toBe(true);
  });

  it('rechaza otro origen, otro subdominio o distinto protocolo', () => {
    expect(isAllowedOrigin(url, 'https://evil.example')).toBe(false);
    expect(isAllowedOrigin(url, 'https://www.arenait.co')).toBe(false);
    expect(isAllowedOrigin(url, 'http://dev.arenait.co')).toBe(false);
  });

  it('rechaza un Origin malformado', () => {
    expect(isAllowedOrigin(url, 'no es una url')).toBe(false);
  });

  it('acepta solicitudes sin cabecera Origin', () => {
    expect(isAllowedOrigin(url, null)).toBe(true);
  });
});

describe('leadDocumentId', () => {
  it('usa el prefijo lead. para que el documento sea privado en datasets públicos', () => {
    expect(leadDocumentId('abc')).toBe('lead.abc');
    expect(leadDocumentId()).toMatch(/^lead\.[0-9a-f-]{36}$/);
  });

  it('genera IDs distintos', () => {
    expect(leadDocumentId()).not.toBe(leadDocumentId());
  });
});

describe('constantes', () => {
  it('el tope del cuerpo cubre un mensaje máximo con margen', () => {
    // 4000 chars de mensaje en UTF-8 de hasta 4 bytes por carácter = 16000 bytes
    // para el mensaje solo: el tope debe seguir siendo un límite razonable.
    expect(MAX_BODY_BYTES).toBeGreaterThanOrEqual(16 * 1024);
  });
});
