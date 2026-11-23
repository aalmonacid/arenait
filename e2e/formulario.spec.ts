import { expect, test, type Page, type Route } from '@playwright/test';

/**
 * Formulario de contacto (/contacto). El POST a /api/leads se simula con
 * page.route: ninguna prueba escribe contactos reales en Sanity ni envía correos.
 *
 * Turnstile: el widget solo existe si la compilación trae TURNSTILE_SITE_KEY
 * (en `astro dev` normal no la trae). Si está presente no se intenta saltarlo
 * ni falsear el token: el bloque se omite y se prueba solo con el sitio sin captcha.
 */

const LEADS = '**/api/leads';

interface LeadPayload {
  fullName: string;
  corporateEmail: string;
  message: string;
  serviceOfInterest: string;
  interestModel: string;
  policyAccepted: boolean;
  policyVersion: string;
  sendCopy: boolean;
  source: string;
  [key: string]: unknown;
}

async function openForm(page: Page) {
  await page.goto('/contacto');
  await expect(page.locator('#leadCaptureForm')).toBeVisible();
  test.skip(
    (await page.locator('#leadCaptureForm .cf-turnstile').count()) > 0,
    'El build trae TURNSTILE_SITE_KEY: el captcha real no se simula en e2e.',
  );
}

async function fillValid(page: Page) {
  await page.locator('#fullName').fill('Ana Prueba');
  await page.locator('#corporateEmail').fill('ana@example.com');
  await page.locator('#message').fill('Queremos automatizar un proceso de aprobaciones.');
}

/** Captura el cuerpo JSON del POST y responde con `respond`. */
function mockLeads(page: Page, respond: (route: Route) => Promise<void>) {
  const bodies: LeadPayload[] = [];
  return page
    .route(LEADS, async (route) => {
      bodies.push(route.request().postDataJSON() as LeadPayload);
      await respond(route);
    })
    .then(() => bodies);
}

test.describe('Formulario de contacto', () => {
  test('no envía sin consentimiento y muestra el error', async ({ page }) => {
    await openForm(page);
    const bodies = await mockLeads(page, (route) =>
      route.fulfill({ status: 200, json: { ok: true } }),
    );

    await fillValid(page);
    await page.getByRole('button', { name: 'Enviar mensaje' }).click();

    await expect(page.locator('#policyError')).toBeVisible();
    await expect(page.locator('#policyAccepted')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#policyAccepted')).toBeFocused();
    expect(bodies).toHaveLength(0);

    // Al aceptar, el error se retira.
    await page.locator('#policyAccepted').check();
    await expect(page.locator('#policyError')).toBeHidden();
  });

  test('valida campos obligatorios y formato de correo', async ({ page }) => {
    await openForm(page);
    const bodies = await mockLeads(page, (route) =>
      route.fulfill({ status: 200, json: { ok: true } }),
    );

    await page.getByRole('button', { name: 'Enviar mensaje' }).click();
    await expect(page.locator('#fullNameError')).toBeVisible();
    await expect(page.locator('#emailError')).toBeVisible();
    await expect(page.locator('#messageError')).toBeVisible();
    await expect(page.locator('#policyError')).toBeVisible();
    await expect(page.locator('#fullName')).toBeFocused();

    // Correo con formato inválido: sigue marcado aunque lo demás esté completo.
    await page.locator('#fullName').fill('Ana Prueba');
    await page.locator('#corporateEmail').fill('no-es-un-correo');
    await page.locator('#message').fill('Hola');
    await page.locator('#policyAccepted').check();
    await page.getByRole('button', { name: 'Enviar mensaje' }).click();
    await expect(page.locator('#emailError')).toBeVisible();
    await expect(page.locator('#corporateEmail')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#fullNameError')).toBeHidden();
    expect(bodies).toHaveLength(0);

    // Corregir el campo retira su error.
    await page.locator('#corporateEmail').fill('ana@example.com');
    await expect(page.locator('#emailError')).toBeHidden();
  });

  test('éxito: muestra la confirmación y envía versión de política, servicio y modelo', async ({
    page,
  }) => {
    await openForm(page);
    const bodies = await mockLeads(page, (route) =>
      route.fulfill({ status: 200, json: { ok: true, copy: 'not_requested' } }),
    );
    const policyVersion = await page
      .locator('#leadCaptureForm')
      .getAttribute('data-policy-version');
    expect(policyVersion).toBeTruthy();

    await fillValid(page);
    await page.locator('#serviceOfInterest').selectOption('bizagi');
    await page.locator('#interestModel').selectOption('celula-dedicada');
    await page.locator('#policyAccepted').check();
    await page.getByRole('button', { name: 'Enviar mensaje' }).click();

    await expect(page.locator('#formSuccess')).toBeVisible();
    await expect(page.locator('#successTitle')).toContainText('Ana');
    await expect(page.locator('#successText')).toContainText('ana@example.com');
    await expect(page.locator('#leadCaptureForm')).toBeHidden();

    expect(bodies).toHaveLength(1);
    expect(bodies[0]).toMatchObject({
      fullName: 'Ana Prueba',
      corporateEmail: 'ana@example.com',
      serviceOfInterest: 'bizagi',
      interestModel: 'celula-dedicada',
      policyAccepted: true,
      policyVersion,
      sendCopy: false,
      source: 'lead-capture-form',
    });

    // «Enviar otro mensaje» vuelve al formulario limpio.
    await page.locator('#sendAnother').click();
    await expect(page.locator('#leadCaptureForm')).toBeVisible();
    await expect(page.locator('#fullName')).toHaveValue('');
  });

  for (const scenario of [
    {
      status: 500,
      body: { ok: false, error: 'Error interno de prueba.' },
      text: 'Error interno de prueba.',
    },
    { status: 429, body: { ok: false }, text: 'varios envíos seguidos' },
  ]) {
    test(`error ${scenario.status}: muestra el mensaje y permite reintentar`, async ({ page }) => {
      await openForm(page);
      let calls = 0;
      const bodies = await mockLeads(page, (route) => {
        calls += 1;
        return calls === 1
          ? route.fulfill({ status: scenario.status, json: scenario.body })
          : route.fulfill({ status: 200, json: { ok: true, copy: 'not_requested' } });
      });

      await fillValid(page);
      await page.locator('#policyAccepted').check();
      const submit = page.getByRole('button', { name: 'Enviar mensaje' });
      await submit.click();

      await expect(page.locator('#formError')).toBeVisible();
      await expect(page.locator('#formErrorText')).toContainText(scenario.text);
      await expect(page.locator('#formErrorWhatsapp')).toBeVisible();
      // El formulario sigue ahí, con lo escrito, y el botón vuelve a estar activo.
      await expect(page.locator('#leadCaptureForm')).toBeVisible();
      await expect(page.locator('#fullName')).toHaveValue('Ana Prueba');
      await expect(submit).toBeEnabled();
      await expect(page.locator('#formSuccess')).toBeHidden();

      // Reintento: el error se limpia y esta vez llega la confirmación.
      await submit.click();
      await expect(page.locator('#formSuccess')).toBeVisible();
      await expect(page.locator('#formError')).toBeHidden();
      expect(bodies).toHaveLength(2);
    });
  }
});
