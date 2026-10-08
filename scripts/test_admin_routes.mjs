import { chromium } from 'playwright';

async function testAdminRoutes() {
  const browser = await chromium.launch({ headless: true });
  const results = {
    unauthenticatedRedirects: [],
    directUrlAccess: [],
    tabClicksSyncUrl: [],
    browserBackForward: [],
    refreshPersistence: [],
    failures: []
  };

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // --- 1. UNAUTHENTICATED REDIRECTS ---
  const routesToTest = [
    '/',
    '/bookings',
    '/capacity',
    '/blocked-dates',
    '/announcements',
    '/faq',
    '/inquiries',
    '/gallery',
    '/settings',
    '/packages'
  ];

  for (const r of routesToTest) {
    await page.goto(`http://localhost:5174${r}`, { waitUntil: 'networkidle' });
    const url = page.url();
    if (url.includes('/login')) {
      results.unauthenticatedRedirects.push({ route: r, redirectedToLogin: true });
    } else {
      results.failures.push(`Unauthenticated route ${r} did not redirect to /login! Current: ${url}`);
    }
  }

  // --- 2. AUTHENTICATE AS OWNER ---
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle' });
  const ownerBtn = page.locator('button:has-text("Owner-Zugangsdaten einfügen")');
  await ownerBtn.click();
  await page.waitForTimeout(100);
  await page.locator('button[type="submit"]:has-text("Anmelden")').click();
  await page.waitForTimeout(500);

  if (!page.url().includes('/bookings') && !page.url().includes('/packages')) {
    results.failures.push(`Login did not redirect to destination. Current: ${page.url()}`);
  }

  // --- 3. DIRECT URL ACCESS & ACTIVE NAV STATE FOR ALL SECTIONS ---
  const sectionChecks = [
    { route: '/bookings', expectedText: 'Aktive Buchungen', navText: 'Buchungen' },
    { route: '/capacity', expectedText: 'Zeitslot-Aktivierung', navText: 'Kapazitäten & Slots' },
    { route: '/blocked-dates', expectedText: 'Schließtage & Betriebsruhe', navText: 'Schließtage' },
    { route: '/announcements', expectedText: 'Ankündigungen', navText: 'Ankündigungen' },
    { route: '/faq', expectedText: 'FAQ', navText: 'FAQ-Verwaltung' },
    { route: '/inquiries', expectedText: 'Anfragen', navText: 'Anfragen-Postfach' },
    { route: '/gallery', expectedText: 'Galerie', navText: 'Galerie' },
    { route: '/settings', expectedText: 'Geschäftsdaten', navText: 'Geschäftsdaten' },
    { route: '/packages', expectedText: 'Pakete', navText: 'Pakete & Tarife' },
  ];

  for (const item of sectionChecks) {
    await page.goto(`http://localhost:5174${item.route}`, { waitUntil: 'networkidle' });
    const currentUrl = page.url();
    const hasExpectedContent = await page.locator(`text=${item.expectedText}`).first().isVisible();
    const activeNavClass = await page.locator(`a:has-text("${item.navText}")`).first().getAttribute('class');
    const isNavActive = activeNavClass && activeNavClass.includes('bg-[#183D3D]');

    results.directUrlAccess.push({
      route: item.route,
      urlMatch: currentUrl.endsWith(item.route),
      contentVisible: hasExpectedContent,
      navActive: !!isNavActive
    });

    if (!currentUrl.endsWith(item.route) || !hasExpectedContent || !isNavActive) {
      results.failures.push(`Direct URL access failed for ${item.route}: urlMatch=${currentUrl.endsWith(item.route)}, content=${hasExpectedContent}, navActive=${isNavActive}`);
    }
  }

  // --- 4. TAB CLICKS SYNCHRONIZE URL (NO PAGE RELOAD) ---
  await page.goto('http://localhost:5174/bookings', { waitUntil: 'networkidle' });

  // Click on "Kapazitäten & Slots" Link
  await page.locator(`a:has-text("Kapazitäten & Slots")`).first().click();
  await page.waitForTimeout(200);
  if (!page.url().endsWith('/capacity')) {
    results.failures.push(`Clicking Kapazitäten did not update URL to /capacity. Current: ${page.url()}`);
  } else {
    results.tabClicksSyncUrl.push({ from: '/bookings', to: '/capacity', success: true });
  }

  // Click on "Schließtage" Link
  await page.locator(`a:has-text("Schließtage")`).first().click();
  await page.waitForTimeout(200);
  if (!page.url().endsWith('/blocked-dates')) {
    results.failures.push(`Clicking Schließtage did not update URL to /blocked-dates. Current: ${page.url()}`);
  } else {
    results.tabClicksSyncUrl.push({ from: '/capacity', to: '/blocked-dates', success: true });
  }

  // --- 5. BROWSER BACK / FORWARD BEHAVIOR ---
  await page.goBack();
  await page.waitForTimeout(200);
  const backUrl = page.url();
  const backCapacityContent = await page.locator('text=Zeitslot-Aktivierung').first().isVisible();

  if (backUrl.endsWith('/capacity') && backCapacityContent) {
    results.browserBackForward.push({ action: 'back', target: '/capacity', success: true });
  } else {
    results.failures.push(`Browser back button failed: url=${backUrl}, content=${backCapacityContent}`);
  }

  await page.goForward();
  await page.waitForTimeout(200);
  const fwdUrl = page.url();
  const fwdBlockedDatesContent = await page.locator('text=Schließtage & Betriebsruhe').first().isVisible();

  if (fwdUrl.endsWith('/blocked-dates') && fwdBlockedDatesContent) {
    results.browserBackForward.push({ action: 'forward', target: '/blocked-dates', success: true });
  } else {
    results.failures.push(`Browser forward button failed: url=${fwdUrl}, content=${fwdBlockedDatesContent}`);
  }

  // --- 6. REFRESH PERSISTENCE (F5 ON INTERNAL ROUTE) ---
  await page.goto('http://localhost:5174/gallery', { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });
  const reloadUrl = page.url();
  const reloadGalleryContent = await page.locator('text=Galerie').first().isVisible();

  if (reloadUrl.endsWith('/gallery') && reloadGalleryContent) {
    results.refreshPersistence.push({ route: '/gallery', remainedOnRoute: true });
  } else {
    results.failures.push(`Page reload on /gallery failed: url=${reloadUrl}`);
  }

  await context.close();
  await browser.close();

  console.log(JSON.stringify(results, null, 2));
}

testAdminRoutes().catch((err) => {
  console.error(err);
  process.exit(1);
});
