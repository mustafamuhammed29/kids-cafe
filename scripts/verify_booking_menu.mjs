import { chromium } from 'playwright';
import path from 'path';

const OUT_DIR = 'C:/Users/musta/.gemini/antigravity-ide/brain/e9a067cb-39e1-405f-832b-fa3e9c79f3b1/lightbox_tests';

async function verifyBookingAndMenu() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    localStorage.setItem('haven_kids_cookie_consent', 'essential');
  });

  // 1. Check Homepage carousels (Wichtige Infos & Gallery strip)
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(OUT_DIR, 'home_carousels_375.png') });
  console.log('Homepage carousels captured');

  // 2. Open Mobile Hamburger Menu
  const hamburgerBtn = page.locator('button[aria-label="Navigation umschalten"]').first();
  await hamburgerBtn.click();
  await page.waitForTimeout(350);

  // Assert bottom nav is hidden
  const bottomNavCount = await page.locator('nav[aria-label="Mobile Navigation"]').count();
  console.log('Bottom nav count while hamburger open:', bottomNavCount); // Should be 0

  await page.screenshot({ path: path.join(OUT_DIR, 'mobile_menu_open_375.png') });

  // Close menu
  await hamburgerBtn.click();
  await page.waitForTimeout(350);

  // 3. Open Booking Wizard Modal
  const bookBtn = page.locator('button:has-text("Platz reservieren")').first();
  await bookBtn.click();
  await page.waitForTimeout(400);

  // Assert bottom nav is hidden
  const bottomNavCountWithModal = await page.locator('nav[aria-label="Mobile Navigation"]').count();
  console.log('Bottom nav count while booking open:', bottomNavCountWithModal); // Should be 0

  await page.screenshot({ path: path.join(OUT_DIR, 'booking_bottom_sheet_step1_375.png') });

  // Click next to Step 2
  const nextBtn = page.locator('button:has-text("Weiter zu Datum & Uhrzeit")');
  await nextBtn.click();
  await page.waitForTimeout(200);

  await page.screenshot({ path: path.join(OUT_DIR, 'booking_bottom_sheet_step2_375.png') });

  // 4. Check Gallery cards on mobile (<480px and >=480px)
  await page.goto('http://localhost:5173/gallery', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(OUT_DIR, 'gallery_cards_375.png') });

  // Resize to 480px to verify 2-column grid
  await page.setViewportSize({ width: 500, height: 750 });
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT_DIR, 'gallery_cards_500px_2col.png') });

  await browser.close();
}

verifyBookingAndMenu().catch((err) => {
  console.error(err);
  process.exit(1);
});
