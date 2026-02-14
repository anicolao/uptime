import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	preview: {
		headers: {
			'Cross-Origin-Opener-Policy': 'unsafe-none',
			'Cross-Origin-Embedder-Policy': 'unsafe-none'
		}
	}
});
