import { chromium } from 'playwright';

async function testInteractions() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  // 1. Home page
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  
  // 2. Click "Platz reservieren"
  const ctaBtn = page.getByRole('button', { name: 'Platz reservieren' });
  await ctaBtn.click();
  await page.waitForTimeout(500);

  // Check if modal opened
  const modalHeading = await page.getByRole('heading', { name: /Besuch reservieren|Besuch buchen|Wunschtermin/i }).isVisible().catch(() => false);
  console.log('Booking Modal opened from hero CTA:', modalHeading);

  // Close modal if open (Escape)
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // 3. Navigate to Gallery
  await page.goto('http://localhost:5173/galerie', { waitUntil: 'networkidle' });
  console.log('Gallery page loaded. Errors so far:', errors.length);

  // 4. Click a gallery image to check Lightbox
  const galleryImg = page.locator('button img').first();
  if (await galleryImg.isVisible()) {
    await galleryImg.click();
    await page.waitForTimeout(500);
    const lightboxVisible = await page.locator('[role="dialog"]').isVisible().catch(() => false);
    console.log('Lightbox opened on Gallery page:', lightboxVisible);
    await page.keyboard.press('Escape');
  }

  // 5. Navigate to Pricing
  await page.goto('http://localhost:5173/preise', { waitUntil: 'networkidle' });
  console.log('Pricing page loaded.');

  console.log('Total console errors across flow:', errors.length);
  await browser.close();
}

testInteractions().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
