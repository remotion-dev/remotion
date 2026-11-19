import {expect, test} from 'bun:test';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';

for (const actor of ['player', 'thumbnail']) {
	for (const stage of [
		'shader',
		'effect',
		'unmount',
		'replace',
		'success',
		'empty',
		'zero',
		'fatal',
	]) {
		const mode = `${actor}-${stage}`;
		test(`transition owned readiness: ${mode}`, () => {
			const result = spawnSync(
				process.execPath,
				[
					'--preload',
					join(__dirname, '../../happydom.ts'),
					join(__dirname, 'fixtures/transition-owned-reporting.tsx'),
					mode,
				],
				{encoding: 'utf8', timeout: 15000},
			);
			if (result.status !== 0)
				throw new Error(
					`Isolated ${mode} failed (${result.status}): ${result.stderr}\n${result.stdout}`,
				);
			expect(JSON.parse(result.stdout.trim().split('\n').at(-1)!).mode).toBe(
				mode,
			);
		});
	}
}
