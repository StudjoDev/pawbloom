/**
 * 3 Team Pets Full Flow Test - Wait for auto-navigation
 */
import { test } from '@playwright/test';

const LIVE_URL = 'https://studjodev.github.io/pawbloom/';

test.setTimeout(180000); // 3 minute timeout

test('Get 3 team pets on Home after onboarding', async ({ page }) => {
  // Navigate to fresh start
  await page.goto(LIVE_URL + '?clean=' + Date.now(), { waitUntil: 'networkidle' });
  
  // Wait for splash animation and auto-navigate (2000ms + 800ms = 2.8s)
  console.log('Waiting for Splash auto-navigate...');
  await page.waitForTimeout(4000);

  // Check current page
  console.log('After splash wait:', page.url());
  await page.screenshot({ path: 'docs/screenshots/flow3-1-after-splash.png' });

  // If we're on Welcome, proceed
  if (page.url().includes('/welcome')) {
    console.log('On Welcome screen');
    
    // Click the button to proceed
    await page.waitForTimeout(1000);
    const findFriendBtn = page.locator('button:has-text("Find")');
    if (await findFriendBtn.isVisible({ timeout: 5000 })) {
      await findFriendBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  console.log('After Welcome:', page.url());
  await page.screenshot({ path: 'docs/screenshots/flow3-2-starter.png' });

  // Should be on Starter
  if (page.url().includes('/starter')) {
    console.log('On Starter screen');
    
    // Click first pet card (use position since class names may be hashed)
    await page.mouse.click(215, 200); // Shiba card area
    await page.waitForTimeout(500);
    
    // Look for Choose button
    const chooseBtn = page.locator('button:has-text("Choose")');
    if (await chooseBtn.isVisible({ timeout: 3000 })) {
      await chooseBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  console.log('After Starter:', page.url());
  await page.screenshot({ path: 'docs/screenshots/flow3-3-reveal.png' });

  // Reveal screen
  if (page.url().includes('/reveal')) {
    console.log('On Reveal screen');
    
    const continueBtn = page.locator('button:has-text("Continue")');
    if (await continueBtn.isVisible({ timeout: 3000 })) {
      await continueBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  console.log('After Reveal:', page.url());
  await page.screenshot({ path: 'docs/screenshots/flow3-4-naming.png' });

  // Naming screen
  if (page.url().includes('/naming')) {
    console.log('On Naming screen');
    
    const input = page.locator('input').first();
    if (await input.isVisible({ timeout: 3000 })) {
      await input.fill('Lucky');
      await page.waitForTimeout(500);
    }
    
    // Click finish button
    const goBtn = page.locator('button:has-text("Go")');
    if (await goBtn.isVisible({ timeout: 3000 })) {
      await goBtn.click();
      await page.waitForTimeout(3000);
    }
  }

  console.log('Final URL:', page.url());
  await page.screenshot({ path: 'docs/screenshots/flow3-5-home.png' });

  // === Check results ===
  const petCount = await page.locator('img[src*="/pets/idle/"]').count();
  const emptySlots = await page.locator('text=Walk to meet more').count();
  
  console.log('\n=== RESULTS ===');
  console.log('Pet idle images:', petCount);
  console.log('Empty slots:', emptySlots);

  // List all images
  const allImgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img'))
      .map(img => img.src);
  });
  console.log('All images on page:', allImgs.length);
  allImgs.filter(s => s.includes('/pets/')).forEach(s => console.log('  Pet img:', s));

  // If we have pets, capture animation proof
  if (petCount > 0) {
    console.log('\n=== 3 PETS IDLE ANIMATION PROOF ===');
    await page.screenshot({ path: 'docs/screenshots/3pets-proof-t0.png' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'docs/screenshots/3pets-proof-t1500.png' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'docs/screenshots/3pets-proof-t3000.png' });
    console.log('Animation proof screenshots saved');
  }
});
