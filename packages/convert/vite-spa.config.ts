import {vitePlugin as remix} from '@remix-run/dev';
import {installGlobals} from '@remix-run/node';
import path from 'path';
import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

installGlobals();

export default defineConfig({
	plugins: [
		remix({ssr: false, buildDirectory: path.resolve(__dirname, 'spa-dist')}),
		tsconfigPaths(),
	],
	base: '/convert/',
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './app'),
		},
	},
});
