import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test('User can sign in', async ({ page }) => {
        // Go to home page
        await page.goto('/');

        // Check for Sign In button
        const signInButton = page.getByRole('button', { name: 'Sign in with Google' });
        await expect(signInButton).toBeVisible();

        // Note: Actual sign-in with popup in E2E with emulators can be tricky.
        // For now, we verify the button is there.
        // If we want to test the full flow, we might need to mock the popup or use
        // a specific emulator interaction helper.
        // For this iteration, verifying the UI state is a good start.

        // TODO: Implement full emulator sign-in interaction
    });
});
