import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('home page loads with correct title', async ({ page }) => {
    await page.goto('./');
    await expect(page).toHaveTitle(/Home.*Justin Lachal/);
  });

  test('header contains all nav links', async ({ page }) => {
    await page.goto('./');
    const nav = page.locator('header nav');
    await expect(nav.getByText('Services')).toBeVisible();
    await expect(nav.getByText('Spreadsheet Says')).toBeVisible();
    await expect(nav.getByText('Resources')).toBeVisible();
    await expect(nav.getByText('About')).toBeVisible();
    await expect(nav.getByText('Contact')).toBeVisible();
  });

  test('clicking Services navigates to services page', async ({ page }) => {
    await page.goto('./');
    await page.locator('header nav').getByText('Services').click();
    await expect(page).toHaveURL(/\/services/);
    await expect(page.locator('h1, h2').first()).toContainText('Services');
  });

  test('footer contains pricing and FAQ links', async ({ page }) => {
    await page.goto('./');
    const footer = page.locator('footer');
    await expect(footer.getByText('Pricing')).toBeVisible();
    await expect(footer.getByText('FAQ')).toBeVisible();
  });
});
