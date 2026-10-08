import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const outDir = 'C:/Users/musta/.gemini/antigravity-ide/brain/e9a067cb-39e1-405f-832b-fa3e9c79f3b1/qa_screenshots';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const VIEWPORTS = [
  { name: '360x800', width: 360, height: 800 },
  { name: '375x812', width: 375, height: 812 },
  { name: '390x844', width: 390, height: 844 },
  { name: '414x896', width: 414, height: 896 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1440x900', width: 1440, height: 900 },
];

async function runQa() {
  const browser = await chromium.launch({ headless: true });
  const results = {
    lightboxTests: [],
    screenshotsCaptured: [],
    adminSingleOwnerVerified: false,
    failures: []
  };

  // 1. Run Lightbox Bounding Box Assertions across ALL 6 viewports
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('haven_kids_cookie_consent', 'essential');
    });

    await page.goto('http://localhost:5173/gallery', { waitUntil: 'networkidle' });
    await page.waitForTimeout(200);

    // Open first image
    const firstCard = page.locator('.grid > div').first();
    await firstCard.click();
    await page.waitForTimeout(400);

    const dialog = page.locator('[role="dialog"]').first();
    const modalBox = await dialog.locator('.relative.max-w-4xl').first().boundingBox();

    const isInsideViewport =
      modalBox &&
      modalBox.x >= -2 &&
      modalBox.y >= 0 &&
      (modalBox.x + modalBox.width) <= (vp.width + 5) &&
      (modalBox.y + modalBox.height) <= (vp.height + 5);

    const testEntry = {
      viewport: vp.name,
      width: vp.width,
      height: vp.height,
      box: modalBox ? { x: Math.round(modalBox.x), y: Math.round(modalBox.y), w: Math.round(modalBox.width), h: Math.round(modalBox.height) } : null,
      passed: !!isInsideViewport
    };
    results.lightboxTests.push(testEntry);

    if (!isInsideViewport) {
      results.failures.push(`Lightbox clipped on viewport ${vp.name}: ${JSON.stringify(modalBox)}`);
    }

    // Capture screenshot of open lightbox on 375x812 and 1440x900
    if (vp.name === '375x812' || vp.name === '1440x900') {
      const imgPath = path.join(outDir, `gallery_lightbox_${vp.name}.png`);
      await page.screenshot({ path: imgPath });
      results.screenshotsCaptured.push(imgPath);
    }

    await context.close();
  }

  // 2. Capture representative screenshots for Public Routes (Mobile 375x812 & Desktop 1440x900)
  for (const vp of [{ name: '375x812', width: 375, height: 812 }, { name: '1440x900', width: 1440, height: 900 }]) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('haven_kids_cookie_consent', 'essential');
    });

    const publicRoutes = [
      { path: '/', name: 'home' },
      { path: '/services', name: 'services' },
      { path: '/pricing', name: 'pricing' },
      { path: '/faq', name: 'faq' },
      { path: '/contact', name: 'contact' },
    ];

    for (const route of publicRoutes) {
      await page.goto(`http://localhost:5173${route.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(200);
      const imgPath = path.join(outDir, `${route.name}_${vp.name}.png`);
      await page.screenshot({ path: imgPath });
      results.screenshotsCaptured.push(imgPath);
    }

    await context.close();
  }

  // 3. Admin Route Verification & Screenshots (Mobile 375x812 & Desktop 1440x900)
  for (const vp of [{ name: '375x812', width: 375, height: 812 }, { name: '1440x900', width: 1440, height: 900 }]) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 });
    const page = await context.newPage();

    // Login page screenshot
    await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle' });
    const loginImgPath = path.join(outDir, `admin_login_${vp.name}.png`);
    await page.screenshot({ path: loginImgPath });
    results.screenshotsCaptured.push(loginImgPath);

    // Click owner quick dev login and submit
    const ownerBtn = page.locator('button:has-text("Owner-Zugangsdaten einfügen")');
    if (await ownerBtn.isVisible()) {
      await ownerBtn.click();
      await page.waitForTimeout(200);
      await page.locator('button[type="submit"]:has-text("Anmelden")').click();
      await page.waitForTimeout(500);
    }

    // Dashboard screenshot as Owner
    const dashImgPath = path.join(outDir, `admin_dashboard_owner_${vp.name}.png`);
    await page.screenshot({ path: dashImgPath });
    results.screenshotsCaptured.push(dashImgPath);

    // Verify Owner role displayed
    const hasOwnerBadge = await page.locator('header').locator('text=Inhaber (Owner)').first().isVisible();
    if (hasOwnerBadge) {
      results.adminSingleOwnerVerified = true;
    }

    await context.close();
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

runQa().catch((err) => {
  console.error(err);
  process.exit(1);
});
