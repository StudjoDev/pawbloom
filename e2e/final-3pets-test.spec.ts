/**
 * Final 3 Team Pets Verification
 */
import { test, expect } from '@playwright/test';

const LIVE_URL = 'https://studjodev.github.io/pawbloom/';

test.setTimeout(120000);

test('Complete onboarding to get 3 team pets on Home', async ({ page }) => {
  // Navigate
  await page.goto(LIVE_URL + '?t=' + Date.now(), { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  console.log('Step 1 - Initial:', page.url());
  await page.screenshot({ path: 'docs/screenshots/final3-1.png' });

  // We might be on Welcome already. Look for the correct button.
  // Welcome screen button: "Let's Find Your First Friend!"
  const welcomeBtn = page.locator('button:has-text("Find Your First Friend")');
  if (await welcomeBtn.isVisible({ timeout: 3000 })) {
    console.log('On Welcome screen, clicking Find Your First Friend');
    await welcomeBtn.click();
    await page.waitForTimeout(1500);
  }

  console.log('Step 2 - After Welcome:', page.url());
  await page.screenshot({ path: 'docs/screenshots/final3-2-starter.png' });

  // Should be on Starter screen now
  // Click first pet card
  const petCard = page.locator('[class*="Card"]').first();
  if (await petCard.isVisible({ timeout: 3000 })) {
    await petCard.click();
    await page.waitForTimeout(500);
  }

  // Click "Choose My Friend" button
  const chooseBtn = page.locator('button:has-text("Choose My Friend")');
  if (await chooseBtn.isVisible({ timeout: 3000 })) {
    console.log('Clicking Choose My Friend');
    await chooseBtn.click();
    await page.waitForTimeout(2000);
  }

  console.log('Step 3 - After Choose:', page.url());
  await page.screenshot({ path: 'docs/screenshots/final3-3-reveal.png' });

  // Reveal screen - click Continue
  const continueBtn = page.locator('button:has-text("Continue")');
  if (await continueBtn.isVisible({ timeout: 3000 })) {
    console.log('Clicking Continue on Reveal');
    await continueBtn.click();
    await page.waitForTimeout(1500);
  }

  console.log('Step 4 - After Reveal:', page.url());
  await page.screenshot({ path: 'docs/screenshots/final3-4-naming.png' });

  // Naming screen - enter name
  const input = page.locator('input').first();
  if (await input.isVisible({ timeout: 3000 })) {
    await input.fill('Lucky');
    await page.waitForTimeout(300);
  }

  // Click the finish button - "Let's Go" or similar
  const goBtn = page.locator('button:has-text("Go")');
  if (await goBtn.isVisible({ timeout: 3000 })) {
    console.log('Clicking finish button');
    await goBtn.click();
    await page.waitForTimeout(3000);
  }

  console.log('Step 5 - Final:', page.url());
  await page.screenshot({ path: 'docs/screenshots/final3-5-home.png' });

  // Check for pet images
  const petImgCount = await page.locator('img[src*="/pets/idle/"]').count();
  console.log('Pet idle images found:', petImgCount);

  const emptySlots = await page.locator('text=Walk to meet more').count();
  console.log('Empty slots found:', emptySlots);

  // Get all image sources
  const srcs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img'))
      .map(img => img.src)
      .filter(src => src.includes('/pets/'));
  });
  console.log('Pet image sources:', srcs);

  // === ANIMATION PROOF ===
  if (petImgCount > 0) {
    console.log('\n=== CAPTURING ANIMATION PROOF (3 PETS) ===');
    
    await page.screenshot({ path: 'docs/screenshots/3pets-anim-t0.png' });
    console.log('Screenshot t=0');
    
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'docs/screenshots/3pets-anim-t1500.png' });
    console.log('Screenshot t=1500ms');
    
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'docs/screenshots/3pets-anim-t3000.png' });
    console.log('Screenshot t=3000ms');
  }

  console.log('\n=== FINAL RESULT ===');
  console.log(`Pet images: ${petImgCount}`);
  console.log(`Empty slots: ${emptySlots}`);
  console.log(`PASS criteria: ${petImgCount >= 3 ? '✅' : '❌'} 3+ pets, ${emptySlots === 0 ? '✅' : '❌'} 0 empty slots`);
});
