import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment
} from '@firebase/rules-unit-testing';

const projectId = 'demo-antigravity-uptime';
const adminUid = 'rules-admin';
const memberUid = 'rules-member';
let testEnvironment: RulesTestEnvironment;

test.describe('Realtime Database authorization', () => {
  test.beforeAll(async () => {
    const rules = await readFile(new URL('../../../database.rules.json', import.meta.url), 'utf8');
    testEnvironment = await initializeTestEnvironment({
      projectId,
      database: {
        host: '127.0.0.1',
        port: Number(process.env.VITE_FIREBASE_DATABASE_EMULATOR_PORT || 9000),
        rules
      }
    });

    await testEnvironment.clearDatabase();
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await context.database().ref().update({
        [`admins/${adminUid}`]: true,
        'services/example': {
          id: 'example',
          name: 'Example',
          url: 'https://example.com',
          createdAt: Date.now()
        }
      });
    });
  });

  test.afterAll(async () => {
    await testEnvironment.clearDatabase();
    await testEnvironment.cleanup();
  });

  test('requires authentication and reserves event writes for administrators', async () => {
    const anonymous = testEnvironment.unauthenticatedContext().database();
    const member = testEnvironment.authenticatedContext(memberUid).database();
    const admin = testEnvironment.authenticatedContext(adminUid).database();

    await assertFails(anonymous.ref('services').once('value'));
    await assertSucceeds(member.ref('services').once('value'));
    await assertFails(member.ref('events').once('value'));
    await assertFails(member.ref('events/member-event').set(validEvent()));
    await assertSucceeds(admin.ref('events/admin-event').set(validEvent()));
    await expect.poll(async () => {
      const projected = await admin.ref('services/rules-service').once('value');
      return projected.exists();
    }).toBe(true);
    await assertFails(admin.ref('events/invalid-event').set({ type: 'ADD_SERVICE' }));
    await assertFails(admin.ref('services/example/name').set('Tampered'));
  });
});

function validEvent() {
  const timestamp = Date.now();
  return {
    type: 'ADD_SERVICE',
    timestamp,
    user: adminUid,
    payload: {
      id: 'rules-service',
      name: 'Rules service',
      url: 'https://example.com',
      createdAt: timestamp,
      createdBy: adminUid
    }
  };
}
