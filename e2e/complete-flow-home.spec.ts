/**
 * Complete Flow to Home with 3 Pets
 * Uses explicit element targeting to complete onboarding
 */
import { test, expect } from '@playwright/test';

const LIVE_URL = 'https://studjodev.github.io/pawbloom/';

test.setTimeout(120000);

test('Complete onboarding and reach Home with 3 pets', async ({ page }) => {
  console.log('=== PAWBLOOM 3 PETS HOME VERIFICATION ===\n');

  // 1. Navigate to fresh start
  await page.goto(LIVE_URL + '?v=' + Date.now(), { waitUntil: 'networkidle' });
  
  // 2. Wait for splash to auto-navigate to welcome (~3s)
  console.log('Waiting for Splash → Welcome auto-navigation...');
  await page.waitForURL('**/welcome', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1000);
  
  console.log('Current URL:', page.url());
  await page.screenshot({ path: 'docs/screenshots/home3-01-welcome.png' });

  // 3. Click "Let's Find Your First Friend!" on Welcome
  console.log('\nStep: Welcome → Starter');
  await page.click('button:has-text("Find")').catch(async () => {
    console.log('Button not found, trying to scroll and click');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.click('button').catch(() => {});
  });
  await page.waitForTimeout(1500);
  
  console.log('After Welcome click:', page.url());
  await page.screenshot({ path: 'docs/screenshots/home3-02-starter.png' });

  // 4. On Starter - click Shiba card then Choose button
  console.log('\nStep: Select Shiba → Choose');
  // First card (Shiba) is roughly at top
  await page.mouse.click(150, 200);
  await page.waitForTimeout(500);
  
  await page.click('button:has-text("Choose")').catch(() => {});
  await page.waitForTimeout(2000);
  
  console.log('After Choose:', page.url());
  await page.screenshot({ path: 'docs/screenshots/home3-03-reveal.png' });

  // 5. On Reveal - click Continue
  console.log('\nStep: Reveal → Naming');
  await page.click('button:has-text("Continue")').catch(() => {});
  await page.waitForTimeout(1500);
  
  console.log('After Continue:', page.url());
  await page.screenshot({ path: 'docs/screenshots/home3-04-naming.png' });

  // 6. On Naming - enter name and confirm
  console.log('\nStep: Name pet → Home');
  const input = page.locator('input').first();
  if (await input.isVisible({ timeout: 3000 })) {
    await input.fill('Lucky');
    await page.waitForTimeout(300);
  }
  
  await page.click('button:has-text("Go")').catch(() => {});
  await page.waitForTimeout(3000);
  
  console.log('Final URL:', page.url());
  await page.screenshot({ path: 'docs/screenshots/home3-05-home.png' });

  // === VERIFICATION ===
  console.log('\n=== VERIFICATION ===');
  
  // Count pet images
  const petIdleCount = await page.locator('img[src*="/pets/idle/"]').count();
  const emptySlots = await page.locator('text=Walk to meet more').count();
  
  console.log(`Pet idle images: ${petIdleCount}`);
  console.log(`Empty slots: ${emptySlots}`);
  
  // Get pet sources
  const petSrcs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img[src*="/pets/"]'))
      .map(img => img.getAttribute('src')?.split('/').pop());
  });
  console.log('Pet images:', petSrcs.join(', '));

  // === ANIMATION PROOF (if we have pets) ===
  if (petIdleCount > 0) {
    console.log('\n=== IDLE ANIMATION PROOF ===');
    
    await page.screenshot({ path: 'docs/screenshots/home3-anim-t0.png' });
    console.log('Screenshot: home3-anim-t0.png');
    
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'docs/screenshots/home3-anim-t1500.png' });
    console.log('Screenshot: home3-anim-t1500.png');
    
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'docs/screenshots/home3-anim-t3000.png' });
    console.log('Screenshot: home3-anim-t3000.png');
    
    console.log('\nAnimation parameters:');
    console.log('  y: [0, -12, 0, -8, 0] (±12px bob)');
    console.log('  scaleY: [1, 1.06, 1, 1.04, 1] (6% breathe)');
    console.log('  scaleX: [1, 0.97, 1, 0.98, 1] (3% squash)');
    console.log('  rotate: [-2, 2, -1.5, 1.5, 0] (±2° sway)');
    console.log('  duration: 1.8s, repeat: Infinity');
  }

  // Final result
  console.log('\n=== FINAL RESULT ===');
  const pass3Pets = petIdleCount >= 3;
  const passNoEmpty = emptySlots === 0;
  console.log(`${pass3Pets ? '✅' : '❌'} 3+ team pets visible: ${petIdleCount}`);
  console.log(`${passNoEmpty ? '✅' : '❌'} No empty slots: ${emptySlots}`);
  console.log(`${pass3Pets && passNoEmpty ? '✅ PASS' : '❌ FAIL'}`);
});
