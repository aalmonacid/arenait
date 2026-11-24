import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Pruebas del handler POST /api/leads con sus dependencias simuladas (Sanity,
 * Turnstile, Resend y el webhook). Cubren el orden de las verificaciones: origen,
 * tipo de contenido, límite de envíos, tamaño, JSON, honeypot, validación,
 * captcha, guardado y avisos.
 */

// Los secretos viven en el módulo virtual `astro:env/server`; aquí se controlan
// por prueba con `vi.hoisted`.
const env = vi.hoisted(() => ({
  LEAD_NOTIFY_WEBHOOK_URL: undefined as string | undefined,
  MAIL_FROM: 'Arena IT <contacto@arenait.co>' as string | undefined,
  MAIL_TO_OWNER: 'dueno@example.com' as string | undefined,
  RESEND_API_KEY: 'resend-test-key' as string | undefined,
  TURNSTILE_SECRET_KEY: 'turnstile-test-secret' as string | undefined,
}));

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  verifyTurnstile: vi.fn(),
  sendEmail: vi.fn(),
  notifyNewLead: vi.fn(),
  checkRateLimit: vi.fn(),
}));

vi.mock('astro:env/server', () => ({
  get LEAD_NOTIFY_WEBHOOK_URL() {
    return env.LEAD_NOTIFY_WEBHOOK_URL;
  },
  get MAIL_FROM() {
    return env.MAIL_FROM;
  },
  get MAIL_TO_OWNER() {
    return env.MAIL_TO_OWNER;
  },
  get RESEND_API_KEY() {
    return env.RESEND_API_KEY;
  },
  get TURNSTILE_SECRET_KEY() {
    return env.TURNSTILE_SECRET_KEY;
  },
}));
vi.mock('./sanityWriteClient', () => ({
  getSanityWriteClient: () => ({ create: mocks.create }),
}));
vi.mock('./turnstile', () => ({ verifyTurnstile: mocks.verifyTurnstile }));
vi.mock('./leadNotify', () => ({ notifyNewLead: mocks.notifyNewLead }));
vi.mock('./rateLimit', () => ({ checkRateLimit: mocks.checkRateLimit }));
vi.mock('./mailer', async (importOriginal) => {
  const original = await importOriginal<typeof import('./mailer')>();
  return { ...original, sendEmail: mocks.sendEmail };
});

import { POST } from '../pages/api/leads';
import { MAX_BODY_BYTES } from './leadValidation';

const URL_LEADS = 'https://arenait.co/api/leads';

const validBody = {
  fullName: 'Ana Pérez',
  company: 'Empresa SAS',
  corporateEmail: 'ana@empresa.com',
  phone: '3001234567',
  serviceOfInterest: 'business-intelligence-analitica',
  interestModel: 'bolsa-de-horas',
  message: 'Necesitamos un tablero de indicadores.',
  source: 'lead-capture-form',
  companyWebsite: '',
  policyAccepted: true,
  policyVersion: '1.2',
  turnstileToken: 'token-de-prueba',
  sendCopy: false,
};

interface CallOptions {
  body?: unknown;
  rawBody?: string;
  headers?: Record<string, string>;
}

async function call({ body = validBody, rawBody, headers = {} }: CallOptions = {}) {
  const request = new Request(URL_LEADS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://arenait.co', ...headers },
    body: rawBody ?? JSON.stringify(body),
  });
  const response = await POST({ request, clientAddress: '203.0.113.7' } as never);
  return { status: response.status, json: await response.json(), headers: response.headers };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  env.LEAD_NOTIFY_WEBHOOK_URL = undefined;
  env.MAIL_FROM = 'Arena IT <contacto@arenait.co>';
  env.MAIL_TO_OWNER = 'dueno@example.com';
  env.RESEND_API_KEY = 'resend-test-key';
  env.TURNSTILE_SECRET_KEY = 'turnstile-test-secret';
  mocks.checkRateLimit.mockReturnValue({ limited: false, retryAfterSeconds: 0 });
  mocks.verifyTurnstile.mockResolvedValue(true);
  mocks.create.mockResolvedValue({});
  mocks.sendEmail.mockResolvedValue(true);
  mocks.notifyNewLead.mockResolvedValue(undefined);
});

describe('POST /api/leads: camino feliz', () => {
  it('guarda el contacto con ID privado, avisa al dueño y responde 201 sin exponer el ID', async () => {
    const { status, json } = await call();

    expect(status).toBe(201);
    expect(json).toEqual({ ok: true, copy: 'not_requested' });
    expect(JSON.stringify(json)).not.toContain('lead.');

    expect(mocks.create).toHaveBeenCalledTimes(1);
    const saved = mocks.create.mock.calls[0][0];
    expect(saved._type).toBe('lead');
    expect(saved._id).toMatch(/^lead\./);
    expect(saved.corporateEmail).toBe('ana@empresa.com');
    expect(saved.policyAccepted).toBe(true);
    expect(typeof saved.createdAt).toBe('string');
    expect(saved.policyAcceptedAt).toBe(saved.createdAt);

    // Solo el aviso al dueño: sin copia al visitante.
    expect(mocks.sendEmail).toHaveBeenCalledTimes(1);
    expect(mocks.sendEmail.mock.calls[0][1].to).toBe('dueno@example.com');
  });

  it('envía la copia al visitante solo si la pidió y lo informa', async () => {
    const { status, json } = await call({ body: { ...validBody, sendCopy: true } });

    expect(status).toBe(201);
    expect(json).toEqual({ ok: true, copy: 'sent' });
    expect(mocks.sendEmail).toHaveBeenCalledTimes(2);
    const recipients = mocks.sendEmail.mock.calls.map((c) => c[1].to);
    expect(recipients).toContain('dueno@example.com');
    expect(recipients).toContain('ana@empresa.com');
  });

  it('informa copy "failed" cuando la copia no sale, sin tumbar el envío', async () => {
    mocks.sendEmail.mockImplementation(async (_cfg, email) => email.to === 'dueno@example.com');
    const { status, json } = await call({ body: { ...validBody, sendCopy: true } });

    expect(status).toBe(201);
    expect(json).toEqual({ ok: true, copy: 'failed' });
  });

  it('no envía aviso al dueño si MAIL_TO_OWNER no está configurado', async () => {
    env.MAIL_TO_OWNER = undefined;
    const { status } = await call();

    expect(status).toBe(201);
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });
});

describe('POST /api/leads: rechazos previos a la validación', () => {
  it('403 si el origen es de otro sitio y no guarda nada', async () => {
    const { status } = await call({ headers: { Origin: 'https://sitio-ajeno.example' } });

    expect(status).toBe(403);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('415 si el contenido no es JSON', async () => {
    const { status } = await call({ headers: { 'Content-Type': 'text/plain' } });

    expect(status).toBe(415);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('429 con Retry-After cuando se supera el límite de envíos', async () => {
    mocks.checkRateLimit.mockReturnValue({ limited: true, retryAfterSeconds: 42 });
    const { status, headers } = await call();

    expect(status).toBe(429);
    expect(headers.get('Retry-After')).toBe('42');
    expect(mocks.verifyTurnstile).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('limita por la IP del cliente que resuelve el adaptador', async () => {
    await call();

    expect(mocks.checkRateLimit).toHaveBeenCalledWith('203.0.113.7');
  });

  it('413 si Content-Length declara un cuerpo demasiado grande', async () => {
    const { status } = await call({ headers: { 'Content-Length': String(MAX_BODY_BYTES + 1) } });

    expect(status).toBe(413);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('413 si el cuerpo real supera el tope aunque no haya Content-Length', async () => {
    const { status } = await call({ rawBody: JSON.stringify({ message: 'x'.repeat(MAX_BODY_BYTES) }) });

    expect(status).toBe(413);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('400 si el cuerpo no es JSON válido', async () => {
    const { status, json } = await call({ rawBody: '{no es json' });

    expect(status).toBe(400);
    expect(json.ok).toBe(false);
    expect(mocks.create).not.toHaveBeenCalled();
  });
});

describe('POST /api/leads: validación del contenido', () => {
  it('400 con el mensaje de validación y sin tocar Sanity ni el captcha', async () => {
    const { status, json } = await call({ body: { ...validBody, corporateEmail: 'no-es-correo' } });

    expect(status).toBe(400);
    expect(json.ok).toBe(false);
    expect(typeof json.error).toBe('string');
    expect(mocks.verifyTurnstile).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('400 si no se aceptó la política de datos', async () => {
    const { status } = await call({ body: { ...validBody, policyAccepted: false } });

    expect(status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('honeypot: finge éxito (201) sin guardar, verificar captcha ni enviar correos', async () => {
    const { status, json } = await call({
      body: { ...validBody, companyWebsite: 'https://spam.example' },
    });

    expect(status).toBe(201);
    expect(json).toEqual({ ok: true });
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.verifyTurnstile).not.toHaveBeenCalled();
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });
});

describe('POST /api/leads: captcha (Turnstile)', () => {
  it('400 con captcha:true si la verificación falla, antes de guardar o enviar correos', async () => {
    mocks.verifyTurnstile.mockResolvedValue(false);
    const { status, json } = await call();

    expect(status).toBe(400);
    expect(json.captcha).toBe(true);
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it('verifica con el token enviado, la IP y el hostname del sitio', async () => {
    await call();

    expect(mocks.verifyTurnstile).toHaveBeenCalledTimes(1);
    const args = mocks.verifyTurnstile.mock.calls[0];
    expect(args[0]).toBe('turnstile-test-secret');
    expect(args[1]).toBe('token-de-prueba');
    expect(args[2]).toBe('203.0.113.7');
    expect(args[4]).toBe('arenait.co');
  });

  it('503 en producción si falta TURNSTILE_SECRET_KEY (falla cerrado)', async () => {
    vi.stubEnv('PROD', true);
    env.TURNSTILE_SECRET_KEY = undefined;
    const { status, json } = await call();

    expect(status).toBe(503);
    expect(json.ok).toBe(false);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('en desarrollo sin secreto no exige captcha', async () => {
    vi.stubEnv('PROD', false);
    env.TURNSTILE_SECRET_KEY = undefined;
    const { status } = await call();

    expect(status).toBe(201);
    expect(mocks.verifyTurnstile).not.toHaveBeenCalled();
  });
});

describe('POST /api/leads: fallos de Sanity y avisos', () => {
  it('502 si Sanity falla, sin enviar correos ni filtrar datos personales a los registros', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.create.mockRejectedValue(
      Object.assign(new Error('permission "create" required'), {
        statusCode: 403,
        details: { document: { corporateEmail: 'ana@empresa.com' } },
      }),
    );
    const { status, json } = await call();

    expect(status).toBe(502);
    expect(json.ok).toBe(false);
    expect(mocks.sendEmail).not.toHaveBeenCalled();
    expect(mocks.notifyNewLead).not.toHaveBeenCalled();

    const logged = JSON.stringify(consoleError.mock.calls);
    expect(logged).toContain('403');
    expect(logged).not.toContain('ana@empresa.com');
    consoleError.mockRestore();
  });

  it('un fallo del webhook de avisos no cambia el resultado del envío', async () => {
    env.LEAD_NOTIFY_WEBHOOK_URL = 'https://hooks.example/aviso';
    mocks.notifyNewLead.mockResolvedValue(undefined);
    const { status, json } = await call();

    expect(status).toBe(201);
    expect(json.ok).toBe(true);
    expect(mocks.notifyNewLead).toHaveBeenCalledTimes(1);
    expect(mocks.notifyNewLead.mock.calls[0][0]).toBe('https://hooks.example/aviso');
  });
});
