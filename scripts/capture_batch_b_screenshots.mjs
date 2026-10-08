import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/musta/.gemini/antigravity-ide/brain/418e4a79-e5ea-4a2f-bd0f-fb8caccf94ba/.tempmediaStorage';

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5174/ ...');
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle' });

  // If on login page, log in as Owner
  console.log('Logging in as Owner...');
  const ownerBtn = await page.$('button:has-text("Owner")');
  if (ownerBtn) {
    await ownerBtn.click();
    await page.waitForTimeout(300);
    await page.click('button:has-text("Anmelden")');
    await page.waitForTimeout(1000);
  }

  // 1. Announcements List (Owner view)
  console.log('Navigating to Announcements tab...');
  await page.click('button:has-text("Ankündigungen")');
  await page.waitForTimeout(600);
  const shot1 = path.join(ARTIFACT_DIR, `batch_b_announcements_list_${Date.now()}.png`);
  await page.screenshot({ path: shot1, fullPage: false });
  console.log('Saved:', shot1);

  // 2. Announcements Create Modal
  console.log('Opening Announcement modal...');
  await page.click('button:has-text("Neue Ankündigung anlegen")');
  await page.waitForTimeout(500);
  const shot2 = path.join(ARTIFACT_DIR, `batch_b_announcements_modal_${Date.now()}.png`);
  await page.screenshot({ path: shot2, fullPage: false });
  console.log('Saved:', shot2);

  // Close modal
  await page.click('button:has-text("Abbrechen")');
  await page.waitForTimeout(400);

  // 3. FAQ Management (Owner view)
  console.log('Navigating to FAQ Management tab...');
  await page.click('button:has-text("FAQ-Verwaltung")');
  await page.waitForTimeout(600);
  const shot3 = path.join(ARTIFACT_DIR, `batch_b_faqs_list_${Date.now()}.png`);
  await page.screenshot({ path: shot3, fullPage: false });
  console.log('Saved:', shot3);

  // 4. Event Inquiries Inbox (Sensitive inbox)
  console.log('Navigating to Inquiries Inbox tab...');
  await page.click('button:has-text("Anfragen-Postfach")');
  await page.waitForTimeout(600);
  const shot4 = path.join(ARTIFACT_DIR, `batch_b_inquiries_inbox_${Date.now()}.png`);
  await page.screenshot({ path: shot4, fullPage: false });
  console.log('Saved:', shot4);

  // 5. Inquiries Details & Team Notes Modal
  console.log('Opening Inquiry Details modal...');
  const triageBtn = await page.$('button:has-text("Bearbeiten & Notiz")');
  if (triageBtn) {
    await triageBtn.click();
    await page.waitForTimeout(500);
    const shot5 = path.join(ARTIFACT_DIR, `batch_b_inquiries_details_${Date.now()}.png`);
    await page.screenshot({ path: shot5, fullPage: false });
    console.log('Saved:', shot5);

    // Close modal
    await page.click('button:has-text("Schließen")');
    await page.waitForTimeout(400);
  }

  // 6. Switch role to Staff & view Announcements restriction
  console.log('Switching role to staff in header...');
  const roleSelect = await page.$('select');
  if (roleSelect) {
    await roleSelect.selectOption('staff');
    await page.waitForTimeout(500);
  }
  await page.click('button:has-text("Ankündigungen")');
  await page.waitForTimeout(500);
  const shot6 = path.join(ARTIFACT_DIR, `batch_b_staff_restricted_${Date.now()}.png`);
  await page.screenshot({ path: shot6, fullPage: false });
  console.log('Saved:', shot6);

  await browser.close();
  console.log('ALL SCREENSHOTS CAPTURED SUCCESSFULLY!');
}

capture().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
