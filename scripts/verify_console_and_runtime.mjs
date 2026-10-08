import { chromium } from 'playwright';

async function testRuntime() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`[CONSOLE ERROR] ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => {
    errors.push(`[PAGE ERROR] ${err.message}`);
  });

  console.log('Testing Admin Dashboard (http://localhost:5174/)...');
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle' });

  // Log in as Owner
  const ownerBtn = await page.$('button:has-text("Owner")');
  if (ownerBtn) {
    await ownerBtn.click();
    await page.waitForTimeout(300);
    await page.click('button:has-text("Anmelden")');
    await page.waitForTimeout(1000);
  }

  // Iterate all tabs
  const tabs = [
    'Buchungen',
    'Geschäftsdaten',
    'Pakete & Tarife',
    'Schließtage & Slots',
    'Ankündigungen',
    'FAQ-Verwaltung',
    'Anfragen-Postfach',
    'Galerie',
  ];

  for (const tab of tabs) {
    const btn = await page.$(`button:has-text("${tab}")`);
    if (btn) {
      await btn.click();
      await page.waitForTimeout(400);
      console.log(`  Tab "${tab}" loaded successfully.`);
    }
  }

  console.log('\nTesting Public Site Routes (http://localhost:5173/)...');
  const routes = ['/', '/services', '/pricing', '/gallery', '/faq', '/contact'];
  for (const route of routes) {
    await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    console.log(`  Route "${route}" loaded successfully.`);
  }

  await browser.close();

  console.log('\n----------------------------------------');
  console.log(`Total Errors Detected: ${errors.length}`);
  if (errors.length > 0) {
    errors.forEach((e) => console.error(e));
    process.exit(1);
  } else {
    console.log('Zero runtime errors across all admin tabs and public pages!');
  }
}

testRuntime().catch((e) => {
  console.error('Runtime check error:', e);
  process.exit(1);
});
