/**
 * Verify 3 Team Pets on Home after Onboarding
 * This test completes onboarding and verifies Home shows 3 pets (not empty slots)
 */
import { test, expect } from '@playwright/test';

const LIVE_URL = 'https://studjodev.github.io/pawbloom/';

test.setTimeout(180000); // 3 minute timeout

test('Home shows 3 team pets after onboarding', async ({ page }) => {
  // Clear all storage to simulate fresh user
  await page.goto(LIVE_URL);
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    indexedDB.deleteDatabase('PawBloomDB');
  });
  await page.waitForTimeout(500);

  // Navigate fresh
  await page.goto(LIVE_URL + '?fresh=' + Date.now(), { waitUntil: 'networkidle' });
  console.log('Starting fresh onboarding test...');
  
  // Wait for splash auto-navigation
  await page.waitForTimeout(4000);
  console.log('After splash:', page.url());

  // Step through onboarding
  // Welcome screen - "Let's Find Your First Friend!"
  const findBtn = page.locator('button:has-text("Find")');
  if (await findBtn.isVisible({ timeout: 5000 })) {
    await findBtn.click();
    await page.waitForTimeout(1500);
  }
  console.log('After Welcome:', page.url());

  // Starter screen - click first pet card
  await page.screenshot({ path: 'docs/screenshots/test-starter.png' });
  
  // Click on Shiba card (first card area)
  const petCards = page.locator('[class*="Card"]');
  if (await petCards.count() > 0) {
    await petCards.first().click();
    await page.waitForTimeout(500);
  }

  // Click Choose My Friend
  const chooseBtn = page.locator('button:has-text("Choose")');
  if (await chooseBtn.isVisible({ timeout: 3000 })) {
    await chooseBtn.click();
    await page.waitForTimeout(2000);
  }
  console.log('After Choose:', page.url());

  // Reveal screen - Continue
  const continueBtn = page.locator('button:has-text("Continue")');
  if (await continueBtn.isVisible({ timeout: 3000 })) {
    await continueBtn.click();
    await page.waitForTimeout(1500);
  }
  console.log('After Reveal:', page.url());

  // Naming screen
  const nameInput = page.locator('input').first();
  if (await nameInput.isVisible({ timeout: 3000 })) {
    await nameInput.fill('Lucky');
    await page.waitForTimeout(300);
  }

  // Finish naming
  const goBtn = page.locator('button:has-text("Go"), button:has-text("Name")');
  if (await goBtn.isVisible({ timeout: 3000 })) {
    await goBtn.first().click();
    await page.waitForTimeout(3000);
  }
  console.log('After Naming:', page.url());

  // Should now be on Home
  await page.screenshot({ path: 'docs/screenshots/test-home-before.png' });

  // If not on home, navigate there
  if (!page.url().includes('/home')) {
    await page.goto(LIVE_URL + '#/home', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
  }

  // === VERIFICATION ===
  console.log('\n=== HOME VERIFICATION ===');
  
  // Take screenshot
  await page.screenshot({ path: 'docs/screenshots/test-home-3pets.png' });

  // Count pet images
  const petIdleImages = await page.locator('img[src*="/pets/idle/"]').count();
  console.log('Pet idle images:', petIdleImages);

  // Count empty slots
  const emptySlots = await page.locator('text=Walk to meet more').count();
  console.log('Empty "Walk to meet more" slots:', emptySlots);

  // Get pet image sources
  const petSources = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img[src*="/pets/"]');
    return Array.from(imgs).map(img => {
      const src = img.getAttribute('src') || '';
      return src.split('/').pop();
    });
  });
  console.log('Pet images found:', petSources.join(', '));

  // Log console messages for debugging
  page.on('console', msg => {
    if (msg.text().includes('PawBloom')) {
      console.log('Console:', msg.text());
    }
  });

  // Wait and take animation proof screenshots
  if (petIdleImages > 0) {
    console.log('\n=== ANIMATION PROOF ===');
    await page.screenshot({ path: 'docs/screenshots/home-3pets-t0.png' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'docs/screenshots/home-3pets-t1500.png' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'docs/screenshots/home-3pets-t3000.png' });
  }

  // === ASSERTIONS ===
  console.log('\n=== RESULT ===');
  console.log(`Pet images: ${petIdleImages} (expected: >= 3)`);
  console.log(`Empty slots: ${emptySlots} (expected: 0)`);
  
  // Must have 3 pets
  expect(petIdleImages).toBeGreaterThanOrEqual(3);
  // Must have no empty slots
  expect(emptySlots).toBe(0);
});
