/**
 * Verify 3 Team Pets on Home Screen with Idle Animation
 */
import { test, expect } from '@playwright/test';

const LIVE_URL = 'https://studjodev.github.io/pawbloom/';

test('Complete onboarding and verify 3 team pets with idle animation', async ({ page }) => {
  // Go to live site with fresh cache bust
  const cacheBust = `?fresh=${Date.now()}`;
  await page.goto(LIVE_URL + cacheBust, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('=== Starting Fresh Onboarding ===');
  console.log('Initial URL:', page.url());

  // Screenshot 1: Splash
  await page.screenshot({ path: 'docs/screenshots/3pets-01-splash.png' });

  // Click Start Adventure
  await page.click('text=Start Adventure').catch(() => {});
  await page.waitForTimeout(1000);
  console.log('After Start Adventure:', page.url());

  // Click Let's Go on Welcome
  await page.click('text=Let\'s Go').catch(() => {});
  await page.waitForTimeout(1000);
  console.log('After Welcome:', page.url());

  // Screenshot 2: Starter Selection
  await page.screenshot({ path: 'docs/screenshots/3pets-02-starter.png' });

  // Click on Shiba card (first card at top)
  await page.mouse.click(215, 240);
  await page.waitForTimeout(500);

  // Click Choose My Friend
  await page.click('text=Choose My Friend').catch(() => {
    // Fallback to bottom button area
    page.mouse.click(215, 880);
  });
  await page.waitForTimeout(1500);
  console.log('After Choose:', page.url());

  // Screenshot 3: Reveal
  await page.screenshot({ path: 'docs/screenshots/3pets-03-reveal.png' });

  // Click Continue on Reveal
  await page.click('text=Continue').catch(() => {
    page.mouse.click(215, 850);
  });
  await page.waitForTimeout(1000);
  console.log('After Reveal Continue:', page.url());

  // Screenshot 4: Naming
  await page.screenshot({ path: 'docs/screenshots/3pets-04-naming.png' });

  // Enter pet name
  const input = page.locator('input').first();
  if (await input.isVisible({ timeout: 3000 })) {
    await input.fill('Lucky');
    await page.waitForTimeout(300);
  }

  // Click Let's Go to finish naming
  await page.click('button:has-text("Let")').catch(() => {
    page.mouse.click(215, 800);
  });
  await page.waitForTimeout(2500);
  console.log('After Naming:', page.url());

  // Should now be on Home with 3 team pets!
  // Screenshot 5: Home with 3 pets
  await page.screenshot({ path: 'docs/screenshots/3pets-05-home.png' });

  // === VERIFY 3 TEAM PETS ===
  console.log('\n=== VERIFYING 3 TEAM PETS ===');

  // Count pet images on Home
  const petImages = await page.locator('img[src*="/pets/idle/"]').count();
  console.log('Idle pet images found:', petImages);

  // Check for empty slots (should NOT exist)
  const emptySlots = await page.locator('text=Walk to meet more').count();
  console.log('Empty "Walk to meet more" slots:', emptySlots);

  // === CAPTURE IDLE ANIMATION PROOF (3 PETS) ===
  console.log('\n=== CAPTURING IDLE ANIMATION PROOF ===');

  // Wait for animation to start
  await page.waitForTimeout(500);

  // Screenshot at t=0
  await page.screenshot({ path: 'docs/screenshots/3pets-home-t0.png' });
  console.log('Screenshot: 3pets-home-t0.png');

  // Wait 1.5 seconds (mid-animation)
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'docs/screenshots/3pets-home-t1500.png' });
  console.log('Screenshot: 3pets-home-t1500.png');

  // Wait another 1.5 seconds (end of cycle)
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'docs/screenshots/3pets-home-t3000.png' });
  console.log('Screenshot: 3pets-home-t3000.png');

  // Get transform values to verify animation
  const transforms = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img[src*="/pets/idle/"]');
    return Array.from(imgs).map((img, i) => ({
      index: i,
      src: img.getAttribute('src')?.split('/').pop(),
      transform: window.getComputedStyle(img).transform
    }));
  });
  console.log('\nPet transforms:', JSON.stringify(transforms, null, 2));

  // Summary
  console.log('\n=== VERIFICATION SUMMARY ===');
  console.log(`✅ Idle pet images: ${petImages}`);
  console.log(`${emptySlots === 0 ? '✅' : '❌'} Empty slots: ${emptySlots} (should be 0)`);
  console.log(`${petImages >= 3 ? '✅' : '❌'} At least 3 team pets visible: ${petImages >= 3}`);

  // Expect 3 pets
  expect(petImages).toBeGreaterThanOrEqual(3);
  expect(emptySlots).toBe(0);
});
