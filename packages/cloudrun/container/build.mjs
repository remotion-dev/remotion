import {execSync} from 'node:child_process';
import {cpSync} from 'node:fs';

// set -e
// cd ../../renderer
// bun build-browser-downloader.ts
// cp ensure-browser.mjs ../cloudrun/container/ensure-browser.mjs
export const build = () => {
	execSync('bun build-browser-downloader.ts', {
		cwd: '../../renderer',
	});
	cpSync('../../renderer/ensure-browser.mjs', './ensure-browser.mjs');
};
