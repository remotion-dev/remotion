import {expect, test} from 'bun:test';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
for (const mode of ['cancelled', 'empty', 'ready', 'disposed']) {
	test(`renderer readiness cancellation precedence: ${mode}`, () => {
		const result = spawnSync(
			process.execPath,
			[join(__dirname, 'fixtures/wait-for-ready-cancellation.ts'), mode],
			{encoding: 'utf8', timeout: 15000},
		);
		if (result.status !== 0)
			throw new Error(
				`Renderer ${mode} failed: ${result.stderr}\n${result.stdout}`,
			);
		expect(JSON.parse(result.stdout.trim()).mode).toBe(mode);
	});
}
