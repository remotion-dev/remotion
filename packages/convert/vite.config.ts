import {vitePlugin as remix} from '@remix-run/dev';
import {installGlobals} from '@remix-run/node';
import {vercelPreset} from '@vercel/remix/vite';
import path from 'path';
import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

installGlobals();

export default defineConfig({
	plugins: [
		remix({
			presets: [vercelPreset()],
			future: {
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_lazyRouteDiscovery: true,
				v3_routeConfig: false,
				v3_singleFetch: true,
				v3_throwAbortReason: true,
			},
		}),
		tsconfigPaths(),
	],
	optimizeDeps: {
		// turn off dependency optimization: https://github.com/vitejs/vite/issues/11672#issuecomment-1397855641
		exclude: ['@remotion/whisper-web'],
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './app'),
		},
	},
	server: {
		headers: {
			'Cross-Origin-Embedder-Policy': 'require-corp',
			'Cross-Origin-Opener-Policy': 'same-origin',
		},
	},
});
