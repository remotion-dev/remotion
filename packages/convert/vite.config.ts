import {defineConfig} from 'vite';
import {installGlobals} from '@remix-run/node';
import path from 'path';
import {vitePlugin as remix} from '@remix-run/dev';
import tsconfigPaths from 'vite-tsconfig-paths';
import {vercelPreset} from '@vercel/remix/vite';

installGlobals();

export default defineConfig({
	plugins: [remix({presets: [vercelPreset()]}), tsconfigPaths()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './app'),
		},
	},
	build: {
		rollupOptions: {
			input: {
				'service-worker': './service-worker.js'
			}
		}
	}
});
