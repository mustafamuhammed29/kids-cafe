import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/musta/.gemini/antigravity-ide/brain/418e4a79-e5ea-4a2f-bd0f-fb8caccf94ba/.tempmediaStorage';

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to Admin Dashboard http://localhost:5174/ ...');
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle' });

  // 1. Log in as Owner
  console.log('Logging in as Owner...');
  const ownerBtn = await page.$('button:has-text("Owner")');
  if (ownerBtn) {
    await ownerBtn.click();
    await page.waitForTimeout(300);
    await page.click('button:has-text("Anmelden")');
    await page.waitForTimeout(1000);
  }

  // 2. Admin Gallery Tab (Owner view)
  console.log('Navigating to Galerie tab...');
  await page.click('button:has-text("Galerie")');
  await page.waitForTimeout(700);
  const shot1 = path.join(ARTIFACT_DIR, `batch_c_admin_gallery_list_${Date.now()}.png`);
  await page.screenshot({ path: shot1, fullPage: false });
  console.log('Saved:', shot1);

  // 3. Admin Gallery Upload / Create Modal
  console.log('Opening Upload / New Photo modal...');
  await page.click('button:has-text("Neues Foto hinzufügen")');
  await page.waitForTimeout(500);
  const shot2 = path.join(ARTIFACT_DIR, `batch_c_admin_gallery_modal_${Date.now()}.png`);
  await page.screenshot({ path: shot2, fullPage: false });
  console.log('Saved:', shot2);

  // Close modal
  await page.click('button:has-text("Abbrechen")');
  await page.waitForTimeout(400);

  // 4. Switch role to Staff & view restricted permissions
  console.log('Switching role to staff in header...');
  const roleSelect = await page.$('select');
  if (roleSelect) {
    await roleSelect.selectOption('staff');
    await page.waitForTimeout(500);
  }
  await page.click('button:has-text("Galerie")');
  await page.waitForTimeout(500);
  const shot3 = path.join(ARTIFACT_DIR, `batch_c_admin_gallery_staff_restricted_${Date.now()}.png`);
  await page.screenshot({ path: shot3, fullPage: false });
  console.log('Saved:', shot3);

  // 5. Navigate to Public Site Gallery (http://localhost:5173/gallery)
  console.log('Navigating to Public Gallery http://localhost:5173/gallery ...');
  await page.goto('http://localhost:5173/gallery', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const shot4 = path.join(ARTIFACT_DIR, `batch_c_public_gallery_view_${Date.now()}.png`);
  await page.screenshot({ path: shot4, fullPage: false });
  console.log('Saved:', shot4);

  // 6. Public Lightbox Interaction
  console.log('Opening Lightbox on Public Gallery...');
  const firstCard = await page.$('div[class*="group cursor-pointer"]');
  if (firstCard) {
    await firstCard.click();
    await page.waitForTimeout(500);
    const shot5 = path.join(ARTIFACT_DIR, `batch_c_public_gallery_lightbox_${Date.now()}.png`);
    await page.screenshot({ path: shot5, fullPage: false });
    console.log('Saved:', shot5);
  }

  await browser.close();
  console.log('ALL BATCH C SCREENSHOTS CAPTURED SUCCESSFULLY!');
}

capture().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
