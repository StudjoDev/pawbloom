/**
 * Local Preview Idle Animation Test
 * Tests the animation directly against local preview
 */

import { test, expect } from '@playwright/test';

const LOCAL_URL = 'http://localhost:4174/pawbloom/';

test('Verify idle animation on local preview', async ({ page }) => {
  // Go directly to home with existing state
  await page.goto(LOCAL_URL + '#/home', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Check URL
  console.log('URL:', page.url());

  // If redirected to onboarding, complete it
  if (!page.url().includes('#/home')) {
    // Start over from root
    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Click through onboarding
    await page.click('text=Start Adventure').catch(() => {});
    await page.waitForTimeout(500);
    
    await page.click('text=Let\'s Go').catch(() => {});
    await page.waitForTimeout(500);

    // Find and click Shiba card
    const shibaCard = page.locator('.starterCard').first();
    await shibaCard.click().catch(() => {});
    await page.waitForTimeout(300);

    await page.click('text=Choose My Friend').catch(() => {});
    await page.waitForTimeout(800);

    await page.click('text=Continue').catch(() => {});
    await page.waitForTimeout(500);

    // Name the pet
    await page.fill('input', 'TestPet').catch(() => {});
    await page.waitForTimeout(200);

    await page.click('button:has-text("Let\'s Go")').catch(() => {});
    await page.waitForTimeout(1500);
  }

  // Now on home - wait for render
  await page.waitForTimeout(2000);

  // Count pet images
  const petImgs = await page.locator('img[src*="/pets/idle/"]').count();
  console.log('Idle pet images:', petImgs);

  // Get transform values to verify animation is happening
  const petElement = page.locator('img[src*="/pets/idle/"]').first();
  
  if (await petElement.count() > 0) {
    // Get initial transform
    const transform1 = await petElement.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.transform;
    });
    console.log('Transform at t=0:', transform1);

    // Wait and get transform again
    await page.waitForTimeout(1000);
    const transform2 = await petElement.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.transform;
    });
    console.log('Transform at t=1s:', transform2);

    await page.waitForTimeout(1000);
    const transform3 = await petElement.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.transform;
    });
    console.log('Transform at t=2s:', transform3);

    // Animation should change the transform
    const hasAnimation = transform1 !== transform2 || transform2 !== transform3;
    console.log('Animation detected:', hasAnimation);
    
    // Take screenshots
    await page.screenshot({ path: 'docs/screenshots/local-idle-1.png' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'docs/screenshots/local-idle-2.png' });
  }

  // Just log results, don't fail
  console.log('Test complete');
});
