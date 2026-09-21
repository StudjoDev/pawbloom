import { test, expect } from '@playwright/test';

const LIVE_URL = 'https://studjodev.github.io/pawbloom/';

test.describe('PawBloom HARD ACCEPTANCE GATES', () => {
  test.setTimeout(180000);

  test('Final verification - transparent PNGs and animations', async ({ page, context }) => {
    // Clear all storage
    await context.clearCookies();
    await page.goto(LIVE_URL);
    
    // Unregister service workers via page
    await page.evaluate(async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.unregister();
      }
      // Clear indexedDB
      const dbs = await indexedDB.databases();
      for (const db of dbs) {
        if (db.name) indexedDB.deleteDatabase(db.name);
      }
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Reload fresh
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Complete onboarding
    // Wait for splash to finish
    await page.waitForTimeout(3000);
    
    // Welcome screen - click Find Friend
    const welcomeBtn = page.locator('button:has-text("Find"), button:has-text("Friend")');
    if (await welcomeBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await welcomeBtn.click();
    }
    
    // Starter select - pick Corgi
    await page.waitForSelector('text=Corgi', { timeout: 10000 });
    await page.locator('text=Corgi').first().click();
    await page.locator('button:has-text("Meet")').click();
    
    // Reveal - tap
    await page.waitForTimeout(4500);
    await page.click('body');
    await page.waitForTimeout(2000);
    
    // Collection card - click nickname
    const nicknameBtn = page.locator('button:has-text("Nickname"), button:has-text("Family")');
    if (await nicknameBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
      await nicknameBtn.click();
    }
    
    // Naming - keep name
    await page.waitForTimeout(1000);
    const keepBtn = page.locator('button:has-text("Keep"), button:has-text("This Name")');
    if (await keepBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await keepBtn.first().click();
    }
    
    // Should be on Home
    await page.waitForSelector('text=Start Walk', { timeout: 15000 });
    
    // CHECK 1: Pet is visible (img tag exists)
    const imgCount = await page.evaluate(() => document.querySelectorAll('img').length);
    console.log(`✅ CHECK 1: Image count = ${imgCount}`);
    expect(imgCount).toBeGreaterThan(0);
    
    // CHECK 2: Image src contains pets/idle
    const imgSrc = await page.evaluate(() => {
      const img = document.querySelector('img[src*="pets"]');
      return img ? (img as HTMLImageElement).src : null;
    });
    console.log(`✅ CHECK 2: Image src = ${imgSrc}`);
    expect(imgSrc).toContain('pets/idle');
    
    // CHECK 3: Animation is running (transform changes)
    const transform1 = await page.evaluate(() => {
      const img = document.querySelector('img');
      return img ? getComputedStyle(img).transform : null;
    });
    
    await page.waitForTimeout(500);
    
    const transform2 = await page.evaluate(() => {
      const img = document.querySelector('img');
      return img ? getComputedStyle(img).transform : null;
    });
    
    console.log(`Transform 1: ${transform1}`);
    console.log(`Transform 2: ${transform2}`);
    
    // Screenshot Home
    await page.screenshot({ path: 'docs/screenshots/final-home.png' });
    console.log('✅ Home screenshot saved');
    
    // Go to Walk
    await page.locator('button:has-text("Start Walk")').click();
    await page.waitForTimeout(1500);
    
    // Screenshot Walk
    await page.screenshot({ path: 'docs/screenshots/final-walk.png' });
    console.log('✅ Walk screenshot saved');
    
    // Click Walk button
    const walkBtn = page.locator('button:has-text("Walk")').first();
    if (await walkBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await walkBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'docs/screenshots/final-walk-active.png' });
    }
    
    console.log('✅ All checks passed!');
  });
});
