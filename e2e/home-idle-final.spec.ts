/**
 * Home Idle Animation Final Verification
 * Completes onboarding to get a pet, then captures before/after screenshots
 */

import { test, expect } from '@playwright/test';

const LIVE_URL = 'https://studjodev.github.io/pawbloom/';

test('Complete onboarding and verify idle animation', async ({ page }) => {
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
  await page.waitForTimeout(2000);

  console.log('Starting from:', page.url());

  // === Complete Onboarding Flow ===
  
  // Splash screen - click Start Adventure
  let btn = page.locator('button:has-text("Start Adventure"), button:has-text("Start"), button:has-text("Begin")');
  if (await btn.count() > 0) {
    await btn.first().click();
    await page.waitForTimeout(800);
  }

  // Welcome screen
  btn = page.locator('button:has-text("Let"), button:has-text("Continue"), button:has-text("Tap")');
  if (await btn.count() > 0) {
    await btn.first().click();
    await page.waitForTimeout(800);
  }

  // Starter selection - click on Shiba card
  const shibaCard = page.locator('[data-testid="starter-shiba-inu"], button:has-text("Shiba"), .starterCard:has-text("Shiba")').first();
  if (await shibaCard.count() > 0) {
    await shibaCard.click();
    await page.waitForTimeout(500);
  }

  // Choose My Friend button
  btn = page.locator('button:has-text("Choose My Friend"), button:has-text("Choose"), button:has-text("Select")');
  if (await btn.count() > 0) {
    await btn.first().click();
    await page.waitForTimeout(1000);
  }

  // Reveal screen - Continue
  btn = page.locator('button:has-text("Continue"), button:has-text("Next")');
  if (await btn.count() > 0) {
    await btn.first().click();
    await page.waitForTimeout(800);
  }

  // Naming screen
  const nameInput = page.locator('input[type="text"], input[placeholder*="name"], input');
  if (await nameInput.count() > 0) {
    await nameInput.first().fill('Mochi');
    await page.waitForTimeout(300);
  }

  // Confirm name
  btn = page.locator('button:has-text("Let"), button:has-text("Start"), button:has-text("Go"), button:has-text("Confirm")');
  if (await btn.count() > 0) {
    await btn.first().click();
    await page.waitForTimeout(1500);
  }

  // Should now be on Home
  console.log('After onboarding, URL:', page.url());

  // Ensure we're on home
  if (!page.url().includes('#/home')) {
    await page.goto(LIVE_URL + '#/home', { waitUntil: 'networkidle' });
  }
  
  // Wait for home to fully render
  await page.waitForTimeout(3000);

  // Check for pet images
  const petImages = await page.locator('img[src*="/pets/"]').count();
  console.log('Pet images found on Home:', petImages);

  // Take screenshot 1
  await page.screenshot({ 
    path: 'docs/screenshots/home-idle-before.png',
    fullPage: false 
  });
  console.log('Screenshot BEFORE taken');

  // Wait 3 seconds for animation to show change
  await page.waitForTimeout(3000);

  // Take screenshot 2
  await page.screenshot({ 
    path: 'docs/screenshots/home-idle-after.png',
    fullPage: false 
  });
  console.log('Screenshot AFTER taken');

  // Verify we have pet images
  expect(petImages).toBeGreaterThan(0);
});
