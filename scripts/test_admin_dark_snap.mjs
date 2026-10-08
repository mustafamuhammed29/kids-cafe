import { chromium } from 'playwright';

const browser = await chromium.launch();
const mobilePage = await browser.newPage({ viewport: { width: 375, height: 812 } });

await mobilePage.goto('http://localhost:5174/login', { waitUntil: 'networkidle' });
const mobileDevFill = await mobilePage.getByRole('button', { name: 'Owner-Zugangsdaten einfügen' });
if (await mobileDevFill.isVisible()) {
  await mobileDevFill.click();
  await mobilePage.waitForTimeout(200);
  const mobileLoginSubmit = await mobilePage.getByRole('button', { name: 'Im Dashboard anmelden' });
  if (await mobileLoginSubmit.isVisible()) {
    await mobileLoginSubmit.click();
    await mobilePage.waitForTimeout(800);
  }
}

// Scroll down to see cards
await mobilePage.evaluate(() => window.scrollBy(0, 500));
await mobilePage.waitForTimeout(300);
await mobilePage.screenshot({ path: 'C:/Users/musta/.gemini/antigravity-ide/brain/e9a067cb-39e1-405f-832b-fa3e9c79f3b1/dark_dashboard_mobile_cards.png' });

// Open mobile drawer
const menuBtn = await mobilePage.getByRole('button', { name: 'Menü öffnen' });
if (await menuBtn.isVisible()) {
  await menuBtn.click();
  await mobilePage.waitForTimeout(400);
  await mobilePage.screenshot({ path: 'C:/Users/musta/.gemini/antigravity-ide/brain/e9a067cb-39e1-405f-832b-fa3e9c79f3b1/dark_dashboard_mobile_drawer.png' });
  // Close menu
  await mobilePage.keyboard.press('Escape');
  await mobilePage.waitForTimeout(300);
}

// Click on Details of first booking
const detailsBtn = await mobilePage.locator('button:has-text("Details & Status")').first();
if (await detailsBtn.isVisible()) {
  await detailsBtn.click();
  await mobilePage.waitForTimeout(400);
  await mobilePage.screenshot({ path: 'C:/Users/musta/.gemini/antigravity-ide/brain/e9a067cb-39e1-405f-832b-fa3e9c79f3b1/dark_dashboard_booking_modal.png' });
}

await browser.close();
