import { test, expect } from '@playwright/test';
import { TestStepHelper } from '../helpers/test-step-helper';

test('App Scaffolding Verification', async ({ page }, testInfo) => {
    const tester = new TestStepHelper(page, testInfo);
    tester.setMetadata('Scaffolding', 'Verifies the initial app structure (Auth Wall).');

    await page.goto('/');

    await tester.step('home-page', {
        description: 'Home page loads with Auth Wall',
        verifications: [
            { spec: 'Auth Wall Header is visible', check: async () => await expect(page.getByRole('heading', { name: 'Authentication Required' })).toBeVisible() },
            { spec: 'Sign In button is visible', check: async () => await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible() }
        ]
    });

    tester.generateDocs();
});
