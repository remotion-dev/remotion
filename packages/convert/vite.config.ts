import {vitePlugin as remix} from '@remix-run/dev';
import {installGlobals} from '@remix-run/node';
import {vercelPreset} from '@vercel/remix/vite';
import path from 'path';
import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

installGlobals();

export default defineConfig({
	plugins: [remix({presets: [vercelPreset()]}), tsconfigPaths()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './app'),
		},
	},
});
