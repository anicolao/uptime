import { readFile } from 'node:fs/promises';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

const projectId = 'demo-antigravity-uptime';

export default async function globalSetup() {
	const rules = await readFile(new URL('../../database.rules.json', import.meta.url), 'utf8');
	const testEnvironment = await initializeTestEnvironment({
		projectId,
		database: {
			host: '127.0.0.1',
			port: Number(process.env.VITE_FIREBASE_DATABASE_EMULATOR_PORT || 9000),
			rules,
		},
	});

	await testEnvironment.clearDatabase();
	await testEnvironment.cleanup();
}
