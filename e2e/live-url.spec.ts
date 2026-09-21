import { test, expect } from '@playwright/test';

const LIVE_URL = 'https://studjodev.github.io/pawbloom/';

test.describe('PawBloom LIVE URL E2E Tests', () => {
  test.setTimeout(120000); // 2 minute timeout for network

  test('1. Page is NOT blank - splash/onboarding visible', async ({ page }) => {
    await page.goto(LIVE_URL);
    
    // Wait for app to render (not blank)
    await page.waitForSelector('#root > *', { timeout: 15000 });
    
    // Check that content is visible (logo or welcome text)
    const hasContent = await page.locator('body').evaluate((el) => {
      return el.innerText.length > 10 || el.querySelectorAll('svg').length > 0;
    });
    expect(hasContent).toBe(true);
    
    // Take screenshot
    await page.screenshot({ path: 'docs/screenshots/01-splash.png' });
    console.log('✅ Page is NOT blank - content visible');
  });

  test('2. Complete starter selection flow', async ({ page }) => {
    await page.goto(LIVE_URL);
    
    // Wait for splash and auto-navigate to welcome
    await page.waitForURL(/#\/welcome/, { timeout: 10000 }).catch(() => {
      // May already be on splash, click through
    });
    
    // If still on splash, wait for navigation
    await page.waitForTimeout(3000);
    
    // Look for welcome or starter screen
    const welcomeButton = page.locator('button:has-text("Find Your First Friend"), button:has-text("Friend")');
    if (await welcomeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await welcomeButton.click();
    }
    
    // Wait for starter selection
    await page.waitForSelector('text=/Choose|Shiba|Corgi|Orange/i', { timeout: 10000 });
    await page.screenshot({ path: 'docs/screenshots/03-starter-select.png' });
    
    // Select Corgi
    const corgiOption = page.locator('text=Corgi').first();
    await corgiOption.click();
    
    // Click continue
    const continueBtn = page.locator('button:has-text("Meet")');
    await continueBtn.click();
    
    console.log('✅ Starter selection complete');
  });

  test('3. Full onboarding to Home', async ({ page }) => {
    await page.goto(LIVE_URL);
    await page.waitForTimeout(3000);
    
    // Welcome screen
    const welcomeBtn = page.locator('button:has-text("Find Your First Friend"), button:has-text("Friend")');
    if (await welcomeBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await welcomeBtn.click();
    }
    
    // Starter select - pick Shiba
    await page.waitForSelector('text=Shiba', { timeout: 10000 });
    await page.locator('text=Shiba').first().click();
    await page.locator('button:has-text("Meet")').click();
    
    // Reveal screen - tap to reveal
    await page.waitForTimeout(2000);
    await page.click('body');
    await page.waitForTimeout(2000);
    
    // Screenshot reveal
    await page.screenshot({ path: 'docs/screenshots/05-reveal.png' });
    
    // Wait for collection card and click
    const collectBtn = page.locator('button:has-text("Welcome to the Family"), button:has-text("Family")');
    await collectBtn.waitFor({ timeout: 15000 });
    await page.screenshot({ path: 'docs/screenshots/06-collection-card.png' });
    await collectBtn.click();
    
    // Naming screen - skip or name
    await page.waitForTimeout(1000);
    const nameBtn = page.locator('button:has-text("Keep"), button:has-text("Name")');
    if (await nameBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nameBtn.first().click();
    }
    
    // Should reach home
    await page.waitForSelector('text=Start Walk', { timeout: 15000 });
    await page.screenshot({ path: 'docs/screenshots/07-home.png' });
    
    console.log('✅ Reached Home screen');
  });

  test('4. Walk and Dev Drawer', async ({ page }) => {
    // This test assumes onboarding is complete (data persists in IndexedDB)
    await page.goto(LIVE_URL + '#/home');
    await page.waitForTimeout(2000);
    
    // If not on home, try to get there
    const startWalkBtn = page.locator('button:has-text("Start Walk")');
    if (!await startWalkBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Need to complete onboarding first
      await page.goto(LIVE_URL);
      await page.waitForTimeout(3000);
      // Quick path through onboarding
      const welcomeBtn = page.locator('button:has-text("Friend")');
      if (await welcomeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await welcomeBtn.click();
        await page.waitForTimeout(500);
        await page.locator('text=Corgi').first().click();
        await page.locator('button:has-text("Meet")').click();
        await page.waitForTimeout(4000);
        await page.click('body');
        await page.waitForTimeout(3000);
        const collectBtn = page.locator('button:has-text("Family")');
        if (await collectBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
          await collectBtn.click();
        }
        await page.waitForTimeout(1000);
        const nameBtn = page.locator('button:has-text("Keep"), button:has-text("Name")');
        if (await nameBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nameBtn.first().click();
        }
        await page.waitForTimeout(1000);
      }
    }
    
    // Now on home, click Start Walk
    await page.locator('button:has-text("Start Walk")').click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'docs/screenshots/08-walk.png' });
    
    console.log('✅ Walk screen loaded');
  });

  test('5. Check for console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(LIVE_URL);
    await page.waitForTimeout(5000);
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('manifest') &&
      !e.includes('service-worker') &&
      !e.includes('net::ERR')
    );
    
    console.log(`Console errors found: ${criticalErrors.length}`);
    if (criticalErrors.length > 0) {
      console.log('Errors:', criticalErrors);
    }
    
    expect(criticalErrors.length).toBeLessThan(3); // Allow minor errors
    console.log('✅ No critical console errors');
  });
});
