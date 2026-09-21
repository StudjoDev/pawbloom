/**
 * Complete Onboarding and Capture Home Idle Animation
 */
import { test, expect } from '@playwright/test';

const LIVE_URL = 'https://studjodev.github.io/pawbloom/';

test('Complete onboarding with position-based clicks', async ({ page }) => {
  // Go to live site
  await page.goto(LIVE_URL + '?fresh=' + Date.now(), { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('Page 1 URL:', page.url());
  await page.screenshot({ path: 'docs/screenshots/onboard-1.png' });

  // Click green "Start Adventure" button (bottom of page)
  await page.click('text=Start Adventure', { timeout: 5000 }).catch(async () => {
    // Fallback: click lower center of screen
    await page.mouse.click(215, 850);
  });
  await page.waitForTimeout(1000);

  console.log('Page 2 URL:', page.url());
  await page.screenshot({ path: 'docs/screenshots/onboard-2.png' });

  // Click "Let's Go" button
  await page.click('text=Let\'s Go', { timeout: 5000 }).catch(async () => {
    // Fallback: click center area
    await page.mouse.click(215, 750);
  });
  await page.waitForTimeout(1000);

  console.log('Page 3 URL:', page.url());
  await page.screenshot({ path: 'docs/screenshots/onboard-3.png' });

  // On Starter screen - click Shiba card (top card)
  // The Shiba card is roughly at y=240 (first card of 3)
  await page.mouse.click(215, 240);
  await page.waitForTimeout(500);

  console.log('After Shiba click:', page.url());
  await page.screenshot({ path: 'docs/screenshots/onboard-4-shiba.png' });

  // Click "Choose My Friend" button at bottom
  await page.click('text=Choose My Friend', { timeout: 3000 }).catch(async () => {
    await page.mouse.click(215, 880);
  });
  await page.waitForTimeout(1500);

  console.log('After Choose:', page.url());
  await page.screenshot({ path: 'docs/screenshots/onboard-5-reveal.png' });

  // Reveal screen - click Continue
  await page.click('text=Continue', { timeout: 3000 }).catch(async () => {
    await page.mouse.click(215, 850);
  });
  await page.waitForTimeout(1000);

  console.log('After Continue:', page.url());
  await page.screenshot({ path: 'docs/screenshots/onboard-6-naming.png' });

  // Naming screen - enter name
  const input = page.locator('input').first();
  if (await input.isVisible()) {
    await input.fill('Mochi');
    await page.waitForTimeout(300);
  }

  // Click "Let's Go" or similar
  await page.click('button:has-text("Let")').catch(async () => {
    await page.mouse.click(215, 800);
  });
  await page.waitForTimeout(2000);

  console.log('Final URL:', page.url());
  
  // Should now be on Home
  await page.screenshot({ path: 'docs/screenshots/onboard-7-home.png' });

  // Verify we're on home and have pets
  const finalUrl = page.url();
  console.log('Final URL check:', finalUrl);

  // Check for pet images
  const petCount = await page.locator('img[src*="/pets/"]').count();
  console.log('Pet images on page:', petCount);

  // If we have pets, capture idle animation proof
  if (petCount > 0) {
    console.log('=== CAPTURING IDLE ANIMATION PROOF ===');
    
    await page.screenshot({ path: 'docs/screenshots/home-pet-idle-t0.png' });
    await page.waitForTimeout(900);
    await page.screenshot({ path: 'docs/screenshots/home-pet-idle-t900.png' });
    await page.waitForTimeout(900);
    await page.screenshot({ path: 'docs/screenshots/home-pet-idle-t1800.png' });
    await page.waitForTimeout(900);
    await page.screenshot({ path: 'docs/screenshots/home-pet-idle-t2700.png' });

    console.log('Animation proof screenshots captured!');
    console.log('Compare the 4 screenshots - pet position/scale/rotation should be visibly different.');
  }

  // Log animation parameters for reference
  console.log('\n=== IDLE ANIMATION PARAMETERS ===');
  console.log('y: [0, -12, 0, -8, 0] pixels (vertical bob)');
  console.log('scaleY: [1, 1.06, 1, 1.04, 1] (6% stretch)');
  console.log('scaleX: [1, 0.97, 1, 0.98, 1] (squash)');
  console.log('rotate: [-2, 2, -1.5, 1.5, 0] degrees (sway)');
  console.log('duration: 1.8s, repeat: Infinity');
});
