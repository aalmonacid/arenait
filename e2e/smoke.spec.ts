import { expect, test } from '@playwright/test';

test.describe('Home page', () => {
  test('renders hero and the real services list', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/ArenaIT/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Software a la medida para operaciones reales',
    );

    await expect(page.locator('#servicios')).toBeVisible();
    // Count-based, not content-based: today the 6 services come from
    // index.astro's hardcoded fallback (Sanity has no real content yet, see
    // CONTEXT.md §4). If real content lands in Sanity, update alongside it.
    await expect(page.locator('#servicios article')).toHaveCount(6);
  });

  test('nav links resolve to real pages', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('header nav');

    await expect(nav.getByRole('link', { name: 'Servicios' })).toHaveAttribute(
      'href',
      '/servicios',
    );
    await expect(nav.getByRole('link', { name: 'Casos de Estudio' })).toHaveAttribute(
      'href',
      '/casos-de-estudio',
    );
    await expect(nav.getByRole('link', { name: 'Nosotros' })).toHaveAttribute('href', '/nosotros');
    await expect(nav.getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', '/contacto');
  });

  test('embeds Organization JSON-LD structured data', async ({ page }) => {
    await page.goto('/');
    // textContent, not innerText: <script> isn't part of the rendered layout
    // tree, so innerText (which is layout-aware) reads back empty for it.
    const ldJson = await page.locator('script[type="application/ld+json"]').first().textContent();
    const parsed = JSON.parse(ldJson ?? '');
    expect(parsed['@type']).toBe('Organization');
    expect(parsed.name).toBe('ArenaIT');
  });
});

test.describe('Servicios page', () => {
  test('renders all 6 real services, no fake metrics', async ({ page }) => {
    await page.goto('/servicios');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Servicios');
    await expect(page.getByText('Desarrollo de software a la medida')).toBeVisible();
    await expect(page.getByText('Mantenimiento y migración de software')).toBeVisible();
    await expect(page.getByText('ISO 27001')).toHaveCount(0);
    await expect(page.getByText('SLA')).toHaveCount(0);
  });
});

test.describe('Nosotros page', () => {
  test('renders verified copy and marks pending content, not raw brackets', async ({ page }) => {
    await page.goto('/nosotros');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Quiénes somos');
    await expect(page.getByText('Andrés Arena')).toBeVisible();
    await expect(page.getByText('pendiente de confirmar con el cliente').first()).toBeVisible();
    await expect(page.getByText('[PENDIENTE', { exact: false })).toHaveCount(0);
  });
});

test.describe('Case studies page', () => {
  test('shows the real Sadep case study', async ({ page }) => {
    await page.goto('/casos-de-estudio');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Casos de Estudio');
    await expect(page.getByText('SADEP LTDA')).toBeVisible();
  });

  test('renders the Sadep case study detail page', async ({ page }) => {
    await page.goto('/casos-de-estudio/sadep');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Gestión remota de fincas ganaderas',
    );
    await expect(page.getByText('Tauruswebs')).toBeVisible();
  });
});

test.describe('404 page', () => {
  test('shows the 404 message for an unknown route', async ({ page }) => {
    const response = await page.goto('/esto-no-existe');
    await expect(page.getByRole('heading')).toContainText('404');
    expect(response?.status()).toBe(404);
  });
});

test.describe('Contacto page', () => {
  test('preselects the service passed via query param', async ({ page }) => {
    await page.goto('/contacto?servicio=Business%20Intelligence');
    await expect(page.locator('#serviceOfInterest')).toHaveValue('Business Intelligence');
  });

  test('submits valid data to /api/leads and shows the success message', async ({ page }) => {
    let requestBody: Record<string, unknown> | null = null;
    await page.route('**/api/leads', (route) => {
      requestBody = route.request().postDataJSON();
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, id: 'test-id' }),
      });
    });

    await page.goto('/contacto');
    await page.locator('#fullName').fill('Test User');
    await page.locator('#company').fill('Empresa de Prueba');
    await page.locator('#corporateEmail').fill('test@gmail.com');
    await page.locator('#message').fill('Test message');
    await page.locator('#leadCaptureForm button[type="submit"]').click();

    await expect(page.locator('#formSuccess')).toBeVisible();
    expect((requestBody as unknown as { corporateEmail?: string } | null)?.corporateEmail).toBe(
      'test@gmail.com',
    );
  });

  test('honeypot field short-circuits without calling the API', async ({ page }) => {
    let apiCalled = false;
    await page.route('**/api/leads', (route) => {
      apiCalled = true;
      route.abort();
    });

    await page.goto('/contacto');
    await page.locator('#fullName').fill('Bot');
    await page.locator('#corporateEmail').fill('bot@empresa.com');
    await page.locator('#message').fill('spam');
    await page.locator('#companyWebsite').fill('http://spam.example');
    await page.locator('#leadCaptureForm button[type="submit"]').click();

    await expect(page.locator('#formSuccess')).toBeVisible();
    expect(apiCalled).toBe(false);
  });
});
