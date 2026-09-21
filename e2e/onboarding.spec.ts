import { test, expect } from '@playwright/test';

test.describe('PawBloom Onboarding', () => {
  test('should display splash screen with logo', async ({ page }) => {
    await page.goto('/');
    
    // Wait for logo to appear
    await expect(page.locator('h1:has-text("PawBloom")')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate through welcome screen', async ({ page }) => {
    await page.goto('/welcome');
    
    // Check welcome content
    await expect(page.locator('h1:has-text("Welcome to PawBloom")')).toBeVisible();
    
    // Check CTA button
    const ctaButton = page.locator('button:has-text("Find Your First Friend")');
    await expect(ctaButton).toBeVisible();
    
    // Click to proceed
    await ctaButton.click();
    
    // Should navigate to starter selection
    await expect(page).toHaveURL('/starter');
  });

  test('should select starter pet and proceed', async ({ page }) => {
    await page.goto('/starter');
    
    // Check title
    await expect(page.locator('h1:has-text("Choose Your First Friend")')).toBeVisible();
    
    // Select Shiba Inu
    const shibaCard = page.locator('text=Shiba Inu').first();
    await shibaCard.click();
    
    // Button should be enabled
    const continueButton = page.locator('button:has-text("Meet")');
    await expect(continueButton).toBeEnabled();
    
    // Click to proceed
    await continueButton.click();
    
    // Should navigate to reveal
    await expect(page).toHaveURL('/reveal');
  });

  test('complete full onboarding flow', async ({ page }) => {
    // Start from splash
    await page.goto('/');
    
    // Wait for auto-navigation to welcome
    await page.waitForURL('/welcome', { timeout: 5000 });
    
    // Click through welcome
    await page.locator('button:has-text("Find Your First Friend")').click();
    await page.waitForURL('/starter');
    
    // Select a pet
    await page.locator('text=Corgi').first().click();
    await page.locator('button:has-text("Meet")').click();
    await page.waitForURL('/reveal');
    
    // Tap to reveal (click anywhere)
    await page.click('body');
    
    // Wait for card to appear
    await page.waitForSelector('text=Welcome to the Family', { timeout: 10000 });
    
    // Click to collect
    await page.locator('button:has-text("Welcome to the Family")').click();
    
    // Should navigate to home
    await page.waitForURL('/home', { timeout: 5000 });
    
    // Check home screen
    await expect(page.locator('text=Start Walk')).toBeVisible();
  });
});
