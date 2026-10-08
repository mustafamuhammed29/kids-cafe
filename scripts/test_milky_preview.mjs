import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/musta/.gemini/antigravity-ide/brain/e9a067cb-39e1-405f-832b-fa3e9c79f3b1';

async function previewMilky() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // Apply warm milky tone via CSS injection to preview
  await page.addStyleTag({
    content: `
      body, html {
        background-color: #FAF8F5 !important;
      }
      .bg-slate-50\\/50, .bg-slate-50 {
        background-color: #FAF8F5 !important;
      }
      .from-sky-50\\/70 {
        --tw-gradient-from: #FDFBF7 !important;
      }
      .to-slate-50 {
        --tw-gradient-to: #FAF8F5 !important;
      }
    `
  });

  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'milky_desktop_hero_preview.png'),
    fullPage: false,
  });

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'milky_desktop_full_preview.png'),
    fullPage: true,
  });

  console.log('Milky preview screenshots generated successfully.');
  await browser.close();
}

previewMilky().catch(err => {
  console.error(err);
  process.exit(1);
});
