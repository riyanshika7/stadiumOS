import { test, expect } from '@playwright/test';

test.describe('StadiumOS E2E Operations Flow', () => {
  
  test('should load landing page and display main title and navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Check main title branding
    await expect(page.locator('h1.hero-main-title')).toBeVisible();
    await expect(page.locator('h1.hero-main-title')).toContainText('The AI Operating System');
    
    // Check navigation links
    await expect(page.locator('span.landing-nav-link:has-text("System Home")')).toBeVisible();
    await expect(page.locator('span.landing-nav-link:has-text("AI Swarm")')).toBeVisible();
  });

  test('should transition to operations dashboard console on CTA click', async ({ page }) => {
    await page.goto('/');
    
    // Click the "Enter Console" CTA
    const enterConsoleBtn = page.locator('button.btn-neon-cta');
    await expect(enterConsoleBtn).toBeVisible();
    await enterConsoleBtn.click();
    
    // Verify it transitions to the dashboard workspace container
    await expect(page.locator('.app-container')).toBeVisible();
    await expect(page.locator('h3.card-title:has-text("Briefing")')).toBeVisible();
    
    // Verify our custom What-If Simulator and Digital Twin cockpit are present in dashboard
    await expect(page.locator('h3.card-title:has-text("Digital Twin Cockpit")')).toBeVisible();
    await expect(page.locator('h3.card-title:has-text("Concourse Congestion Simulator")')).toBeVisible();
  });

  test('should inspect What-If simulator interaction', async ({ page }) => {
    await page.goto('/');
    
    // Transition to dashboard console
    await page.locator('button.btn-neon-cta').click();
    await expect(page.locator('.app-container')).toBeVisible();

    // Verify congestion simulator is visible
    const simulatorTitle = page.locator('h3.card-title:has-text("Concourse Congestion Simulator")');
    await expect(simulatorTitle).toBeVisible();
    
    // Click simulated prediction run
    const simBtn = page.locator('button:has-text("Run Simulation Analysis")');
    await expect(simBtn).toBeVisible();
    await simBtn.click();
    
    // Check that results display
    await expect(page.locator('span:has-text("Simulated Congestion Risk")')).toBeVisible();
  });
});
