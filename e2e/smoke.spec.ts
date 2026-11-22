import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

test.describe('Home page', () => {
  test('renders hero, the three pillars and the 6-phase process', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Arena IT/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Software e IA para operaciones reales',
    );

    await expect(page.locator('#servicios')).toBeVisible();
    await expect(page.locator('#servicios article')).toHaveCount(3);
    await expect(page.locator('#servicios')).toContainText('Construimos');
    await expect(page.locator('#servicios')).toContainText('Aplicamos IA');
    await expect(page.locator('#servicios')).toContainText('Operamos');
    await expect(page.locator('#como-trabajamos ol > li')).toHaveCount(6);
  });

  test('shows the 3 featured projects in the client order and links sectors to the filter', async ({
    page,
  }) => {
    await page.goto('/');
    const titles = page.locator('#proyectos article h3');
    await expect(titles).toHaveCount(3);
    await expect(titles.nth(0)).toContainText('Migración a la nube');
    await expect(titles.nth(1)).toContainText('entidades públicas');
    await expect(titles.nth(2)).toContainText('aplicación móvil');
    await expect(page.locator('#sectores a[href="/proyectos?sector=seguros"]')).toBeVisible();
  });

  test('does not publish certifications or SLA figures', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('ISO 27001')).toHaveCount(0);
    await expect(page.getByText('99.9')).toHaveCount(0);
  });
});

test.describe('Navigation and structured data', () => {
  test('header links point to the real pages', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('header nav');
    await expect(nav.getByRole('link', { name: 'Servicios' })).toHaveAttribute(
      'href',
      '/servicios',
    );
    await expect(nav.getByRole('link', { name: 'Proyectos' })).toHaveAttribute(
      'href',
      '/proyectos',
    );
    await expect(nav.getByRole('link', { name: 'Nosotros' })).toHaveAttribute('href', '/nosotros');
    await expect(nav.getByRole('link', { name: 'Cuéntanos tu reto' })).toHaveAttribute(
      'href',
      '/contacto',
    );
  });

  test('embeds Organization JSON-LD with the brand "Arena IT"', async ({ page }) => {
    await page.goto('/');
    // textContent, not innerText: <script> isn't part of the rendered layout
    // tree, so innerText (which is layout-aware) reads back empty for it.
    const ldJson = await page.locator('script[type="application/ld+json"]').first().textContent();
    const parsed = JSON.parse(ldJson ?? '');
    expect(parsed['@type']).toBe('Organization');
    expect(parsed.name).toBe('Arena IT');
  });

  test('legacy case-study routes are redirected (301) to /proyectos', () => {
    // `astro dev` no aplica public/_redirects: se verifica el archivo que usa Cloudflare.
    const rules = readFileSync('public/_redirects', 'utf8');
    for (const from of ['/casos-de-estudio', '/casos-de-estudio/*', '/experiencia.html']) {
      expect(rules).toContain(`${from} /proyectos 301`);
    }
  });
});

test.describe('Servicios page', () => {
  test('renders the 13 services in 3 pillars with their anchors and contact links', async ({
    page,
  }) => {
    await page.goto('/servicios');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Software e IA');
    await expect(page.locator('li[id] > article')).toHaveCount(13);
    await expect(page.locator('#bizagi')).toBeVisible();
    await expect(page.locator('#outsourcing-talento-ti')).toBeVisible();
    await expect(page.locator('#bizagi a[href="/contacto?servicio=bizagi"]')).toBeVisible();
    await expect(page.locator('#como-trabajamos tbody tr')).toHaveCount(6);
    await expect(page.locator('#preguntas-frecuentes details')).toHaveCount(6);
    await expect(page.getByText('ISO 27001')).toHaveCount(0);
  });

  test('embeds ItemList and FAQPage JSON-LD', async ({ page }) => {
    await page.goto('/servicios');
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const types = blocks.map((b) => JSON.parse(b)['@type']);
    expect(types).toContain('ItemList');
    expect(types).toContain('FAQPage');
  });
});

test.describe('Proyectos page', () => {
  test('shows the 9 publishable projects', async ({ page }) => {
    await page.goto('/proyectos');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Proyectos que hemos entregado',
    );
    await expect(page.locator('[data-project]')).toHaveCount(9);
  });

  test('filters combine and are shareable by query params', async ({ page }) => {
    await page.goto('/proyectos?servicio=bizagi&sector=financiero');
    await expect(page.locator('[data-project]:not([hidden])')).toHaveCount(2);
    await expect(
      page.locator('button[data-filter="servicio"][data-value="bizagi"]'),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  test('an empty combination shows the notice with a link to see all', async ({ page }) => {
    await page.goto('/proyectos?servicio=bizagi&sector=farmaceutico');
    await expect(page.locator('[data-project]:not([hidden])')).toHaveCount(0);
    await expect(page.getByText('No hay proyectos con estos filtros.')).toBeVisible();
  });
});

test.describe('Nosotros page', () => {
  test('renders the new copy, principles and manager contact', async ({ page }) => {
    await page.goto('/nosotros');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Tecnología que funciona en la operación diaria',
    );
    await expect(page.getByText('Andrés Arenas')).toBeVisible();
    await expect(page.getByText('Especialización en Bizagi')).toBeVisible();
    await expect(page.getByText('pendiente de confirmar con el cliente')).toHaveCount(0);
    await expect(page.getByText('[PENDIENTE', { exact: false })).toHaveCount(0);
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
  test('preselects the service passed via query param (slug)', async ({ page }) => {
    await page.goto('/contacto?servicio=bizagi');
    await expect(page.locator('#serviceOfInterest')).toHaveValue('bizagi');
  });

  test('an unknown service in the query param falls back to "Otro"', async ({ page }) => {
    await page.goto('/contacto?servicio=xyz');
    await expect(page.locator('#serviceOfInterest')).toHaveValue('otro');
  });

  test('lists the services grouped by pillar (13 + Diagnóstico + Otro) and the interest model', async ({
    page,
  }) => {
    await page.goto('/contacto');
    await expect(page.locator('#serviceOfInterest optgroup')).toHaveCount(4);
    await expect(page.locator('#serviceOfInterest option')).toHaveCount(16); // 15 + placeholder
    await expect(page.locator('#interestModel option')).toHaveCount(7); // 6 + placeholder
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
    await page.locator('#serviceOfInterest').selectOption('bizagi');
    await page.locator('#interestModel').selectOption('bolsa-de-horas');
    await page.locator('#policyAccepted').check();
    await page.locator('#sendCopy').check();
    await page.locator('#leadCaptureForm button[type="submit"]').click();

    // Pantalla de éxito: reemplaza al formulario y saluda por el nombre.
    await expect(page.locator('#formSuccess')).toBeVisible();
    await expect(page.locator('#successTitle')).toContainText('Test');
    await expect(page.locator('#leadCaptureForm')).toBeHidden();
    const sent = requestBody as unknown as {
      corporateEmail?: string;
      sendCopy?: boolean;
      serviceOfInterest?: string;
      interestModel?: string;
    } | null;
    expect(sent?.corporateEmail).toBe('test@gmail.com');
    expect(sent?.serviceOfInterest).toBe('bizagi');
    expect(sent?.interestModel).toBe('bolsa-de-horas');
    expect(sent?.sendCopy).toBe(true);
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
    await page.locator('#policyAccepted').check();
    await page.locator('#leadCaptureForm button[type="submit"]').click();

    await expect(page.locator('#formSuccess')).toBeVisible();
    expect(apiCalled).toBe(false);
  });
});
