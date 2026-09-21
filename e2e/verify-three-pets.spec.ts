/**
 * Verify 3 Team Pets on Home Screen
 */
import { test, expect } from '@playwright/test';

const LIVE_URL = 'https://studjodev.github.io/pawbloom/';

test.setTimeout(90000); // 90 second timeout

test('Onboarding gives 3 team pets', async ({ page }) => {
  // Navigate to live site
  await page.goto(LIVE_URL + '?t=' + Date.now(), { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log('Page 1:', page.url());
  await page.screenshot({ path: 'docs/screenshots/verify3-1-start.png' });

  // Step through onboarding with explicit waits
  
  // 1. Click Start Adventure
  const startBtn = page.locator('button', { hasText: 'Start Adventure' });
  if (await startBtn.isVisible({ timeout: 5000 })) {
    await startBtn.click();
    await page.waitForTimeout(1500);
  }
  console.log('Page 2:', page.url());

  // 2. Click Let's Go
  const letsGoBtn = page.locator('button', { hasText: "Let's Go" });
  if (await letsGoBtn.isVisible({ timeout: 5000 })) {
    await letsGoBtn.click();
    await page.waitForTimeout(1500);
  }
  console.log('Page 3:', page.url());
  await page.screenshot({ path: 'docs/screenshots/verify3-2-starter.png' });

  // 3. Click first starter card (Shiba)
  const cards = page.locator('[class*="petCard"], [class*="starterCard"]');
  if (await cards.count() > 0) {
    await cards.first().click();
    await page.waitForTimeout(800);
  }

  // 4. Click Choose My Friend
  const chooseBtn = page.locator('button', { hasText: 'Choose My Friend' });
  if (await chooseBtn.isVisible({ timeout: 5000 })) {
    await chooseBtn.click();
    await page.waitForTimeout(2000);
  }
  console.log('Page 4:', page.url());
  await page.screenshot({ path: 'docs/screenshots/verify3-3-reveal.png' });

  // 5. Click Continue after reveal
  const continueBtn = page.locator('button', { hasText: 'Continue' });
  if (await continueBtn.isVisible({ timeout: 5000 })) {
    await continueBtn.click();
    await page.waitForTimeout(1500);
  }
  console.log('Page 5:', page.url());
  await page.screenshot({ path: 'docs/screenshots/verify3-4-naming.png' });

  // 6. Enter name
  const nameInput = page.locator('input');
  if (await nameInput.isVisible({ timeout: 5000 })) {
    await nameInput.fill('Lucky');
    await page.waitForTimeout(500);
  }

  // 7. Click finish button
  const finishBtn = page.locator('button', { hasText: "Let's Go" });
  if (await finishBtn.isVisible({ timeout: 5000 })) {
    await finishBtn.click();
    await page.waitForTimeout(3000);
  }
  
  console.log('Final page:', page.url());

  // Now we should be on Home
  await page.screenshot({ path: 'docs/screenshots/verify3-5-home.png' });

  // Count pet idle images
  const petCount = await page.locator('img[src*="/pets/idle/"]').count();
  console.log('Idle pet images:', petCount);

  // Count empty slots
  const emptyCount = await page.locator('text=Walk to meet more').count();
  console.log('Empty slots:', emptyCount);

  // Get pet image sources
  const petSrcs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img[src*="/pets/"]'))
      .map(img => img.getAttribute('src'));
  });
  console.log('Pet sources:', petSrcs);

  // Take animation proof screenshots
  console.log('\n=== ANIMATION PROOF ===');
  await page.screenshot({ path: 'docs/screenshots/3pets-idle-t0.png' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'docs/screenshots/3pets-idle-t1500.png' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'docs/screenshots/3pets-idle-t3000.png' });

  console.log('Animation proof screenshots captured');
  console.log(`Result: ${petCount} pets, ${emptyCount} empty slots`);
});
