import { test, expect } from '@playwright/test';

test('App loads and navigates', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();

    await page.click('text=Admin');
    await expect(page.locator('h1')).toHaveText('Admin Panel');

    await page.click('text=Dashboard');
    await expect(page.locator('h1')).toHaveText('Uptime Dashboard');
});
