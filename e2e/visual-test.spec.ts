import { test, expect } from '@playwright/test';

const LIVE_URL = 'https://studjodev.github.io/pawbloom/';

test('Visual test - onboarding to walk with frame animation', async ({ page, browser }) => {
  test.setTimeout(180000);
  
  // Fresh context without clearing storage
  const context = await browser.newContext();
  const freshPage = await context.newPage();
  
  await freshPage.goto(LIVE_URL);
  
  // Only unregister SW, preserve IndexedDB
  await freshPage.evaluate(async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of registrations) {
      await reg.unregister();
    }
  });
  
  await freshPage.reload();
  await freshPage.waitForTimeout(3500);
  
  // Check current state
  const isOnHome = await freshPage.locator('button:has-text("Start Walk")').isVisible({ timeout: 3000 }).catch(() => false);
  
  if (!isOnHome) {
    console.log('Starting onboarding...');
    
    // Welcome
    const welcomeBtn = freshPage.locator('button:has-text("Find Your First Friend"), button:has-text("Find")');
    await welcomeBtn.waitFor({ timeout: 10000 });
    await welcomeBtn.click();
    await freshPage.waitForTimeout(500);
    
    // Starter select
    await freshPage.waitForSelector('text=Corgi', { timeout: 10000 });
    await freshPage.screenshot({ path: 'docs/screenshots/test-starter.png' });
    await freshPage.locator('text=Corgi').first().click();
    await freshPage.waitForTimeout(300);
    await freshPage.locator('button:has-text("Meet")').click();
    
    // Reveal
    console.log('Waiting for reveal...');
    await freshPage.waitForTimeout(5000);
    await freshPage.click('body', { position: { x: 200, y: 400 } });
    await freshPage.waitForTimeout(3000);
    await freshPage.screenshot({ path: 'docs/screenshots/test-reveal.png' });
    
    // Collection card
    const nickBtn = freshPage.locator('button:has-text("Give a Nickname"), button:has-text("Nickname")');
    await nickBtn.waitFor({ timeout: 10000 });
    await nickBtn.click();
    await freshPage.waitForTimeout(1000);
    
    // Naming
    const keepBtn = freshPage.locator('button:has-text("Keep This Name"), button:has-text("Keep")');
    if (await keepBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await keepBtn.first().click();
    }
    
    console.log('Onboarding complete, waiting for Home...');
    await freshPage.waitForSelector('button:has-text("Start Walk")', { timeout: 20000 });
  }
  
  // Now on Home
  await freshPage.waitForTimeout(2000);
  
  // Check for pet images
  const imgCount = await freshPage.evaluate(() => document.querySelectorAll('img[src*="pets"]').length);
  console.log(`Pet images on Home: ${imgCount}`);
  
  // Get pet image src
  const petSrc = await freshPage.evaluate(() => {
    const img = document.querySelector('img[src*="pets"]') as HTMLImageElement;
    return img ? img.src : 'none';
  });
  console.log(`Pet image src: ${petSrc}`);
  
  await freshPage.screenshot({ path: 'docs/screenshots/test-home.png' });
  
  // Go to Walk
  await freshPage.locator('button:has-text("Start Walk")').click();
  await freshPage.waitForTimeout(1500);
  await freshPage.screenshot({ path: 'docs/screenshots/test-walk-idle.png' });
  
  // Start walking
  const walkBtn = freshPage.locator('button:has-text("Walk")').first();
  if (await walkBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await walkBtn.click();
    
    // Capture multiple frames
    await freshPage.waitForTimeout(200);
    const src1 = await freshPage.evaluate(() => {
      const img = document.querySelector('img[src*="pets"]') as HTMLImageElement;
      return img ? img.src : 'none';
    });
    await freshPage.screenshot({ path: 'docs/screenshots/test-walk-frame1.png' });
    
    await freshPage.waitForTimeout(200);
    const src2 = await freshPage.evaluate(() => {
      const img = document.querySelector('img[src*="pets"]') as HTMLImageElement;
      return img ? img.src : 'none';
    });
    await freshPage.screenshot({ path: 'docs/screenshots/test-walk-frame2.png' });
    
    await freshPage.waitForTimeout(200);
    const src3 = await freshPage.evaluate(() => {
      const img = document.querySelector('img[src*="pets"]') as HTMLImageElement;
      return img ? img.src : 'none';
    });
    
    console.log('Walk frames:');
    console.log(`  Frame 1: ${src1}`);
    console.log(`  Frame 2: ${src2}`);
    console.log(`  Frame 3: ${src3}`);
    
    // Check if frames are different (walk animation)
    const hasFrameAnimation = src1 !== src2 || src2 !== src3;
    console.log(`Frame animation working: ${hasFrameAnimation}`);
  }
  
  await context.close();
});
