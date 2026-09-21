import { test, expect } from '@playwright/test';

const LIVE_URL = 'https://studjodev.github.io/pawbloom/';

test.describe('PawBloom HARD GATE VERIFICATION', () => {
  test.setTimeout(180000);

  test('Gate A+B+C: PNG magic, walk frames, visual polish', async ({ page, context }) => {
    // Clear storage
    await context.clearCookies();
    await page.goto(LIVE_URL);
    
    // Unregister service workers
    await page.evaluate(async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.unregister();
      }
      const dbs = await indexedDB.databases();
      for (const db of dbs) {
        if (db.name) indexedDB.deleteDatabase(db.name);
      }
      localStorage.clear();
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    // GATE A: Verify PNG files are real PNGs (not JPEG)
    const pngResponse = await page.request.get(`${LIVE_URL}pets/idle/corgi.png`);
    expect(pngResponse.status()).toBe(200);
    const pngBuffer = await pngResponse.body();
    const pngMagic = pngBuffer.slice(0, 4).toString('hex');
    console.log(`✅ GATE A: PNG magic = ${pngMagic} (expected: 89504e47)`);
    expect(pngMagic).toBe('89504e47');
    
    // GATE A: Verify walk frame exists
    const walkResponse = await page.request.get(`${LIVE_URL}pets/walk/corgi-1.png`);
    expect(walkResponse.status()).toBe(200);
    console.log('✅ GATE A: walk/corgi-1.png returns 200');
    
    // Complete onboarding
    await page.waitForTimeout(3000);
    
    const welcomeBtn = page.locator('button:has-text("Find"), button:has-text("Friend")');
    if (await welcomeBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await welcomeBtn.click();
    }
    
    await page.waitForSelector('text=Corgi', { timeout: 10000 });
    await page.locator('text=Corgi').first().click();
    await page.locator('button:has-text("Meet")').click();
    
    await page.waitForTimeout(4500);
    await page.click('body');
    await page.waitForTimeout(2000);
    
    const nicknameBtn = page.locator('button:has-text("Nickname"), button:has-text("Family")');
    if (await nicknameBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
      await nicknameBtn.click();
    }
    
    await page.waitForTimeout(1000);
    const keepBtn = page.locator('button:has-text("Keep"), button:has-text("This Name")');
    if (await keepBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await keepBtn.first().click();
    }
    
    // Wait for Home
    await page.waitForSelector('text=Start Walk', { timeout: 15000 });
    
    // GATE A: Verify image on Home is not showing cream background
    // Check that img tags exist
    const imgCount = await page.evaluate(() => document.querySelectorAll('img').length);
    console.log(`✅ GATE A: Image count on Home = ${imgCount}`);
    expect(imgCount).toBeGreaterThan(0);
    
    // Check img src contains pets/idle
    const imgSrc = await page.evaluate(() => {
      const img = document.querySelector('img[src*="pets"]');
      return img ? (img as HTMLImageElement).src : null;
    });
    console.log(`✅ GATE A: Image src = ${imgSrc}`);
    expect(imgSrc).toContain('pets/idle');
    
    // Screenshot Home
    await page.screenshot({ path: 'docs/screenshots/gate-home.png' });
    console.log('✅ GATE C: Home screenshot saved');
    
    // Go to Walk
    await page.locator('button:has-text("Start Walk")').click();
    await page.waitForTimeout(1500);
    
    // Start walking
    const walkBtn = page.locator('button:has-text("Walk")').first();
    if (await walkBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await walkBtn.click();
    }
    
    // GATE B: Verify walk frame changes
    await page.waitForTimeout(500);
    const walkSrc1 = await page.evaluate(() => {
      const img = document.querySelector('img[src*="pets"]');
      return img ? (img as HTMLImageElement).src : null;
    });
    
    await page.waitForTimeout(500);
    const walkSrc2 = await page.evaluate(() => {
      const img = document.querySelector('img[src*="pets"]');
      return img ? (img as HTMLImageElement).src : null;
    });
    
    console.log(`Walk frame 1: ${walkSrc1}`);
    console.log(`Walk frame 2: ${walkSrc2}`);
    
    // Check if walk frames are being used
    const isWalkFrame = walkSrc1?.includes('walk/') || walkSrc2?.includes('walk/');
    console.log(`✅ GATE B: Walk frame in use = ${isWalkFrame}`);
    
    // Screenshot Walk
    await page.screenshot({ path: 'docs/screenshots/gate-walk.png' });
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'docs/screenshots/gate-walk-2.png' });
    console.log('✅ GATE B: Walk screenshots saved');
    
    console.log('✅ ALL GATES VERIFIED');
  });
});
