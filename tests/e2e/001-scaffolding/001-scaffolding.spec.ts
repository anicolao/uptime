import { test, expect } from '@playwright/test';
import { TestStepHelper } from '../helpers/test-step-helper';

test('App Scaffolding Verification', async ({ page }, testInfo) => {
    const tester = new TestStepHelper(page, testInfo);
    tester.setMetadata('Scaffolding', 'Verifies the initial app structure.');

    await page.goto('/');

    await tester.step('home-page', {
        description: 'Home page loads with navigation',
        verifications: [
            { spec: 'Nav is visible', check: async () => await expect(page.locator('nav')).toBeVisible() },
            // Use stricter selector that allows for base path variations or just check text
            { spec: 'Home link is visible', check: async () => await expect(page.getByRole('link', { name: 'Home' })).toBeVisible() }
        ]
    });

    await page.click('text=Admin');
    await tester.step('admin-page', {
        description: 'Admin page loads',
        verifications: [
            { spec: 'Header is "Admin Panel"', check: async () => await expect(page.locator('h1')).toHaveText('Admin Panel') }
        ]
    });

    await page.click('text=Dashboard');
    await tester.step('dashboard-page', {
        description: 'Dashboard page loads',
        verifications: [
            { spec: 'Header is "Uptime Dashboard"', check: async () => await expect(page.locator('h1')).toHaveText('Uptime Dashboard') }
        ]
    });

    tester.generateDocs();
});
