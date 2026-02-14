import { test, expect } from '@playwright/test';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Authentication Flow', async ({ page }, testInfo) => {
    const tester = new TestStepHelper(page, testInfo);
    tester.setMetadata('Authentication', 'Verifies the authentication flow, including sign-in and protected route access.');

    await page.goto('/');

    await tester.step('01-auth-wall', {
        description: 'Unauthenticated user sees the Auth Wall',
        verifications: [
            { spec: 'Auth Wall heading is visible', check: async () => await expect(page.getByRole('heading', { name: 'Authentication Required' })).toBeVisible() },
            { spec: 'Sign-in prompt text is visible', check: async () => await expect(page.getByText('Please sign in to access the Uptime Monitor.')).toBeVisible() },
            { spec: 'Sign-in button is visible', check: async () => await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible() }
        ]
    });

    // Programmatic Sign-in
    await page.waitForFunction(() => (window as any).signInTestUser);
    await page.evaluate(async () => {
        const win = window as any;
        if (win.signInTestUser) {
            await win.signInTestUser();
        } else {
            throw new Error('signInTestUser helper not found on window. Ensure VITE_FIREBASE_USE_EMULATORS=true.');
        }
    });

    // Wait for the auth state to settle seeing the nav is a good indicator
    await expect(page.locator('nav')).toBeVisible({ timeout: 10000 });

    await tester.step('02-authenticated-dashboard', {
        description: 'Authenticated user sees the Dashboard and Navigation',
        verifications: [
            { spec: 'Auth Window is gone', check: async () => await expect(page.getByRole('heading', { name: 'Authentication Required' })).not.toBeVisible() },
            { spec: 'Nav is visible', check: async () => await expect(page.locator('nav')).toBeVisible() },
            { spec: 'Dashboard link is visible', check: async () => await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible() },
            { spec: 'Admin link is visible', check: async () => await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible() },
            { spec: 'URL is /dashboard', check: async () => await expect(page).toHaveURL(/.*\/dashboard/) }
        ]
    });

    await page.click('text=Admin');
    await tester.step('03-admin-page', {
        description: 'Admin page loads',
        verifications: [
            { spec: 'Header is "Admin Panel"', check: async () => await expect(page.locator('h1')).toHaveText('Admin Panel') },
            { spec: 'URL is /admin', check: async () => await expect(page).toHaveURL(/.*\/admin/) }
        ]
    });

    tester.generateDocs();
});
