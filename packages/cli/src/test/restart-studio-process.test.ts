import {expect, test} from 'bun:test';
import {
	getRestartStudioProcessArgs,
	restartStudioProcess,
} from '../restart-studio-process';

test('restarts Studio on the same port', () => {
	expect(
		getRestartStudioProcessArgs({
			argv: [
				'/usr/local/bin/node',
				'/project/remotion-cli.js',
				'studio',
				'index.ts',
				'--port',
				'3000',
				'--no-open',
			],
			execArgv: ['--trace-warnings'],
			port: 3002,
		}),
	).toEqual([
		'--trace-warnings',
		'/project/remotion-cli.js',
		'studio',
		'index.ts',
		'--no-open',
		'--port=3002',
	]);
});

test('waits for the restarted process to exit', async () => {
	let exited = false;
	const restart = restartStudioProcess({
		command: process.execPath,
		args: ['-e', 'process.exit(0)'],
	}).then(() => {
		exited = true;
	});

	await Promise.resolve();
	expect(exited).toBe(false);
	await restart;
	expect(exited).toBe(true);
});

test('rejects if the restarted process fails', async () => {
	await expect(
		restartStudioProcess({
			command: process.execPath,
			args: ['-e', 'process.exit(4)'],
		}),
	).rejects.toThrow('Restarted Studio process exited with code 4.');
});
