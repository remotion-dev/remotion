import {expect, test} from 'bun:test';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
for (const phase of ['decoder', 'frame', 'duration']) {
	for (const behavior of ['active', 'stale', 'user', 'user-throw']) {
		test(`AnimatedImage owned ${phase} reporting: ${behavior}`, () => {
			const mode = `${phase}:${behavior}`;
			const result = spawnSync(
				process.execPath,
				[
					'--preload',
					join(__dirname, '../../happydom.ts'),
					join(__dirname, 'fixtures/animated-image-owned-reporting.tsx'),
					mode,
				],
				{encoding: 'utf8', timeout: 15000},
			);
			const facts = JSON.parse(
				result.stdout.trim().split('\n').at(-1) ?? 'null',
			);
			if (behavior === 'user-throw') {
				const marker = result.stdout
					.split('\n')
					.find((line) => line.includes('originalUserError'));
				expect(JSON.parse(marker ?? 'null')).toEqual({
					phase,
					behavior,
					originalUserError: true,
				});
				expect(result.status).not.toBe(0);
				expect(result.stderr).toContain(`${phase} authored callback throw`);
				return;
			}

			if (result.status !== 0)
				throw new Error(
					`Isolated ${mode} failed: ${result.stderr}\n${result.stdout}`,
				);
			expect(facts.phase).toBe(phase);
			expect(facts.behavior).toBe(behavior);
		});
	}
}
