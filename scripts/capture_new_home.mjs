import { chromium } from 'playwright';

async function capture() {
  const browser = await chromium.launch({ headless: true });
  
  // Desktop
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    localStorage.setItem('haven_kids_cookie_consent', 'essential');
  });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/musta/.gemini/antigravity-ide/brain/e9a067cb-39e1-405f-832b-fa3e9c79f3b1/home_hero_restored_1440.png' });

  // Mobile
  const mobilePage = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
  await mobilePage.addInitScript(() => {
    localStorage.setItem('haven_kids_cookie_consent', 'essential');
  });
  await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: 'C:/Users/musta/.gemini/antigravity-ide/brain/e9a067cb-39e1-405f-832b-fa3e9c79f3b1/home_hero_restored_375.png' });

  await browser.close();
}

capture().catch(console.error);
