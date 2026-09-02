import { test, expect } from '@playwright/test';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Authentication Flow', async ({ page }, testInfo) => {
    const tester = new TestStepHelper(page, testInfo);
    tester.setMetadata('Authentication', 'Verifies authentication, private routing, provenance, and administrator access control.');

    await page.goto('/');

    await tester.step('01-auth-wall', {
        description: 'Unauthenticated users see the authentication wall.',
        verifications: [
            { spec: 'Authentication heading is visible', check: async () => await expect(page.getByRole('heading', { name: 'Authentication Required' })).toBeVisible() },
            { spec: 'Sign-in prompt is visible', check: async () => await expect(page.getByText('Please sign in to access the Uptime Monitor.')).toBeVisible() },
            { spec: 'Sign-in button is visible', check: async () => await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible() }
        ]
    });

    await page.waitForFunction(() => window.signInTestUser);
    await page.evaluate(() => window.signInTestUser?.());

    await tester.step('02-authenticated-dashboard', {
        description: 'Authenticated users are redirected to the private dashboard and can see component provenance.',
        verifications: [
            { spec: 'Primary navigation is visible', check: async () => await expect(page.getByRole('navigation')).toBeVisible() },
            { spec: 'Dashboard link is visible', check: async () => await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible() },
            { spec: 'Admin link is visible', check: async () => await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible() },
            { spec: 'URL is /dashboard', check: async () => await expect(page).toHaveURL(/\/dashboard$/) },
            { spec: 'All component versions are reported', check: async () => await expect(page.getByLabel('Component versions')).toContainText('Database rules', { timeout: 15000 }) }
        ]
    });

    await page.getByRole('link', { name: 'Admin' }).click();
    await tester.step('03-admin-page', {
        description: 'An authenticated non-admin is denied administrator controls.',
        verifications: [
            { spec: 'Admin page loads', check: async () => await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible() },
            { spec: 'Administrator access is required', check: async () => await expect(page.getByRole('heading', { name: 'Administrator access required' })).toBeVisible() },
            { spec: 'URL is /admin', check: async () => await expect(page).toHaveURL(/\/admin$/) }
        ]
    });

    tester.generateDocs();
});
