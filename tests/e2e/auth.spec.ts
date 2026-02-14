import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test('User can sign in', async ({ page, context }) => {
        // Monitor console logs to debug CI issues
        page.on('console', msg => console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`));

        // Go to home page
        await page.goto('/');

        // Setup a listener for the popup
        const pagePromise = context.waitForEvent('page');

        // Dispatch click event directly to bypass Playwright stability checks
        await page.getByRole('button', { name: 'Sign in with Google' }).dispatchEvent('click');
        const newPage = await pagePromise;
        const popup = newPage;
        await popup.waitForLoadState();

        // In the emulator, the Google Auth provider page usually has a simplified UI.
        // We look for buttons that allow us to complete the sign-in.
        // Common buttons in the emulator UI: "Add new account", "Auto-generate user info", "Sign in with Google.com"

        // Click "Add new account" if present
        const addAccountBtn = popup.getByText('Add new account');
        if (await addAccountBtn.isVisible()) {
            await addAccountBtn.click({ force: true });
        }

        // Click "Auto-generate user info" if present
        const autoGenBtn = popup.getByText('Auto-generate user info');
        if (await autoGenBtn.isVisible()) {
            await autoGenBtn.click({ force: true });
        }

        // Click "Sign in with Google.com" to finalize
        await popup.getByText('Sign in with Google.com').click({ force: true });

        // Wait for the popup to close
        await popup.waitForEvent('close');

        // Verify we are logged in (Auth Wall gone, Nav visible)
        // Adjust timeout as sign-in redirect + state update might take a moment
        await expect(page.locator('nav')).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('heading', { name: 'Authentication Required' })).not.toBeVisible();
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
