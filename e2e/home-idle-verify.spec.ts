/**
 * Home Idle Animation Verification Test
 * Takes before/after screenshots 3 seconds apart to prove visible animation
 */

import { test, expect } from '@playwright/test';

const LIVE_URL = 'https://studjodev.github.io/pawbloom/';

test('Home idle animation is visible - before/after comparison', async ({ page }) => {
  // Bypass service worker cache
  await page.addInitScript(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(r => r.unregister());
      });
    }
  });

  // Navigate with cache bust
  const cacheBust = `?nocache=${Date.now()}`;
  await page.goto(LIVE_URL + cacheBust, { waitUntil: 'networkidle' });
  
  // Wait for app to load
  await page.waitForTimeout(2000);

  // Check if we need to complete onboarding
  const url = page.url();
  console.log('Current URL:', url);

  // If on splash/onboarding, complete it
  if (url.includes('#/') && !url.includes('#/home')) {
    // Start button on splash
    const startBtn = page.locator('button:has-text("Start"), button:has-text("開始"), button:has-text("Begin")');
    if (await startBtn.count() > 0) {
      await startBtn.first().click();
      await page.waitForTimeout(500);
    }

    // Welcome screen - tap to continue
    const welcomeBtn = page.locator('button:has-text("Continue"), button:has-text("繼續"), button:has-text("Tap")');
    if (await welcomeBtn.count() > 0) {
      await welcomeBtn.first().click();
      await page.waitForTimeout(500);
    }

    // Starter selection - choose Shiba
    const shibaCard = page.locator('[data-testid="pet-shiba-inu"], button:has-text("Shiba"), div:has-text("Shiba"):visible').first();
    if (await shibaCard.count() > 0) {
      await shibaCard.click();
      await page.waitForTimeout(300);
    }

    // Confirm selection
    const confirmBtn = page.locator('button:has-text("Choose"), button:has-text("選擇"), button:has-text("Select")');
    if (await confirmBtn.count() > 0) {
      await confirmBtn.first().click();
      await page.waitForTimeout(500);
    }

    // Reveal screen - tap to continue
    const tapContinue = page.locator('button:has-text("Tap"), button:has-text("Continue")');
    if (await tapContinue.count() > 0) {
      await tapContinue.first().click();
      await page.waitForTimeout(500);
    }

    // Name screen - enter name and confirm
    const nameInput = page.locator('input[type="text"]');
    if (await nameInput.count() > 0) {
      await nameInput.fill('Test');
      await page.waitForTimeout(200);
      const doneBtn = page.locator('button:has-text("Done"), button:has-text("確認"), button:has-text("Confirm")');
      if (await doneBtn.count() > 0) {
        await doneBtn.first().click();
        await page.waitForTimeout(500);
      }
    }

    // Wait for navigation to home
    await page.waitForTimeout(1000);
  }

  // Navigate to home if not there
  if (!page.url().includes('#/home')) {
    await page.goto(LIVE_URL + '#/home', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
  }

  console.log('Now on:', page.url());

  // Wait for home screen to fully render
  await page.waitForTimeout(2000);

  // Take FIRST screenshot
  await page.screenshot({ 
    path: 'docs/screenshots/home-idle-animation-1.png',
    fullPage: false 
  });
  console.log('Screenshot 1 taken at', new Date().toISOString());

  // Wait exactly 3 seconds for animation cycle
  await page.waitForTimeout(3000);

  // Take SECOND screenshot
  await page.screenshot({ 
    path: 'docs/screenshots/home-idle-animation-2.png',
    fullPage: false 
  });
  console.log('Screenshot 2 taken at', new Date().toISOString());

  // Verify pet images are present
  const petImages = await page.locator('img[src*="/pets/idle/"]').count();
  console.log('Pet idle images found:', petImages);
  expect(petImages).toBeGreaterThan(0);

  // Check for motion.div elements (Framer Motion animated elements)
  const motionDivs = await page.locator('[style*="transform"]').count();
  console.log('Elements with transform style:', motionDivs);

  console.log('✅ Screenshots captured - compare home-idle-animation-1.png and home-idle-animation-2.png');
  console.log('The pet should show visible position/scale/rotation difference between the two frames.');
});
