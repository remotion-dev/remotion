// eslint-disable-next-line no-restricted-imports
import {CliInternals} from '@remotion/cli';
import {expect, test} from 'vitest';
import {
	DEFAULT_EPHEMERAL_STORAGE_IN_MB,
	DEFAULT_MEMORY_SIZE,
	DEFAULT_TIMEOUT,
} from '../../defaults';
import {LambdaInternals} from '../../internals';
import {LAMBDA_VERSION_STRING} from '../../shared/lambda-version-string';
import {getProcessWriteOutput} from './console-hooks';

test('Deploy function', async () => {
	await LambdaInternals.executeCommand(['functions', 'deploy']);
	expect(getProcessWriteOutput()).toContain(
		`Deployed as remotion-render-${LAMBDA_VERSION_STRING}-mem${DEFAULT_MEMORY_SIZE}mb-disk${DEFAULT_EPHEMERAL_STORAGE_IN_MB}mb-${DEFAULT_TIMEOUT}sec\n`
	);
});

test('Deploy function and list it', async () => {
	await LambdaInternals.executeCommand(['functions', 'deploy']);
	await LambdaInternals.executeCommand(['functions', 'ls']);
	expect(getProcessWriteOutput()).toContain('Getting functions...');
	expect(getProcessWriteOutput()).toContain('Memory (MB)');
	expect(getProcessWriteOutput()).toMatch(/remotion-render-(.*)\s+2048\s+120/g);
});

test('Deploy function and it already exists should fail', async () => {
	await LambdaInternals.executeCommand(['functions', 'deploy']);
	await LambdaInternals.executeCommand(['functions', 'deploy']);

	expect(getProcessWriteOutput()).toMatch(/Already exists as remotion-render/);
});

test('If no functions are there and is quiet, should return "()"', async () => {
	CliInternals.parsedCli.q = true;
	await LambdaInternals.executeCommand(['functions', 'ls']);
	expect(getProcessWriteOutput()).toBe('()');
});

test('Should handle functions rm called with no functions', async () => {
	await LambdaInternals.executeCommand(['functions', 'rm', '()']);
	expect(getProcessWriteOutput()).toBe('No functions to remove.');
});
