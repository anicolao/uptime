import { test, expect } from '@playwright/test';
import * as http from 'node:http';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { TestStepHelper } from '../helpers/test-step-helper';

const projectId = 'demo-antigravity-uptime';
const databasePort = process.env.VITE_FIREBASE_DATABASE_EMULATOR_PORT || '9000';
const authPort = process.env.VITE_FIREBASE_AUTH_EMULATOR_PORT || '9099';
process.env.FIREBASE_DATABASE_EMULATOR_HOST = `127.0.0.1:${databasePort}`;
process.env.FIREBASE_AUTH_EMULATOR_HOST = `127.0.0.1:${authPort}`;
process.env.GCLOUD_PROJECT = projectId;

if (getApps().length === 0) {
    initializeApp({
        projectId,
        databaseURL: `http://127.0.0.1:${databasePort}?ns=${projectId}`
    });
}

const db = getDatabase();

test.describe('MVP 1-Minute Monitor', () => {
    let server: http.Server;
    const testPort = 9999;
    const testServiceUrl = `http://127.0.0.1:${testPort}/ok`;
    const testServiceName = 'Test Local Service';

    test.beforeAll(async () => {
        await db.ref().set(null);
        server = http.createServer((request, response) => {
            if (request.url === '/ok') {
                response.writeHead(200, { 'content-type': 'text/plain' });
                response.end('OK');
                return;
            }
            response.writeHead(404);
            response.end('Not Found');
        });
        await new Promise<void>((resolve) => server.listen(testPort, '127.0.0.1', resolve));
    });

    test.afterAll(async () => {
        await db.ref().set(null);
        await new Promise<void>((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    });

    test('Full MVP Journey: Admin Add -> Event -> Function -> Monitor Check', async ({ page }, testInfo) => {
        const step = new TestStepHelper(page, testInfo);
        step.setMetadata('MVP Journey', 'Verifies the private workflow from an administrator event through service projection and an authenticated monitor check.');

        await step.step('Navigate to Home', {
            description: 'Load the private application while signed out.',
            verifications: [
                { spec: 'Authentication is required', check: async () => await expect(page.getByRole('heading', { name: 'Authentication Required' })).toBeVisible() }
            ]
        }, async () => {
            await page.goto('/');
            await expect(page.getByTestId('auth-loading')).not.toBeVisible({ timeout: 15000 });
        });

        await step.step('Login and Seed Admin', {
            description: 'Sign in through the Auth emulator and grant the test user administrator access.',
            verifications: [
                { spec: 'User is signed in', check: async () => await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible() },
                { spec: 'Component provenance is available', check: async () => await expect(page.getByLabel('Component versions')).toContainText('Database rules', { timeout: 15000 }) }
            ]
        }, async () => {
            await page.waitForFunction(() => window.signInTestUser);
            await page.evaluate(() => window.signInTestUser?.());
            const uid = await page.evaluate(() => window.firebaseAuth?.currentUser?.uid);
            expect(uid).toBeTruthy();
            await db.ref(`admins/${uid}`).set(true);
        });

        await step.step('Admin Add Service', {
            description: 'Dispatch an ADD_SERVICE event from the administrator UI.',
            verifications: [
                { spec: 'Success message is visible', check: async () => await expect(page.getByText(/queued for monitoring/)).toBeVisible() },
                { spec: 'Event log contains ADD_SERVICE', check: async () => await expect(page.getByText('ADD_SERVICE')).toBeVisible() },
                { spec: 'Event log contains the service', check: async () => await expect(page.locator('table')).toContainText(testServiceName) }
            ]
        }, async () => {
            await page.goto('/admin');
            await expect(page.getByRole('heading', { name: 'Add service' })).toBeVisible();
            await page.getByLabel('Service name').fill(testServiceName);
            await page.getByLabel('Service URL').fill(testServiceUrl);
            await page.getByRole('button', { name: 'Add service' }).click();
        });

        await step.step('Verify Service Processing', {
            description: 'Verify the database-triggered Function projects the event into services.',
            verifications: [
                {
                    spec: 'Projected service exists',
                    check: async () => await expect(async () => {
                        const snapshot = await db.ref('services').get();
                        const services = Object.values(snapshot.val() || {}) as Array<{ name?: string }>;
                        expect(services.some((service) => service.name === testServiceName)).toBe(true);
                    }).toPass({ timeout: 15000 })
                }
            ]
        });

        await step.step('Trigger Monitor', {
            description: 'Run the protected manual monitor endpoint as the administrator.',
            verifications: [
                {
                    spec: 'Monitor records an operational status',
                    check: async () => await expect(async () => {
                        const snapshot = await db.ref('status').get();
                        const statuses = Object.values(snapshot.val() || {}) as Array<{ up?: boolean; statusCode?: number }>;
                        expect(statuses).toHaveLength(1);
                        expect(statuses[0]).toMatchObject({ up: true, statusCode: 200 });
                    }).toPass({ timeout: 10000 })
                }
            ]
        }, async () => {
            const token = await page.evaluate(() => window.firebaseAuth?.currentUser?.getIdToken());
            expect(token).toBeTruthy();
            const response = await page.request.get(
                `http://127.0.0.1:5001/${projectId}/us-central1/manualCheck`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            expect(response.status()).toBe(200);
            expect(await response.json()).toEqual({ checked: 1 });
        });

        await step.step('Verify Dashboard Status', {
            description: 'Display the monitored service and its current status on the private dashboard.',
            verifications: [
                { spec: 'Service is visible', check: async () => await expect(page.getByText(testServiceName)).toBeVisible() },
                { spec: 'Status is operational', check: async () => await expect(page.getByText('OPERATIONAL')).toBeVisible() },
                { spec: 'HTTP status is displayed', check: async () => await expect(page.getByText('200', { exact: true })).toBeVisible() }
            ]
        }, async () => {
            await page.goto('/dashboard');
            await expect(page.getByTestId('services-loading')).not.toBeVisible({ timeout: 10000 });
        });

        step.generateDocs();
    });
});
