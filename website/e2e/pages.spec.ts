import { test, expect } from '@playwright/test';

const pages = [
  { path: './', titleMatch: /Home/ },
  { path: './services', titleMatch: /Services/ },
  { path: './services/costing', titleMatch: /Costing/ },
  { path: './spreadsheet-says', titleMatch: /Spreadsheet Says/ },
  { path: './resources', titleMatch: /Resources/ },
  { path: './about', titleMatch: /About/ },
  { path: './pricing', titleMatch: /Pricing/ },
  { path: './contact', titleMatch: /Contact/ },
  { path: './faq', titleMatch: /FAQ/ },
  { path: './public-work', titleMatch: /Public Work/ },
  { path: './case-notes', titleMatch: /Case Notes/ },
];

for (const { path, titleMatch } of pages) {
  test(`${path} loads successfully`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(titleMatch);
  });
}

test('services page lists all 6 services', async ({ page }) => {
  await page.goto('./services');
  const cards = page.locator('[href*="/services/"]');
  await expect(cards).toHaveCount(6);
});

test('spreadsheet-says page lists models', async ({ page }) => {
  await page.goto('./spreadsheet-says');
  const cards = page.locator('[href*="/spreadsheet-says/"]');
  expect(await cards.count()).toBeGreaterThanOrEqual(1);
});
