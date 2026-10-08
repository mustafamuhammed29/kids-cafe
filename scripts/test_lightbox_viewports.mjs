import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const VIEWPORTS = [
  // 360 px
  { name: '360_portrait', width: 360, height: 640 },
  { name: '360_landscape', width: 640, height: 360 },

  // 375 px
  { name: '375_portrait', width: 375, height: 667 },
  { name: '375_landscape', width: 667, height: 375 },

  // 390 px
  { name: '390_portrait', width: 390, height: 844 },
  { name: '390_landscape', width: 844, height: 390 },

  // 414 px
  { name: '414_portrait', width: 414, height: 896 },
  { name: '414_landscape', width: 896, height: 414 },

  // 768 px
  { name: '768_portrait', width: 768, height: 1024 },
  { name: '768_landscape', width: 1024, height: 768 },

  // 1024 px
  { name: '1024_portrait', width: 1024, height: 1366 },
  { name: '1024_landscape', width: 1366, height: 1024 },

  // 1440 px
  { name: '1440_landscape', width: 1440, height: 900 },
  { name: '1440_portrait', width: 900, height: 1440 },
];

const OUT_DIR = 'C:/Users/musta/.gemini/antigravity-ide/brain/e9a067cb-39e1-405f-832b-fa3e9c79f3b1/lightbox_tests';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    // Cookie consent bypass
    await page.addInitScript(() => {
      localStorage.setItem('haven_kids_cookie_consent', 'essential');
    });

    await page.goto('http://localhost:5173/gallery', { waitUntil: 'networkidle' });

    // Click first gallery item
    const firstCard = page.locator('.grid > div').first();
    await firstCard.waitFor({ state: 'visible' });
    await firstCard.click();

    // Wait for dialog overlay
    const overlay = page.locator('[role="dialog"]').first();
    await overlay.waitFor({ state: 'visible' });

    // Get dialog inner card
    const modalContent = page.locator('[role="dialog"] > div').first();
    const box = await modalContent.boundingBox();

    if (!box) {
      results.push({ ...vp, pass: false, error: 'Could not obtain modal bounding box' });
      await context.close();
      continue;
    }

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    const expectedCenterX = vp.width / 2;
    const expectedCenterY = vp.height / 2;

    const diffX = Math.abs(centerX - expectedCenterX);
    const diffY = Math.abs(centerY - expectedCenterY);

    const insideX = box.x >= 0 && (box.x + box.width) <= vp.width + 1;
    const insideY = box.y >= 0 && (box.y + box.height) <= vp.height + 1;
    const isCentered = diffX <= 6 && diffY <= 6;
    const pass = insideX && insideY && isCentered;

    const screenshotPath = path.join(OUT_DIR, `${vp.name}.png`);
    await page.screenshot({ path: screenshotPath });

    results.push({
      ...vp,
      box,
      diffX: diffX.toFixed(2),
      diffY: diffY.toFixed(2),
      insideX,
      insideY,
      isCentered,
      pass,
      screenshot: screenshotPath,
    });

    // Test ESC closes the modal
    await page.keyboard.press('Escape');
    await overlay.waitFor({ state: 'detached', timeout: 3000 });

    await context.close();
  }

  await browser.close();

  console.log(JSON.stringify(results, null, 2));
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
