import {expect, test} from 'bun:test';
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..', '..', '..', '..');

const helloInputProps = {
	titleText: 'teardown-test',
	titleColor: '#000000',
	logoColor1: '#91EAE4',
	logoColor2: '#86A8E7',
} as const;

/**
 * Linux-only: `pgrep -P` is reliable for “direct child of this PID”.
 * Regression tests for https://github.com/remotion-dev/remotion/issues/7065 —
 * after a successful render, Chrome must not remain attached as a child of the
 * Node test process.
 */
function directChildrenCommandLines(parentPid: number): string {
	try {
		return execSync(`pgrep -P ${parentPid} -a 2>/dev/null || true`, {
			encoding: 'utf8',
		});
	} catch {
		return '';
	}
}

function assertNoChromeHeadlessChildOf(pid: number) {
	const lines = directChildrenCommandLines(pid);
	expect(lines).not.toMatch(/chrome-headless-shell|chrome-headless/i);
}

const entryPoint = path.join(
	repoRoot,
	'packages/template-helloworld/src/index.ts',
);

const linuxOnly = process.platform === 'linux' && fs.existsSync(entryPoint);

test.skipIf(!linuxOnly)(
	'after renderStill(), no chrome-headless child of Node remains (#7065)',
	async () => {
		const bundleLocation = await bundle({
			entryPoint,
			enableCaching: false,
		});

		const composition = await selectComposition({
			serveUrl: bundleLocation,
			id: 'HelloWorld',
			inputProps: helloInputProps,
		});

		const output = path.join(
			fs.mkdtempSync(path.join(os.tmpdir(), 'remotion-still-teardown-')),
			'frame.png',
		);

		await renderStill({
			composition,
			serveUrl: bundleLocation,
			output,
			frame: 0,
		});

		assertNoChromeHeadlessChildOf(process.pid);
	},
	{timeout: 300_000},
);

test.skipIf(!linuxOnly)(
	'after renderMedia(), no chrome-headless child of Node remains (#7065)',
	async () => {
		const bundleLocation = await bundle({
			entryPoint,
			enableCaching: false,
		});

		const composition = await selectComposition({
			serveUrl: bundleLocation,
			id: 'HelloWorld',
			inputProps: helloInputProps,
		});

		const outputLocation = path.join(
			fs.mkdtempSync(path.join(os.tmpdir(), 'remotion-media-teardown-')),
			'out.mp4',
		);

		await renderMedia({
			composition,
			serveUrl: bundleLocation,
			codec: 'h264',
			outputLocation,
			inputProps: helloInputProps,
			concurrency: 2,
		});

		assertNoChromeHeadlessChildOf(process.pid);
	},
	{timeout: 600_000},
);
