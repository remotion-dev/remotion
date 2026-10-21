import {afterEach, beforeEach, expect, test} from 'bun:test';
import fs from 'fs';
import path from 'path';
import execa from 'execa';

const outputPath = path.join(process.cwd(), 'packages/example/out-cancel.mp4');

beforeEach(() => {
	if (fs.existsSync(outputPath)) {
		fs.unlinkSync(outputPath);
	}
});
afterEach(() => {
	if (fs.existsSync(outputPath)) {
		fs.unlinkSync(outputPath);
	}
});

test(
	'Should fail to render if cancelRender() was being used',
	async () => {
		const task = await execa(
			'bun',
			[
				'x',
				'remotion',
				'render',
				'./build',
				'cancel-render',
				'--frames=2-10',
				// One page is enough to exercise cancellation and symbolication.
				'--concurrency=1',
				outputPath,
			],
			{
				cwd: path.join(process.cwd(), '..', 'example'),
				reject: false,
			},
		);

		if (task.exitCode !== 1 || !task.stderr.includes('CancelledError')) {
			console.log({
				exitCode: task.exitCode,
				signal: task.signal,
				stdout: task.stdout,
				stderr: task.stderr,
			});
		}
		expect(task.exitCode).toBe(1);
		expect(task.stderr).toContain('CancelledError');
		expect(task.stderr).toContain('This should be the error message');

		// Should symbolicate stacktrace
		// Do not search for strings that depend on color support
		expect(task.stdout).toContain('src/CancelRender/index.tsx:19');
		expect(task.stdout).toContain(
			'Worst case: Inside a promise without a catch handler',
		);
		expect(task.stdout).toContain('and with a timeout running');
		expect(task.stdout).toContain(
			"cancelRender(new Error('This should be the error message'));",
		);
	},
	// Allow browser startup and the renderer's own 30s timeout to finish before
	// Bun kills the subprocess. Retrying a killed CLI can overlap its cleanup.
	{timeout: 60000},
);
