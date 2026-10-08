import { chromium } from 'playwright';
import path from 'path';
import os from 'os';
import fs from 'fs';

async function testSessionPersistence() {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'playwright-haven-user-data-'));
  
  const results = {
    step1_unauthenticatedRedirect: false,
    step2_loginSuccess: false,
    step3_refreshKeepsSession: false,
    step4_browserReopenKeepsSession: false,
    step5_newTabKeepsSession: false,
    step6_signOutClearsSession: false,
    failures: []
  };

  // Launch browser with persistent context to accurately simulate closing and reopening browser
  let context = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    viewport: { width: 1440, height: 900 }
  });

  let page = await context.newPage();

  try {
    // --- 1. UNAUTHENTICATED ATTEMPT ---
    await page.goto('http://localhost:5174/bookings', { waitUntil: 'networkidle' });
    if (page.url().includes('/login')) {
      results.step1_unauthenticatedRedirect = true;
    } else {
      results.failures.push(`Expected redirect to /login, got: ${page.url()}`);
    }

    // --- 2. LOGIN AS OWNER ---
    await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle' });
    await page.locator('button:has-text("Owner-Zugangsdaten einfügen")').click();
    await page.waitForTimeout(100);
    await page.locator('button[type="submit"]:has-text("Anmelden")').click();
    await page.waitForTimeout(600);

    if (page.url().includes('/bookings')) {
      results.step2_loginSuccess = true;
    } else {
      results.failures.push(`Expected redirect to /bookings after login, got: ${page.url()}`);
    }

    // --- 3. REFRESH IN SAME TAB ---
    await page.goto('http://localhost:5174/capacity', { waitUntil: 'networkidle' });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    const isCapacityVisible = await page.locator('text=Zeitslot-Aktivierung').first().isVisible();
    if (page.url().endsWith('/capacity') && isCapacityVisible) {
      results.step3_refreshKeepsSession = true;
    } else {
      results.failures.push(`Refresh on /capacity failed. URL: ${page.url()}, capacity visible: ${isCapacityVisible}`);
    }

    // --- 4. NEW TAB IN SAME BROWSER ---
    const page2 = await context.newPage();
    await page2.goto('http://localhost:5174/gallery', { waitUntil: 'networkidle' });
    const isGalleryVisible = await page2.locator('text=Galerie').first().isVisible();
    if (page2.url().endsWith('/gallery') && isGalleryVisible) {
      results.step5_newTabKeepsSession = true;
    } else {
      results.failures.push(`New tab visit to /gallery failed. URL: ${page2.url()}, gallery visible: ${isGalleryVisible}`);
    }
    await page2.close();

    // --- 5. SIMULATE CLOSING AND REOPENING BROWSER ---
    // Close context completely
    await context.close();

    // Reopen browser with the same persistent userDataDir
    context = await chromium.launchPersistentContext(userDataDir, {
      headless: true,
      viewport: { width: 1440, height: 900 }
    });
    page = await context.newPage();

    // Directly open protected route after reopening browser
    await page.goto('http://localhost:5174/blocked-dates', { waitUntil: 'networkidle' });
    const isBlockedDatesVisible = await page.locator('text=Schließtage & Betriebsruhe').first().isVisible();
    if (page.url().endsWith('/blocked-dates') && isBlockedDatesVisible) {
      results.step4_browserReopenKeepsSession = true;
    } else {
      results.failures.push(`Reopening browser lost session! URL: ${page.url()}, blocked dates visible: ${isBlockedDatesVisible}`);
    }

    // --- 6. EXPLICIT SIGN OUT ---
    const logoutBtn = page.locator('button:has-text("Abmelden")');
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await page.waitForTimeout(500);
      if (page.url().includes('/login')) {
        // Now try visiting /bookings again - must redirect to /login
        await page.goto('http://localhost:5174/bookings', { waitUntil: 'networkidle' });
        if (page.url().includes('/login')) {
          results.step6_signOutClearsSession = true;
        } else {
          results.failures.push(`After sign out, /bookings did not redirect to /login. URL: ${page.url()}`);
        }
      } else {
        results.failures.push(`Clicking Abmelden did not redirect to /login. URL: ${page.url()}`);
      }
    } else {
      results.failures.push('Logout button was not visible.');
    }

  } finally {
    await context.close();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch (e) {
      // ignore cleanup errors
    }
  }

  console.log(JSON.stringify(results, null, 2));
  if (results.failures.length > 0) {
    process.exit(1);
  }
}

testSessionPersistence().catch((err) => {
  console.error(err);
  process.exit(1);
});
