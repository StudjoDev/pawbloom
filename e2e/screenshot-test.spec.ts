import { test, expect } from '@playwright/test';

const LIVE_URL = 'https://studjodev.github.io/pawbloom/';

test('Screenshot Home and Walk', async ({ page }) => {
  test.setTimeout(120000);
  
  // Go directly to Home (assuming data exists from previous run)
  await page.goto(LIVE_URL + '#/home');
  await page.waitForTimeout(3000);
  
  // Check if we're on Home or need onboarding
  const startWalkBtn = page.locator('button:has-text("Start Walk")');
  const isOnHome = await startWalkBtn.isVisible({ timeout: 5000 }).catch(() => false);
  
  if (!isOnHome) {
    // Need to do onboarding
    await page.goto(LIVE_URL);
    await page.waitForTimeout(3000);
    
    // Welcome
    const welcomeBtn = page.locator('button:has-text("Find")');
    if (await welcomeBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await welcomeBtn.click();
    }
    
    // Pick Corgi
    await page.waitForSelector('text=Corgi', { timeout: 10000 });
    await page.locator('text=Corgi').first().click();
    await page.locator('button:has-text("Meet")').click();
    
    // Reveal
    await page.waitForTimeout(5000);
    await page.click('body');
    await page.waitForTimeout(3000);
    
    // Nickname
    const nickBtn = page.locator('button:has-text("Nickname")');
    if (await nickBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
      await nickBtn.click();
    }
    
    await page.waitForTimeout(1000);
    const keepBtn = page.locator('button:has-text("Keep")');
    if (await keepBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await keepBtn.first().click();
    }
    
    await page.waitForSelector('button:has-text("Start Walk")', { timeout: 15000 });
  }
  
  // Screenshot Home
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'docs/screenshots/hard-gate-home.png', fullPage: true });
  console.log('Home screenshot saved');
  
  // Check for img
  const imgCount = await page.evaluate(() => document.querySelectorAll('img').length);
  console.log(`Images on Home: ${imgCount}`);
  
  // Go to Walk
  await page.locator('button:has-text("Start Walk")').click();
  await page.waitForTimeout(2000);
  
  // Screenshot Walk idle
  await page.screenshot({ path: 'docs/screenshots/hard-gate-walk-idle.png' });
  
  // Start walking
  const walkBtn = page.locator('button:has-text("Walk")').first();
  if (await walkBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await walkBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'docs/screenshots/hard-gate-walk-1.png' });
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'docs/screenshots/hard-gate-walk-2.png' });
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'docs/screenshots/hard-gate-walk-3.png' });
  }
  
  console.log('Walk screenshots saved');
});
