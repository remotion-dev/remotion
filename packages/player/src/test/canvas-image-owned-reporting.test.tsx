import {expect, test} from 'bun:test';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
for (const mode of [
	'active',
	'stale',
	'stale-user',
	'user',
	'user-throw',
	'abort',
	'sync-context',
]) {
	test(`CanvasImage owned loader reporting: ${mode}`, () => {
		const result = spawnSync(
			process.execPath,
			[
				'--preload',
				join(__dirname, '../../happydom.ts'),
				join(__dirname, 'fixtures/canvas-image-owned-reporting.tsx'),
				mode,
			],
			{encoding: 'utf8', timeout: 15000},
		);
		if (mode === 'user-throw') {
			const marker = result.stdout
				.split('\n')
				.find((line) => line.includes('originalUserMessage'));
			expect(JSON.parse(marker ?? 'null')).toEqual({
				mode,
				originalUserMessage: true,
			});
			expect(result.status).not.toBe(0);
			expect(result.stderr).toContain('authored CanvasImage onError throw');
			return;
		}

		if (result.status !== 0)
			throw new Error(
				`Isolated ${mode} failed: ${result.stderr}\n${result.stdout}`,
			);
		const facts = JSON.parse(result.stdout.trim().split('\n').at(-1) ?? 'null');
		expect(facts.mode).toBe(mode);
		expect(facts.allNativeCallbacksCleared).toBe(true);
	});
}
