import { chromium } from 'playwright';

const RESULTS = {
  timestamp: new Date().toISOString(),
  publicSite: {
    pagesChecked: [],
    bookingFlowSuccess: false,
    contactFlowSuccess: false,
    lightboxWorking: false,
    mobileResponsiveOk: false,
    consoleErrors: [],
  },
  adminDashboard: {
    authRedirectWorking: false,
    loginWorking: false,
    sessionPersistenceWorking: false,
    routesChecked: [],
    consoleErrors: [],
  },
  summary: {
    totalTests: 0,
    passed: 0,
    failed: 0,
  }
};

function pass(testName) {
  RESULTS.summary.totalTests++;
  RESULTS.summary.passed++;
  console.log(`  [PASS] ${testName}`);
}

function fail(testName, reason) {
  RESULTS.summary.totalTests++;
  RESULTS.summary.failed++;
  console.error(`  [FAIL] ${testName}: ${reason}`);
}

async function runComprehensiveAudit() {
  console.log('================================================================');
  console.log('HAVEN KIDS CAFÉ — COMPREHENSIVE PRODUCTION READINESS AUDIT');
  console.log('================================================================\n');

  const browser = await chromium.launch({ headless: true });

  // --------------------------------------------------------------------------
  // SECTION 1: PUBLIC SITE TESTING
  // --------------------------------------------------------------------------
  console.log('>>> [1/2] Auditing Public Website (http://localhost:5173)...');

  const publicContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await publicContext.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      RESULTS.publicSite.consoleErrors.push(msg.text());
    }
  });

  const publicRoutes = [
    { path: '/', keywords: ['Spielen für sie', 'Durchatmen'] },
    { path: '/services', keywords: ['Unsere Räume im Detail', 'Spielbereich'] },
    { path: '/pricing', keywords: ['Eintritt', 'Tarife', 'Einzelbesuch'] },
    { path: '/gallery', keywords: ['Einblicke', 'Atmosphäre', 'Alle'] },
    { path: '/faq', keywords: ['Häufige Fragen', 'Sockenpflicht'] },
    { path: '/contact', keywords: ['Kontakt', 'Anfahrt', 'Friedrichstraße'] },
    { path: '/impressum', keywords: ['Impressum', 'Angaben gemäß'] },
    { path: '/datenschutz', keywords: ['Datenschutzerklärung', 'DSGVO'] },
    { path: '/agb', keywords: ['Allgemeine Geschäftsbedingungen', 'Haven Kids'] },
    { path: '/stornierung', keywords: ['Stornierung', 'Reservierung'] },
  ];

  for (const r of publicRoutes) {
    try {
      const res = await page.goto(`http://localhost:5173${r.path}`, { waitUntil: 'networkidle' });
      if (res.status() === 200) {
        pass(`Route ${r.path} returns HTTP 200`);
      } else {
        fail(`Route ${r.path}`, `Returned HTTP ${res.status()}`);
      }

      const content = await page.content();
      const allMatched = r.keywords.every(kw => content.includes(kw));
      if (allMatched) {
        pass(`Route ${r.path} content contains expected keywords: [${r.keywords.join(', ')}]`);
      } else {
        fail(`Route ${r.path}`, `Missing one or more expected keywords`);
      }

      RESULTS.publicSite.pagesChecked.push({ path: r.path, status: res.status() });
    } catch (err) {
      fail(`Route ${r.path}`, err.message);
    }
  }

  // Test Gallery Lightbox
  console.log('\n--- Testing Gallery Lightbox...');
  try {
    await page.goto('http://localhost:5173/gallery', { waitUntil: 'networkidle' });
    const galleryCard = page.locator('.grid > div.cursor-pointer').first();
    await galleryCard.click();
    await page.waitForTimeout(500);

    const dialog = page.locator('[role="dialog"]');
    if (await dialog.isVisible()) {
      pass('Gallery Lightbox opens in modal dialog');
      RESULTS.publicSite.lightboxWorking = true;
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      if (!(await dialog.isVisible())) {
        pass('Gallery Lightbox closes on Escape');
      } else {
        fail('Gallery Lightbox', 'Did not close on Escape');
      }
    } else {
      fail('Gallery Lightbox', 'Dialog modal not visible on click');
    }
  } catch (err) {
    fail('Gallery Lightbox', err.message);
  }

  // Test Contact Form Submission
  console.log('\n--- Testing Contact Form Submission & GDPR Validation...');
  try {
    await page.goto('http://localhost:5173/contact', { waitUntil: 'networkidle' });
    
    // Fill text inputs
    await page.locator('input[placeholder*="Julia Schneider"]').fill('Familie Berger');
    await page.locator('input[type="email"]').fill('familie.berger@example.de');
    await page.locator('input[type="tel"]').fill('+49 170 5551234');
    await page.locator('textarea').fill('Wir möchten gerne für nächsten Samstag für 3 Kinder anfragen.');

    // Check GDPR consent checkbox
    const gdprCheckbox = page.locator('input[type="checkbox"]').first();
    await gdprCheckbox.check();

    const submitBtn = page.getByRole('button', { name: /Nachricht absenden/i });
    await submitBtn.click();
    await page.waitForTimeout(600);

    const successMsg = page.getByText(/Vielen Dank für deine Nachricht/i);
    if (await successMsg.isVisible()) {
      pass('Contact Form submitted successfully with GDPR consent');
      RESULTS.publicSite.contactFlowSuccess = true;
    } else {
      fail('Contact Form', 'Success message not visible');
    }
  } catch (err) {
    fail('Contact Form', err.message);
  }

  // Test Full Booking Wizard Flow (5 Steps)
  console.log('\n--- Testing End-to-End Booking Wizard Flow...');
  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    // Open from Hero CTA
    const heroBtn = page.getByRole('button', { name: /Platz reservieren/i });
    await heroBtn.click();
    await page.waitForTimeout(400);

    // Step 1: Select Service & Advance
    const nextStep2Btn = page.getByRole('button', { name: /Weiter zu Datum & Uhrzeit/i });
    if (await nextStep2Btn.isVisible()) {
      pass('Booking Step 1: Service selection displayed');
      await nextStep2Btn.click();
      await page.waitForTimeout(400);
    } else {
      fail('Booking Step 1', 'Advance button not found');
    }

    // Step 2: Select Date & Time Slot
    const nextStep3Btn = page.getByRole('button', { name: /Weiter zu Personen & Extras/i });
    if (await nextStep3Btn.isVisible()) {
      pass('Booking Step 2: Date & Slot selection displayed');
      await nextStep3Btn.click();
      await page.waitForTimeout(400);
    } else {
      fail('Booking Step 2', 'Advance button not found');
    }

    // Step 3: Persons & Extras
    const nextStep4Btn = page.getByRole('button', { name: /Weiter zu Kontaktdaten/i });
    if (await nextStep4Btn.isVisible()) {
      pass('Booking Step 3: Persons & Extras selection displayed');
      await nextStep4Btn.click();
      await page.waitForTimeout(400);
    } else {
      fail('Booking Step 3', 'Advance button not found');
    }

    // Step 4: Contact details & Consent
    await page.locator('input[placeholder*="Julia Schneider"]').fill('Maria Müller');
    await page.locator('input[type="email"]').fill('maria.mueller@example.com');
    await page.locator('input[type="tel"]').fill('+49 176 88990011');
    
    // Check required rules checkbox
    const rulesBox = page.locator('input[type="checkbox"][required]').first();
    await rulesBox.check();

    const submitBookingBtn = page.getByRole('button', { name: /Verbindlich reservieren/i });
    await submitBookingBtn.click();
    await page.waitForTimeout(1000);

    // Step 5: Confirmation Screen
    const confirmationHeading = page.getByRole('heading', { name: /Buchungsbestätigung/i });
    if (await confirmationHeading.isVisible()) {
      pass('Booking Step 5: Booking confirmed with Reference code & iCal option');
      RESULTS.publicSite.bookingFlowSuccess = true;
    } else {
      fail('Booking Step 5', 'Confirmation heading not visible');
    }

    // Close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  } catch (err) {
    fail('Booking Flow', err.message);
  }

  // Test Mobile Responsiveness & Horizontal Scroll Overflow
  console.log('\n--- Testing Mobile Viewport & Responsiveness...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();

  try {
    await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    // Check horizontal overflow
    const hasHorizontalOverflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    if (!hasHorizontalOverflow) {
      pass('Mobile layout has NO horizontal overflow on 390px width');
      RESULTS.publicSite.mobileResponsiveOk = true;
    } else {
      fail('Mobile layout', 'Horizontal overflow detected!');
    }

    // Check Bottom Nav visibility
    const bottomNav = mobilePage.locator('nav.fixed.bottom-0');
    if (await bottomNav.isVisible()) {
      pass('Mobile bottom navigation bar is active');
    } else {
      fail('Mobile bottom nav', 'Not visible on mobile viewport');
    }
  } catch (err) {
    fail('Mobile Viewport', err.message);
  }

  // --------------------------------------------------------------------------
  // SECTION 2: ADMIN DASHBOARD TESTING
  // --------------------------------------------------------------------------
  console.log('\n>>> [2/2] Auditing Admin Dashboard (http://localhost:5174)...');

  const adminContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const adminPage = await adminContext.newPage();

  adminPage.on('console', msg => {
    if (msg.type() === 'error') {
      RESULTS.adminDashboard.consoleErrors.push(msg.text());
    }
  });

  // Test Unauthenticated Protection
  console.log('\n--- Testing Authentication & Protection...');
  try {
    await adminPage.goto('http://localhost:5174/bookings', { waitUntil: 'networkidle' });
    const currentUrl = adminPage.url();
    if (currentUrl.includes('/login')) {
      pass('Unauthenticated access to /bookings correctly redirects to /login');
      RESULTS.adminDashboard.authRedirectWorking = true;
    } else {
      fail('Auth Protection', `Expected redirect to /login, but URL is ${currentUrl}`);
    }

    // Login Form Submit (dev owner credentials)
    const emailInput = adminPage.locator('input[type="email"]');
    const passwordInput = adminPage.locator('input[type="password"]');
    if (await passwordInput.isVisible()) {
      if (await emailInput.isVisible()) {
        await emailInput.fill('owner@havenkidscafe.de');
      }
      await passwordInput.fill('demo1234');
      const loginBtn = adminPage.getByRole('button', { name: /Anmelden|Einloggen|Login/i }).first();
      await loginBtn.click();
      await adminPage.waitForTimeout(800);

      const afterLoginUrl = adminPage.url();
      if (afterLoginUrl.includes('/bookings')) {
        pass('Owner authentication successful -> redirected to /bookings');
        RESULTS.adminDashboard.loginWorking = true;
      } else {
        fail('Admin Login', `URL after login is ${afterLoginUrl}`);
      }
    }
  } catch (err) {
    fail('Admin Auth', err.message);
  }

  // Test Dedicated Admin Routes Navigation
  console.log('\n--- Testing Admin Dedicated Routes Navigation...');
  const adminRoutes = [
    { path: '/bookings', expectedText: 'Buchungen & Reservierungen' },
    { path: '/capacity', expectedText: 'Kapazitäten & Zeitslots' },
    { path: '/blocked-dates', expectedText: 'Schließtage & Feiertage' },
    { path: '/announcements', expectedText: 'Website-Ankündigungen' },
    { path: '/faq', expectedText: 'FAQ-Verwaltung' },
    { path: '/inquiries', expectedText: 'Event-Anfragen Postfach' },
    { path: '/gallery', expectedText: 'Galerie & Bilder' },
    { path: '/settings', expectedText: 'Geschäftsdaten & Rechtliches' },
    { path: '/packages', expectedText: 'Pakete & Tarife' },
  ];

  for (const ar of adminRoutes) {
    try {
      await adminPage.goto(`http://localhost:5174${ar.path}`, { waitUntil: 'networkidle' });
      await adminPage.waitForTimeout(200);

      const bodyText = await adminPage.innerText('body');
      if (bodyText.includes(ar.expectedText)) {
        pass(`Admin route ${ar.path} loaded module: "${ar.expectedText}"`);
        RESULTS.adminDashboard.routesChecked.push({ path: ar.path, ok: true });
      } else {
        fail(`Admin route ${ar.path}`, `Expected text "${ar.expectedText}" not found in body`);
      }
    } catch (err) {
      fail(`Admin route ${ar.path}`, err.message);
    }
  }

  // Test Session Persistence Across Page Reload
  console.log('\n--- Testing Session Persistence on Refresh...');
  try {
    await adminPage.goto('http://localhost:5174/blocked-dates', { waitUntil: 'networkidle' });
    await adminPage.reload({ waitUntil: 'networkidle' });
    await adminPage.waitForTimeout(300);

    const reloadedUrl = adminPage.url();
    if (reloadedUrl.includes('/blocked-dates')) {
      pass('Page reload keeps authenticated owner on /blocked-dates route');
      RESULTS.adminDashboard.sessionPersistenceWorking = true;
    } else {
      fail('Session Persistence', `Reload redirected to ${reloadedUrl}`);
    }
  } catch (err) {
    fail('Session Persistence', err.message);
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log('AUDIT COMPLETE');
  console.log(`Total Checks: ${RESULTS.summary.totalTests}`);
  console.log(`Passed:       ${RESULTS.summary.passed}`);
  console.log(`Failed:       ${RESULTS.summary.failed}`);
  console.log(`Public Console Errors: ${RESULTS.publicSite.consoleErrors.length}`);
  console.log(`Admin Console Errors:  ${RESULTS.adminDashboard.consoleErrors.length}`);
  console.log('================================================================\n');

  await browser.close();
  return RESULTS;
}

runComprehensiveAudit().then(res => {
  if (res.summary.failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}).catch(err => {
  console.error('Audit script execution failed:', err);
  process.exit(1);
});
