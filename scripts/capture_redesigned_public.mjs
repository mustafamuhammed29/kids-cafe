import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/musta/.gemini/antigravity-ide/brain/e9a067cb-39e1-405f-832b-fa3e9c79f3b1';

async function capture() {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop
  const contextDesktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const pageDesktop = await contextDesktop.newPage();
  
  const consoleErrors = [];
  pageDesktop.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await pageDesktop.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await pageDesktop.waitForTimeout(1000);

  // Capture hero viewport
  await pageDesktop.screenshot({
    path: path.join(ARTIFACT_DIR, 'public_home_desktop_hero.png'),
    fullPage: false,
  });

  // Capture full page
  await pageDesktop.screenshot({
    path: path.join(ARTIFACT_DIR, 'public_home_desktop_full.png'),
    fullPage: true,
  });

  console.log('Desktop screenshots captured. Console errors:', consoleErrors.length);

  // 2. Mobile
  const contextMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const pageMobile = await contextMobile.newPage();
  await pageMobile.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await pageMobile.waitForTimeout(1000);

  await pageMobile.screenshot({
    path: path.join(ARTIFACT_DIR, 'public_home_mobile_hero.png'),
    fullPage: false,
  });

  await pageMobile.screenshot({
    path: path.join(ARTIFACT_DIR, 'public_home_mobile_full.png'),
    fullPage: true,
  });

  console.log('Mobile screenshots captured.');

  await browser.close();
}

capture().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
