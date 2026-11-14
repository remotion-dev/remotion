import {expect, test} from 'bun:test';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';

for (const mode of [
	'source-context-player-null',
	'source-context-player-throw',
	'source-context-thumbnail-null',
	'source-context-thumbnail-throw',
	'active',
	'stale',
	'first-and-public',
	'retired-owner',
	'lifecycle-owner',
	'lifecycle-unmount',
	'lifecycle-hidden',
	'lifecycle-strict',
	'lifecycle-reveal-later',
	'lifecycle-reveal-same-job',
	'lifecycle-reveal-deferred',
	'console-initial-render',
	'console-initial-layout',
	'console-later-render',
	'console-later-layout',
	'console-owner-render',
	'console-owner-layout',
]) {
	test(`Solid owned async reporting: ${mode}`, () => {
		const result = spawnSync(
			process.execPath,
			[
				'--preload',
				join(__dirname, '../../happydom.ts'),
				join(__dirname, 'fixtures/solid-owned-reporting.tsx'),
				mode,
			],
			{encoding: 'utf8', timeout: 15000},
		);
		if (result.status !== 0)
			throw new Error(
				`Isolated ${mode} failed (${result.status}): ${result.stderr}\n${result.stdout}`,
			);
		const facts = JSON.parse(result.stdout.trim().split('\n').at(-1)!);
		expect(facts.mode).toBe(mode);
	});
}
