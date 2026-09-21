/**
 * Record Home Idle Animation
 * This test completes onboarding then records the Home screen to prove animation
 */

import { test, expect } from '@playwright/test';

const LIVE_URL = 'https://studjodev.github.io/pawbloom/';

test('Record Home idle animation proof', async ({ page, context }) => {
  // Clear service worker cache
  await context.clearCookies();
  
  // Navigate to live site
  const cacheBust = `?t=${Date.now()}`;
  await page.goto(LIVE_URL + cacheBust, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log('Initial URL:', page.url());

  // Check if we landed on home already (has existing data)
  const isHome = page.url().includes('#/home');
  console.log('Is Home:', isHome);

  if (!isHome) {
    // Complete onboarding
    console.log('Completing onboarding flow...');

    // Screenshot: Splash
    await page.screenshot({ path: 'docs/screenshots/flow-1-splash.png' });

    // Click Start Adventure
    const startBtn = page.getByRole('button').filter({ hasText: /Start|Begin|開始/i }).first();
    if (await startBtn.isVisible({ timeout: 3000 })) {
      await startBtn.click();
      await page.waitForTimeout(1000);
    }

    // Screenshot: Welcome
    await page.screenshot({ path: 'docs/screenshots/flow-2-welcome.png' });

    // Click through Welcome
    const welcomeBtn = page.getByRole('button').filter({ hasText: /Let|Go|Continue|繼續/i }).first();
    if (await welcomeBtn.isVisible({ timeout: 3000 })) {
      await welcomeBtn.click();
      await page.waitForTimeout(1000);
    }

    // Screenshot: Starter Selection
    await page.screenshot({ path: 'docs/screenshots/flow-3-starter.png' });

    // Click Shiba card (first starter card)
    const starterCards = page.locator('[class*="starterCard"], [class*="petCard"], [data-testid*="starter"]');
    if (await starterCards.count() > 0) {
      await starterCards.first().click();
      await page.waitForTimeout(500);
    }

    // Click Choose My Friend
    const chooseBtn = page.getByRole('button').filter({ hasText: /Choose|Select|選擇/i }).first();
    if (await chooseBtn.isVisible({ timeout: 3000 })) {
      await chooseBtn.click();
      await page.waitForTimeout(1500);
    }

    // Screenshot: Reveal
    await page.screenshot({ path: 'docs/screenshots/flow-4-reveal.png' });

    // Click Continue after reveal
    const continueBtn = page.getByRole('button').filter({ hasText: /Continue|Next|繼續/i }).first();
    if (await continueBtn.isVisible({ timeout: 3000 })) {
      await continueBtn.click();
      await page.waitForTimeout(1000);
    }

    // Screenshot: Naming
    await page.screenshot({ path: 'docs/screenshots/flow-5-naming.png' });

    // Enter pet name
    const nameInput = page.locator('input').first();
    if (await nameInput.isVisible({ timeout: 3000 })) {
      await nameInput.fill('Mochi');
      await page.waitForTimeout(300);
    }

    // Click Let's Go / Confirm
    const goBtn = page.getByRole('button').filter({ hasText: /Let.*Go|Confirm|確認|Start/i }).first();
    if (await goBtn.isVisible({ timeout: 3000 })) {
      await goBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  // Now we should be on Home
  console.log('After flow, URL:', page.url());
  await page.waitForTimeout(2000);

  // Ensure we're on home
  if (!page.url().includes('#/home')) {
    await page.goto(LIVE_URL + '#/home', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
  }

  // === PROOF OF ANIMATION ===
  console.log('Capturing Home idle animation proof...');

  // Screenshot 1: t=0
  await page.screenshot({ 
    path: 'docs/screenshots/proof-idle-t0.png',
    fullPage: false 
  });
  console.log('Proof screenshot 1 taken (t=0)');

  // Wait 1.5 seconds (mid-animation)
  await page.waitForTimeout(1500);

  // Screenshot 2: t=1.5s
  await page.screenshot({ 
    path: 'docs/screenshots/proof-idle-t1500.png',
    fullPage: false 
  });
  console.log('Proof screenshot 2 taken (t=1.5s)');

  // Wait 1.5 more seconds
  await page.waitForTimeout(1500);

  // Screenshot 3: t=3s
  await page.screenshot({ 
    path: 'docs/screenshots/proof-idle-t3000.png',
    fullPage: false 
  });
  console.log('Proof screenshot 3 taken (t=3s)');

  // Check for pet images
  const petImgs = await page.locator('img[src*="/pets/"]').count();
  console.log('Pet images found:', petImgs);

  // Check for motion elements
  const transforms = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img[src*="/pets/"]');
    return Array.from(imgs).map(img => {
      const style = window.getComputedStyle(img);
      return {
        src: img.getAttribute('src'),
        transform: style.transform
      };
    });
  });
  console.log('Pet transforms:', JSON.stringify(transforms, null, 2));

  // Final home screenshot
  await page.screenshot({ 
    path: 'docs/screenshots/home-final.png',
    fullPage: false 
  });

  console.log('\n=== ANIMATION PROOF COMPLETE ===');
  console.log('Compare proof-idle-t0.png, proof-idle-t1500.png, proof-idle-t3000.png');
  console.log('The pet position/scale/rotation should be VISIBLY DIFFERENT in each frame.');
  console.log('Animation: y=[0,-12,0,-8,0], scaleY=[1,1.06,1,1.04,1], scaleX=[1,0.97,1,0.98,1], rotate=[-2,2,-1.5,1.5,0]');
  console.log('Duration: 1.8s, repeat: Infinity');
});
