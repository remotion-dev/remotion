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
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './app'),
		},
	},
});
