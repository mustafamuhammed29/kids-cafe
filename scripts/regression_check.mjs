import { chromium } from 'playwright';

async function runRegressionCheck() {
  const browser = await chromium.launch({ headless: true });
  const results = {
    overlayBehavior: { pass: true, notes: [] },
    mobileMenuBehavior: { pass: true, notes: [] },
    bookingFlowBehavior: { pass: true, notes: [] },
    galleryBehavior: { pass: true, notes: [] },
    scrollLocking: { pass: true, notes: [] },
    zIndexCollisions: { pass: true, notes: [] },
    desktopMobileParity: { pass: true, notes: [] },
  };

  // Helper to init page with cookie consent bypassed
  async function createPage(viewport) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('haven_kids_cookie_consent', 'essential');
    });
    return { page, context };
  }

  // --- 1. MOBILE TEST SUITE (375x667) ---
  {
    const { page, context } = await createPage({ width: 375, height: 667 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    // TEST: Mobile Bottom Nav presence on mobile
    const bottomNavInitial = await page.locator('nav[aria-label="Mobile Navigation"]').isVisible();
    if (!bottomNavInitial) {
      results.desktopMobileParity.pass = false;
      results.desktopMobileParity.notes.push('Mobile bottom nav not visible initially on mobile');
    } else {
      results.desktopMobileParity.notes.push('Mobile bottom nav visible on mobile view');
    }

    // TEST: Mobile Menu Toggle & Scroll Locking
    const hamburger = page.locator('button[aria-label="Navigation umschalten"]');
    await hamburger.click();
    await page.waitForTimeout(300);

    const menuOpenOverflow = await page.evaluate(() => document.body.style.overflow);
    const bottomNavHiddenInMenu = !(await page.locator('nav[aria-label="Mobile Navigation"]').isVisible());

    if (menuOpenOverflow !== 'hidden') {
      results.scrollLocking.pass = false;
      results.scrollLocking.notes.push(`Menu open body overflow expected 'hidden', got '${menuOpenOverflow}'`);
    } else {
      results.scrollLocking.notes.push('Menu open locks body overflow to hidden');
    }

    if (!bottomNavHiddenInMenu) {
      results.mobileMenuBehavior.pass = false;
      results.mobileMenuBehavior.notes.push('Bottom nav was still visible while hamburger menu was open');
    } else {
      results.mobileMenuBehavior.notes.push('Bottom nav correctly hidden while hamburger menu is open');
    }

    // TEST: ESC key closes mobile menu
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const menuClosedOverflow = await page.evaluate(() => document.body.style.overflow);
    if (menuClosedOverflow !== '') {
      results.scrollLocking.pass = false;
      results.scrollLocking.notes.push(`Menu close via ESC did not restore body overflow: '${menuClosedOverflow}'`);
    } else {
      results.scrollLocking.notes.push('ESC closes mobile menu and restores body overflow');
    }

    // TEST: Booking Flow Bottom Sheet & Sticky CTA
    const bookBtn = page.locator('button:has-text("Platz reservieren")').first();
    await bookBtn.click();
    await page.waitForTimeout(400);

    const bookingModal = page.locator('[role="dialog"]').first();
    const isBookingVisible = await bookingModal.isVisible();
    const bottomNavHiddenInBooking = !(await page.locator('nav[aria-label="Mobile Navigation"]').isVisible());
    const bookingOverflow = await page.evaluate(() => document.body.style.overflow);

    // Assert rendered via portal directly on document.body
    const isDirectBodyChild = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return dialog && dialog.parentElement === document.body;
    });

    if (!isDirectBodyChild) {
      results.overlayBehavior.pass = false;
      results.overlayBehavior.notes.push('Booking dialog is NOT a direct child of document.body');
    } else {
      results.overlayBehavior.notes.push('Booking dialog rendered via Portal directly on document.body');
    }

    if (!isBookingVisible || !bottomNavHiddenInBooking || bookingOverflow !== 'hidden') {
      results.bookingFlowBehavior.pass = false;
      results.bookingFlowBehavior.notes.push('Booking modal open checks failed (visibility, bottom nav hiding, or scroll lock)');
    } else {
      results.bookingFlowBehavior.notes.push('Booking modal opens as bottom sheet, locks scroll, and hides bottom nav');
    }

    // Step 1 -> Step 2
    const nextToStep2 = page.locator('button:has-text("Weiter zu Datum & Uhrzeit")');
    await nextToStep2.click();
    await page.waitForTimeout(300);

    // Step 2 -> Step 3
    const nextToStep3 = page.locator('button:has-text("Weiter zu Personen & Extras")');
    await nextToStep3.click();
    await page.waitForTimeout(300);

    // Step 3 -> Back to Step 2
    const backToStep2 = page.locator('button:has-text("Zurück")');
    await backToStep2.click();
    await page.waitForTimeout(300);

    const onStep2 = await page.locator('text=Datum & Zeitslot wählen').isVisible();
    if (!onStep2) {
      results.bookingFlowBehavior.pass = false;
      results.bookingFlowBehavior.notes.push('Step backward navigation in booking wizard failed');
    } else {
      results.bookingFlowBehavior.notes.push('Multi-step booking wizard navigation (forward & backward) works seamlessly');
    }

    // Close booking modal via ESC
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const bookingClosedOverflow = await page.evaluate(() => document.body.style.overflow);
    if (bookingClosedOverflow !== '') {
      results.scrollLocking.pass = false;
      results.scrollLocking.notes.push(`Closing booking did not restore body overflow: '${bookingClosedOverflow}'`);
    } else {
      results.scrollLocking.notes.push('Closing booking restores body overflow cleanly');
    }

    // --- 2. GALLERY TEST SUITE ---
    await page.goto('http://localhost:5173/gallery', { waitUntil: 'networkidle' });

    // Category filter test
    const cafeFilter = page.locator('button:has-text("Café")').first();
    await cafeFilter.click();
    await page.waitForTimeout(200);
    const cafeCard = page.locator('text=Eltern-Café & Specialty Coffee').first();
    const isCafeVisible = await cafeCard.isVisible();
    if (!isCafeVisible) {
      results.galleryBehavior.pass = false;
      results.galleryBehavior.notes.push('Gallery category filter failed to show filtered items');
    } else {
      results.galleryBehavior.notes.push('Gallery category filtering operates reactively');
    }

    // Reset filter
    await page.locator('button:has-text("Alle")').first().click();
    await page.waitForTimeout(200);

    // Open Lightbox
    const firstGalleryCard = page.locator('.grid > div').first();
    await firstGalleryCard.click();
    await page.waitForTimeout(300);

    const lightboxDirectBodyChild = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return dialog && dialog.parentElement === document.body;
    });

    if (!lightboxDirectBodyChild) {
      results.galleryBehavior.pass = false;
      results.galleryBehavior.notes.push('Lightbox is NOT a direct child of document.body');
    } else {
      results.galleryBehavior.notes.push('Lightbox rendered via Portal directly on document.body');
    }

    const lightboxOverflow = await page.evaluate(() => document.body.style.overflow);
    if (lightboxOverflow !== 'hidden') {
      results.scrollLocking.pass = false;
      results.scrollLocking.notes.push('Lightbox did not set body overflow to hidden');
    } else {
      results.scrollLocking.notes.push('Lightbox locks body scroll');
    }

    // Close Lightbox via ESC
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const lightboxClosedOverflow = await page.evaluate(() => document.body.style.overflow);
    if (lightboxClosedOverflow !== '') {
      results.scrollLocking.pass = false;
      results.scrollLocking.notes.push('Closing lightbox did not restore body overflow');
    } else {
      results.scrollLocking.notes.push('Closing lightbox restores body overflow');
    }

    await context.close();
  }

  // --- 3. DESKTOP PARITY TEST SUITE (1440x900) ---
  {
    const { page, context } = await createPage({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    // Desktop nav items visible
    const desktopLinksVisible = await page.locator('nav a:has-text("Angebote")').first().isVisible();
    const desktopBookBtnVisible = await page.locator('nav button:has-text("Besuch buchen")').first().isVisible();
    const bottomNavOnDesktop = await page.locator('nav[aria-label="Mobile Navigation"]').isVisible();
    const hamburgerOnDesktop = await page.locator('button[aria-label="Navigation umschalten"]').isVisible();

    if (!desktopLinksVisible || !desktopBookBtnVisible) {
      results.desktopMobileParity.pass = false;
      results.desktopMobileParity.notes.push('Desktop header links or CTA not visible on desktop');
    } else {
      results.desktopMobileParity.notes.push('Desktop header links & CTA displayed cleanly');
    }

    if (bottomNavOnDesktop) {
      results.desktopMobileParity.pass = false;
      results.desktopMobileParity.notes.push('Mobile bottom nav incorrectly visible on desktop');
    } else {
      results.desktopMobileParity.notes.push('Mobile bottom nav correctly hidden on desktop');
    }

    if (hamburgerOnDesktop) {
      results.desktopMobileParity.pass = false;
      results.desktopMobileParity.notes.push('Mobile hamburger button visible on desktop');
    } else {
      results.desktopMobileParity.notes.push('Hamburger button correctly hidden on desktop');
    }

    // Desktop booking wizard centered dialog test
    await page.locator('nav button:has-text("Besuch buchen")').click();
    await page.waitForTimeout(300);

    const desktopModal = page.locator('[role="dialog"] > div').first();
    const box = await desktopModal.boundingBox();
    const centerX = box.x + box.width / 2;
    const diffX = Math.abs(centerX - 1440 / 2);

    if (diffX > 5) {
      results.bookingFlowBehavior.pass = false;
      results.bookingFlowBehavior.notes.push(`Desktop booking dialog not horizontally centered: diffX = ${diffX}`);
    } else {
      results.bookingFlowBehavior.notes.push('Desktop booking dialog is perfectly centered on desktop');
    }

    await page.keyboard.press('Escape');
    await context.close();
  }

  // --- 4. RESIZE FROM MOBILE OPEN MENU TO DESKTOP PARITY TEST ---
  {
    const { page, context } = await createPage({ width: 375, height: 667 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    // Open mobile menu
    await page.locator('button[aria-label="Navigation umschalten"]').click();
    await page.waitForTimeout(200);

    // Expand viewport to desktop width
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(300);

    const overflowAfterResize = await page.evaluate(() => document.body.style.overflow);
    if (overflowAfterResize !== '') {
      results.desktopMobileParity.pass = false;
      results.desktopMobileParity.notes.push(`Resizing from mobile open menu to desktop left overflow as '${overflowAfterResize}'`);
    } else {
      results.desktopMobileParity.notes.push('Resizing from open mobile menu to desktop automatically dismisses menu and unlocks body scroll');
    }

    await context.close();
  }

  await browser.close();

  console.log(JSON.stringify(results, null, 2));
}

runRegressionCheck().catch((err) => {
  console.error(err);
  process.exit(1);
});
