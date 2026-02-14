import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test('User can sign in', async ({ page, context }) => {
        // Monitor console logs to debug CI issues
        page.on('console', msg => console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`));

        // Go to home page
        await page.goto('/');

        // Use programmatic sign-in to bypass popup/COOP issues in CI
        // Wait for the helper to be available (handles hydration delay)
        await page.waitForFunction(() => (window as any).signInTestUser);

        await page.evaluate(async () => {
            const win = window as any;
            if (win.signInTestUser) {
                await win.signInTestUser();
            } else {
                throw new Error('signInTestUser helper not found on window. Ensure VITE_FIREBASE_USE_EMULATORS=true.');
            }
        });

        // Verify we are logged in (Auth Wall gone, Nav visible)
        // Adjust timeout as sign-in redirect + state update might take a moment
        await expect(page.locator('nav')).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('heading', { name: 'Authentication Required' })).not.toBeVisible();

        // Verify redirection to dashboard
        await expect(page).toHaveURL(/.*\/dashboard/);

        // Verify Navigation Links
        await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Home' })).not.toBeVisible();
    });

    test('Unauthenticated user sees Auth Wall', async ({ page }) => {
        await page.goto('/');

        // Verify Auth Wall
        await expect(page.getByRole('heading', { name: 'Authentication Required' })).toBeVisible();
        await expect(page.getByText('Please sign in to access the Uptime Monitor.')).toBeVisible();

        // Verify Sign In Button
        const signInButton = page.getByRole('button', { name: 'Sign in with Google' });
        await expect(signInButton).toBeVisible();
    });
});
