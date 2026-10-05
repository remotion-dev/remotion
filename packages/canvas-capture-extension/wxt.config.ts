import {homedir} from 'node:os';
import path from 'node:path';
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
		minimum_chrome_version: '157',
		permissions: ['activeTab', 'scripting', 'storage', 'unlimitedStorage'],
		icons: {
			16: 'icons/icon-16.png',
			32: 'icons/icon-32.png',
			48: 'icons/icon-48.png',
			128: 'icons/icon-128.png',
		},
		action: {
			default_title: 'Open Remotion Canvas Capture',
			default_icon: {
				16: 'icons/icon-16.png',
				32: 'icons/icon-32.png',
				48: 'icons/icon-48.png',
				128: 'icons/icon-128.png',
			},
		},
	},
	webExt: {
		binaries: {
			chrome:
				process.env.CANVAS_CAPTURE_BROWSER_EXECUTABLE ??
				path.join(
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
				'Remotion Canvas Capture',
			)}`,
			'--enable-features=CanvasDrawElement',
			'--enable-blink-features=CanvasDrawElement',
			'--no-first-run',
			'--no-default-browser-check',
		],
		keepProfileChanges: true,
	},
});
