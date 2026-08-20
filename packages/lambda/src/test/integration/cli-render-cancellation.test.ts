import {afterEach, beforeEach, expect, test} from 'bun:test';
import {Readable} from 'node:stream';
// eslint-disable-next-line no-restricted-imports
import {CliInternals} from '@remotion/cli';
import {LambdaClientInternals} from '@remotion/lambda-client';
import {parsedLambdaCli} from '../../cli/args';
import {renderCommand} from '../../cli/commands/render/render';
import {mockImplementation} from '../mocks/mock-implementation';
import {doAfter, doBefore, getProcessWriteOutput} from './console-hooks';

const enableCancellationOption = CliInternals.parsedCli['enable-cancellation'];
const originalCallFunctionSync =
	LambdaClientInternals.awsImplementation.callFunctionSync;
const originalFunctionName = parsedLambdaCli['function-name'];
const originalRegion = parsedLambdaCli.region;

beforeEach(() => {
	doBefore();
	CliInternals.parsedCli['enable-cancellation'] = true;
	parsedLambdaCli['function-name'] = 'custom-function';
	parsedLambdaCli.region = 'us-east-1';
});

afterEach(() => {
	LambdaClientInternals.awsImplementation.callFunctionSync =
		originalCallFunctionSync;
	CliInternals.parsedCli['enable-cancellation'] = enableCancellationOption;
	parsedLambdaCli['function-name'] = originalFunctionName;
	parsedLambdaCli.region = originalRegion;
	doAfter();
});

test('Ctrl+C cancels an opted-in Lambda CLI render', async () => {
	let resolveStatusRequested: () => void = () => undefined;
	const statusRequested = new Promise<void>((resolve) => {
		resolveStatusRequested = resolve;
	});
	const pendingStatus = new Promise<never>(() => undefined);
	const enableCancellationInPayloads: boolean[] = [];

	LambdaClientInternals.awsImplementation.callFunctionSync = ((input) => {
		if (input.type === 'start') {
			enableCancellationInPayloads.push(
				(input.payload as {enableCancellation: boolean}).enableCancellation,
			);
			return Promise.resolve({bucketName: 'bucket', renderId: 'render-id'});
		}

		if (input.type === 'status') {
			resolveStatusRequested();
			return pendingStatus;
		}

		return Promise.reject(
			new Error(`Unexpected Lambda routine: ${input.type}`),
		);
	}) as typeof originalCallFunctionSync;

	let cancellationWrites = 0;
	const providerSpecifics = {
		...mockImplementation,
		readFile: ({key}: {key: string}) => {
			expect(key).toBe('renders/render-id/progress.json');
			return Promise.resolve(
				Readable.from([
					Buffer.from(JSON.stringify({cancellationEnabled: true})),
				]),
			);
		},
		writeFile: (input: {key: string}) => {
			expect(input.key).toBe('renders/render-id/cancel.json');
			cancellationWrites++;
			return Promise.resolve();
		},
	} as typeof mockImplementation;

	let resolveExit: (exitCode: number) => void = () => undefined;
	const exitCode = new Promise<number>((resolve) => {
		resolveExit = resolve;
	});
	const unregisterCtrlC = CliInternals.handleCtrlC({
		indent: false,
		logLevel: 'info',
		exit: resolveExit,
	});

	renderCommand({
		args: ['https://example.com', 'composition-id'],
		remotionRoot: process.cwd(),
		logLevel: 'info',
		providerSpecifics,
	}).catch(() => undefined);

	try {
		await statusRequested;
		process.emit('SIGINT', 'SIGINT');

		expect(await exitCode).toBe(130);
		expect(enableCancellationInPayloads).toEqual([true]);
		expect(cancellationWrites).toBe(1);
		expect(getProcessWriteOutput()).toContain('Cancelling Lambda render...');
		expect(getProcessWriteOutput()).toContain('Cancellation signal sent.');
	} finally {
		unregisterCtrlC();
	}
});

test('Ctrl+C leaves a Lambda CLI render running without the flag', async () => {
	CliInternals.parsedCli['enable-cancellation'] = false;
	let resolveStatusRequested: () => void = () => undefined;
	const statusRequested = new Promise<void>((resolve) => {
		resolveStatusRequested = resolve;
	});
	const pendingStatus = new Promise<never>(() => undefined);
	const enableCancellationInPayloads: boolean[] = [];

	LambdaClientInternals.awsImplementation.callFunctionSync = ((input) => {
		if (input.type === 'start') {
			enableCancellationInPayloads.push(
				(input.payload as {enableCancellation: boolean}).enableCancellation,
			);
			return Promise.resolve({bucketName: 'bucket', renderId: 'render-id'});
		}

		if (input.type === 'status') {
			resolveStatusRequested();
			return pendingStatus;
		}

		return Promise.reject(
			new Error(`Unexpected Lambda routine: ${input.type}`),
		);
	}) as typeof originalCallFunctionSync;

	let cancellationWrites = 0;
	const providerSpecifics = {
		...mockImplementation,
		writeFile: () => {
			cancellationWrites++;
			return Promise.resolve();
		},
	} as typeof mockImplementation;

	let resolveExit: (exitCode: number) => void = () => undefined;
	const exitCode = new Promise<number>((resolve) => {
		resolveExit = resolve;
	});
	const unregisterCtrlC = CliInternals.handleCtrlC({
		indent: false,
		logLevel: 'info',
		exit: resolveExit,
	});

	renderCommand({
		args: ['https://example.com', 'composition-id'],
		remotionRoot: process.cwd(),
		logLevel: 'info',
		providerSpecifics,
	}).catch(() => undefined);

	try {
		await statusRequested;
		process.emit('SIGINT', 'SIGINT');

		expect(await exitCode).toBe(130);
		expect(enableCancellationInPayloads).toEqual([false]);
		expect(cancellationWrites).toBe(0);
		expect(getProcessWriteOutput()).toContain(
			'Stopped waiting. The Lambda render is still running.',
		);
		expect(getProcessWriteOutput()).toContain(
			'Use --enable-cancellation to allow Ctrl+C to cancel it.',
		);
	} finally {
		unregisterCtrlC();
	}
});
