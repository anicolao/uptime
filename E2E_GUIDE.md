# E2E Testing Guide

This project uses [Playwright](https://playwright.dev/) for End-to-End testing.

## 1. The Philosophy: "Zero-Pixel Tolerance"

We enforce a strict **Zero-Pixel Tolerance** policy. Visual state is the primary feedback mechanism. Any deviation is a bug.

*   **Software Rendering**: We use software rendering to ensure consistency.
*   **Determinism**: Tests must be deterministic.

## 2. Test Structure

Tests live in `tests/e2e/`.

```
tests/e2e/
├── helpers/                   # Shared utilities (TestStepHelper)
├── 001-scaffolding/           # Scenario Directory
│   ├── 001-scaffolding.spec.ts # Main test file
│   └── screenshots/           # Committed baseline images
```

## 3. The "Unified Step Pattern"

Use `TestStepHelper` to combine documentation, verification, and capturing.

```typescript
import { test, expect } from '@playwright/test';
import { TestStepHelper } from '../helpers/test-step-helper';

test('App Scaffolding Verification', async ({ page }, testInfo) => {
    const tester = new TestStepHelper(page, testInfo);
    tester.setMetadata('Scaffolding', 'Verifies the initial app structure.');

    await page.goto('/');

    await tester.step('01-home-page', {
        description: 'Home page loads with navigation',
        verifications: [
            { spec: 'Nav is visible', check: async () => await expect(page.locator('nav')).toBeVisible() }
        ]
    });
    
    // ...
});
```

## 4. Running Tests

-   **Run All Tests**: `npm run test:e2e`
-   **Update Snapshots**: `npx playwright test --update-snapshots`
-   **Show Report**: `npx playwright show-report`
