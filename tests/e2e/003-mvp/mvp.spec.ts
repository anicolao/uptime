import { test, expect } from '@playwright/test';
import { TestStepHelper } from '../helpers/test-step-helper';
import * as http from 'http';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

// Initialize Admin SDK for seeding
if (!getApps().length) {
    process.env.FIREBASE_DATABASE_EMULATOR_HOST = '127.0.0.1:9000';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
    process.env.GCLOUD_PROJECT = 'antigravity-uptime'; // Match .firebaserc
    initializeApp({
        projectId: 'antigravity-uptime',
        databaseURL: 'http://127.0.0.1:9000?ns=antigravity-uptime'
    });
}

const db = getDatabase();

test.describe('MVP 1-Minute Monitor', () => {
    let server: http.Server;
    const testPort = 9999;
    const testServiceUrl = `http://127.0.0.1:${testPort}/ok`;
    const testServiceName = 'Test Local Service';

    test.beforeAll(async () => {
        // Start a simple HTTP server to monitor
        server = http.createServer((req, res) => {
            if (req.url === '/ok') {
                res.writeHead(200);
                res.end('OK');
            } else {
                res.writeHead(404);
                res.end('Not Found');
            }
        });
        await new Promise<void>((resolve) => server.listen(testPort, resolve));
        console.log(`Test server listening on port ${testPort}`);
    });

    test.afterAll(async () => {
        server.close();
        // Cleanup DB?
        await db.ref('services').remove();
        await db.ref('events').remove();
        await db.ref('status').remove();
        await db.ref('admins').remove();
    });

    test('Full MVP Journey: Admin Add -> Event -> Function -> Monitor Check', async ({ page }, testInfo) => {
        const step = new TestStepHelper(page, testInfo);
        step.setMetadata('MVP Journey', 'Verifies the full loop from Admin UI to Event to Service to Monitor.');

        await step.step('Navigate to Home', {
            description: 'Load the application',
            verifications: [{ spec: 'Auth Heading', check: async () => await expect(page.locator('h1')).toHaveText('Authentication Required', { timeout: 15000 }) }]
        }, async () => {
            await page.goto('/');
            await expect(page.getByText('Loading...')).not.toBeVisible({ timeout: 15000 });
        });

        await step.step('Login and Seed Admin', {
            description: 'Login as test user and seed admin permissions',
            verifications: [{ spec: 'User is Admin', check: async () => await expect(page.locator('text=Sign Out')).toBeVisible() }]
        }, async () => {
            // Login
            await page.evaluate(async () => {
                const w = window as any;
                if (w.signInTestUser) {
                    await w.signInTestUser();
                } else {
                    throw new Error('signInTestUser not found');
                }
            });
            await expect(page.locator('text=Sign Out')).toBeVisible();

            // Get UID
            const uid = await page.evaluate(() => {
                const w = window as any;
                return w.firebaseAuth?.currentUser?.uid;
            });
            expect(uid).toBeTruthy();

            // Seed Admin
            console.log(`Seeding admin permission for UID: ${uid}`);
            await db.ref(`admins/${uid}`).set(true);
        });

        await step.step('Admin: Add Service', {
            description: 'Navigate to Admin and add a service',
            verifications: [
                { spec: 'Success Message', check: async () => await expect(page.locator('text=dispatch dispatched!')).toBeVisible() }, // Approximate text match
                { spec: 'Event in List', check: async () => await expect(page.locator('text=ADD_SERVICE')).toBeVisible() }
            ]
        }, async () => {
            await page.goto('/admin');
            await page.fill('#name', testServiceName);
            await page.fill('#url', testServiceUrl);
            await page.click('button:has-text("Dispatch Add Event")');
            // Wait for event to appear in list (reactive)
            await expect(page.locator('table')).toContainText(testServiceName);
        });

        await step.step('Verify Service Processing', {
            description: 'Wait for Cloud Function to process event and create service',
            verifications: [
                // logic check in code
            ]
        }, async () => {
            // Polling DB via Admin SDK to verify creation
            await expect(async () => {
                const snap = await db.ref('services').orderByChild('name').equalTo(testServiceName).once('value');
                expect(snap.exists()).toBe(true);
            }).toPass({ timeout: 10000 });
        });

        await step.step('Trigger Monitor', {
            description: 'Manually trigger the monitor function',
            verifications: []
        }, async () => {
            // Call the manual trigger
            // Note: In emulators, HTTP functions are at http://127.0.0.1:5001/<project>/us-central1/<function>
            // We need to fetch this URL.
            // The emulator command usually picks up project ID from .firebaserc or --project.
            // Let's assume 'antigravity-uptime' from .firebaserc.
            const triggerUrl = `http://127.0.0.1:5001/antigravity-uptime/us-central1/manualCheck`;
            console.log(`Triggering monitor at ${triggerUrl}`);
            const response = await page.request.get(triggerUrl);
            expect(response.status()).toBe(200);
        });

        await step.step('Verify Dashboard Status', {
            description: 'Check dashboard for UP status',
            verifications: [
                { spec: 'Service Visible', check: async () => await expect(page.locator(`text=${testServiceName}`)).toBeVisible() },
                { spec: 'Status OPERATIONAL', check: async () => await expect(page.locator(`text=OPERATIONAL`)).toBeVisible({ timeout: 10000 }) }
            ]
        }, async () => {
            await page.goto('/');
        });

        step.generateDocs();
    });
});
