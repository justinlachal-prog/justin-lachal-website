import { test, expect } from '@playwright/test';

test.describe('Contact form', () => {
  test('pathway buttons update hidden field', async ({ page }) => {
    await page.goto('./contact');
    await page.getByText('I need a review').click();
    const hidden = page.locator('#pathway-field');
    await expect(hidden).toHaveValue('review');
    await page.getByText('I want a workshop or talk').click();
    await expect(hidden).toHaveValue('workshop');
  });

  test('form has all required fields', async ({ page }) => {
    await page.goto('./contact');
    await expect(page.locator('#description')).toBeVisible();
    await expect(page.locator('#organisation')).toBeVisible();
    await expect(page.locator('#timing')).toBeVisible();
    await expect(page.locator('#preference')).toBeVisible();
  });

  test('description field is required', async ({ page }) => {
    await page.goto('./contact');
    const description = page.locator('#description');
    await expect(description).toHaveAttribute('required', '');
  });
});
