import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests/e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		baseURL: 'http://localhost:5173',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
		
		// Force software rendering for consistency across environments
		launchOptions: {
			args: [
				'--font-render-hinting=none',
				'--disable-font-subpixel-positioning',
				'--disable-lcd-text',
				'--disable-skia-runtime-opts',
				'--disable-system-font-check',
				'--disable-features=FontAccess,WebRtcHideLocalIpsWithMdns',
				'--force-device-scale-factor=1',
				'--disable-accelerated-2d-canvas',
				'--disable-gpu',
				'--use-gl=swiftshader',
				'--disable-smooth-scrolling',
			],
		},
		viewport: { width: 1280, height: 720 },
		deviceScaleFactor: 1,
		timezoneId: 'America/New_York',
		locale: 'en-US',
	},
	expect: {
		timeout: 5000,
		toHaveScreenshot: {
			maxDiffPixels: 0,
			threshold: 0,
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		},
	},
	webServer: {
		command: 'npm run dev',
		url: 'http://localhost:5173',
		reuseExistingServer: !process.env.CI,
		stdout: 'ignore',
		stderr: 'pipe',
	},
});
