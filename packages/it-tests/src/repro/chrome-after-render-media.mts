/**
 * Programmatic repro for https://github.com/remotion-dev/remotion/issues/7065
 * (same pattern as the report: `renderMedia` from Node after a successful run).
 *
 * From monorepo root (after `bun install` and `turbo` / `make` as for other it-tests):
 *   bun packages/it-tests/src/repro/chrome-after-render-media.mts
 *
 * On Linux, after `renderMedia` resolves, the script prints chrome-related PIDs.
 * If chrome-headless-shell is still running (not a zombie), that indicates a leak.
 */

import {execSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// packages/it-tests/src/repro -> ../../../.. = monorepo root
const repoRoot = path.join(__dirname, '..', '..', '..', '..');
const entryPoint = path.join(
	repoRoot,
	'packages/template-helloworld/src/index.ts',
);

const inputProps = {
	titleText: 'repro',
	titleColor: '#000000',
	logoColor1: '#91EAE4',
	logoColor2: '#86A8E7',
} as const;

const dumpProcesses = (label: string) => {
	console.log(`\n=== ${label} ===`);
	console.log(
		'(Look for chrome-headless-shell / Chromium still running, or zombies.)',
	);

	try {
		const out = execSync(
			'ps aux 2>/dev/null | grep -E "[c]hrome-headless|[c]hromium|[c]hrome-headless-shell" || echo "(no chrome-headless/chromium lines in ps aux)"',
			{encoding: 'utf8', shell: '/bin/bash'},
		);
		process.stdout.write(out);
	} catch {
		console.log('(ps grep failed)');
	}

	try {
		const zombies = execSync(
			"ps -eo pid,ppid,stat,args 2>/dev/null | awk '$3 ~ /^Z/ && (/[Cc]hrome|[Rr]emotion|[Cc]hromium/) {print}' | head -25 || true",
			{encoding: 'utf8', shell: '/bin/bash'},
		);
		if (zombies.trim()) {
			console.log('Zombie rows (chrome/remotion-related), if any:');
			process.stdout.write(zombies);
		}
	} catch {
		// ignore
	}
};

if (!fs.existsSync(entryPoint)) {
	console.error('Missing entry:', entryPoint);
	process.exit(1);
}

const bundleLocation = await bundle({
	entryPoint,
	enableCaching: false,
});

const composition = await selectComposition({
	serveUrl: bundleLocation,
	id: 'HelloWorld',
	inputProps,
});

const outputLocation = path.join(
	fs.mkdtempSync(path.join(os.tmpdir(), 'remotion-repro-media-')),
	'out.mp4',
);

await renderMedia({
	composition,
	serveUrl: bundleLocation,
	codec: 'h264',
	outputLocation,
	inputProps,
	concurrency: 4,
});

dumpProcesses('Right after await renderMedia() (successful path, #7065)');
