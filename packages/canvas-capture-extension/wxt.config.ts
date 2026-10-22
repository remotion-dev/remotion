import {homedir} from 'node:os';
import path from 'node:path';
import {defineConfig} from 'wxt';
// eslint-disable-next-line no-restricted-imports -- Share the minimum version with this package's runtime check.
import {minimumChromeVersion} from './src/browser-requirements';

const homeDirectory = homedir();
const isDevelopment = process.env.npm_lifecycle_event === 'dev';
const handoffOrigin =
	isDevelopment && process.env.CANVAS_CAPTURE_HANDOFF_ORIGIN
		? new URL(process.env.CANVAS_CAPTURE_HANDOFF_ORIGIN).origin
		: 'https://www.remotion.dev';

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
	vite: () => ({
		define: {
			'import.meta.env.CANVAS_CAPTURE_HANDOFF_ORIGIN':
				JSON.stringify(handoffOrigin),
		},
	}),
	manifest: {
		name: 'Remotion Canvas Capture',
		description: `Record an area or webpage as MP4 or WebM. Requires Chrome ${minimumChromeVersion}+ and Canvas Draw Element enabled.`,
		version: '0.1.0',
		// Allow older Chrome versions to install and show the recording requirements.
		minimum_chrome_version: '155',
		permissions: ['activeTab', 'scripting', 'storage', 'unlimitedStorage'],
		externally_connectable: {
			matches: [
				'https://remotion.dev/new*',
				'https://remotion.dev/convert*',
				'https://www.remotion.dev/new*',
				'https://www.remotion.dev/convert*',
				...(isDevelopment && handoffOrigin !== 'https://www.remotion.dev'
					? [
							`${new URL(handoffOrigin).protocol}//${new URL(handoffOrigin).hostname}/new*`,
							`${new URL(handoffOrigin).protocol}//${new URL(handoffOrigin).hostname}/convert*`,
						]
					: []),
			],
		},
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
			'--no-first-run',
			'--no-default-browser-check',
		],
		keepProfileChanges: true,
	},
});
