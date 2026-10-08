import { chromium } from 'playwright';
import path from 'path';

const OUT_DIR = 'C:/Users/musta/.gemini/antigravity-ide/brain/e9a067cb-39e1-405f-832b-fa3e9c79f3b1/lightbox_tests';

async function captureHomeSections() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
  });

  await page.addInitScript(() => {
    localStorage.setItem('haven_kids_cookie_consent', 'essential');
  });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  // Scroll to Wichtige Infos
  const rules = page.locator('#rules');
  await rules.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT_DIR, 'home_rules_carousel_375.png') });

  // Scroll to Gallery Strip
  const galleryStrip = page.locator('text=Einblicke in unsere Wohlfühl-Oase').locator('..');
  await galleryStrip.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT_DIR, 'home_gallery_strip_375.png') });

  await browser.close();
}

captureHomeSections().catch(console.error);
