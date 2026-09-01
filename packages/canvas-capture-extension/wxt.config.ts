import {homedir} from 'node:os';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'wxt';

const homeDirectory = homedir();
const isDevelopment = process.env.npm_lifecycle_event === 'dev';

export default defineConfig({
	srcDir: 'src',
	publicDir: 'src/public',
	manifestVersion: 3,
	outDir: isDevelopment
		? path.join(
				homeDirectory,
				'Applications',
				'Remotion Canvas Capture Extension Dev',
			)
		: 'dist',
	outDirTemplate: '.',
	manifest: {
		name: 'Remotion Canvas Capture',
		description:
			'Record any element on a webpage as a high-resolution MP4 or WebM.',
		version: '0.1.0',
		permissions: ['activeTab', 'scripting', 'storage', 'unlimitedStorage'],
		action: {
			default_title: 'Open Remotion Canvas Capture',
			default_popup: 'recorder.html',
		},
	},
	webExt: {
		binaries: {
			chrome: path.join(
				homeDirectory,
				'Applications',
				'Recorder Chrome.app',
				'Contents',
				'MacOS',
				'Google Chrome for Testing',
			),
		},
		chromiumArgs: [
			`--user-data-dir=${path.join(
				homeDirectory,
				'Library',
				'Application Support',
				'Chrome for Testing Canvas Capture r1631007',
			)}`,
			'--enable-features=CanvasDrawElement',
			'--enable-blink-features=CanvasDrawElement',
			'--disable-component-update',
			'--no-first-run',
			'--no-default-browser-check',
		],
		keepProfileChanges: true,
	},
	vite: () => ({
		plugins: [react()],
	}),
});
