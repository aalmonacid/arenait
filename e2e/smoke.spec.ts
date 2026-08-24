import { expect, test } from '@playwright/test';

test.describe('Home page', () => {
  test('renders hero, services, and TCO calculator with correct defaults', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/ArenaIT/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Ingeniería de Software Estructural',
    );

    await expect(page.locator('#servicios')).toBeVisible();
    // Count-based, not content-based: today the 3 services come from
    // index.astro's hardcoded fallback (Sanity has no real content yet, see
    // CONTEXT.md §4). Once BACKLOG.md's "cargar contenido real en Sanity"
    // item ships, the count may change — update this alongside it.
    await expect(page.locator('#servicios article')).toHaveCount(3);

    // Default TcoCalculator values: 25000/month at 38% efficiency -> 114,000 / 186,000.
    await expect(page.locator('#annualSavings')).toHaveText('114,000');
    await expect(page.locator('#newAnnualSpend')).toHaveText('186,000');
  });

  test('nav links resolve to real sections instead of "#"', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('header nav');

    await expect(nav.getByRole('link', { name: 'Servicios' })).toHaveAttribute(
      'href',
      '/#servicios',
    );
    await expect(nav.getByRole('link', { name: 'FinOps' })).toHaveAttribute('href', '/#finops');
    await expect(nav.getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', '/#contacto');

    await nav.getByRole('link', { name: 'FinOps' }).click();
    await expect(page.locator('#finops')).toBeInViewport();
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

test.describe('Service detail page', () => {
  test('renders a known service by slug', async ({ page }) => {
    // Slug + title come from the same hardcoded fallback as above — update
    // together if BACKLOG.md's "cargar contenido real en Sanity" item ships.
    await page.goto('/servicios/arquitectura-finops-cloud');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Arquitectura FinOps Cloud',
    );
    await expect(page.getByText('Ahorro TCO')).toBeVisible();
  });
});

test.describe('404 page', () => {
  test('shows the 404 message for an unknown route', async ({ page }) => {
    const response = await page.goto('/esto-no-existe');
    await expect(page.getByRole('heading')).toContainText('404');
    expect(response?.status()).toBe(404);
  });
});

test.describe('Lead capture form', () => {
  test('blocks free-mail domains client-side without calling the API', async ({ page }) => {
    let apiCalled = false;
    await page.route('**/api/leads', (route) => {
      apiCalled = true;
      route.abort();
    });

    await page.goto('/#contacto');
    await page.locator('#fullName').fill('Test User');
    await page.locator('#jobTitle').selectOption('CTO');
    await page.locator('#corporateEmail').fill('test@gmail.com');
    await page.locator('#infrastructure').selectOption('AWS');
    await page.locator('#message').fill('Test message');
    await page.locator('#leadCaptureForm button[type="submit"]').click();

    await expect(page.locator('#emailError')).toBeVisible();
    expect(apiCalled).toBe(false);
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

    await page.goto('/#contacto');
    await page.locator('#fullName').fill('Test User');
    await page.locator('#jobTitle').selectOption('CTO');
    await page.locator('#corporateEmail').fill('test@empresa.com');
    await page.locator('#infrastructure').selectOption('AWS');
    await page.locator('#message').fill('Test message');
    await page.locator('#leadCaptureForm button[type="submit"]').click();

    await expect(page.locator('#formSuccess')).toBeVisible();
    expect((requestBody as unknown as { corporateEmail?: string } | null)?.corporateEmail).toBe(
      'test@empresa.com',
    );
  });

  test('honeypot field short-circuits without calling the API', async ({ page }) => {
    let apiCalled = false;
    await page.route('**/api/leads', (route) => {
      apiCalled = true;
      route.abort();
    });

    await page.goto('/#contacto');
    await page.locator('#fullName').fill('Bot');
    await page.locator('#jobTitle').selectOption('CTO');
    await page.locator('#corporateEmail').fill('bot@empresa.com');
    await page.locator('#infrastructure').selectOption('AWS');
    await page.locator('#message').fill('spam');
    await page.locator('#companyWebsite').fill('http://spam.example');
    await page.locator('#leadCaptureForm button[type="submit"]').click();

    await expect(page.locator('#formSuccess')).toBeVisible();
    expect(apiCalled).toBe(false);
  });
});
