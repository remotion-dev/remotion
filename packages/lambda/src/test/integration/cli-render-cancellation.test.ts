import {afterEach, beforeEach, expect, test} from 'bun:test';
import {Readable} from 'node:stream';
// eslint-disable-next-line no-restricted-imports
import {CliInternals} from '@remotion/cli';
import {parsedLambdaCli} from '../../cli/args';
import {renderCommand} from '../../cli/commands/render/render';
import {mockStartedRenderStream} from '../mocks/aws-clients';
import {fakeAws, useFakeAws} from '../mocks/fake-aws';
import {doAfter, doBefore, getProcessWriteOutput} from './console-hooks';

useFakeAws();

const enableCancellationOption = CliInternals.parsedCli['enable-cancellation'];
const originalFunctionName = parsedLambdaCli['function-name'];
const originalRegion = parsedLambdaCli.region;

beforeEach(() => {
	doBefore();
	CliInternals.parsedCli['enable-cancellation'] = true;
	parsedLambdaCli['function-name'] = 'custom-function';
	parsedLambdaCli.region = 'us-east-1';
});

afterEach(() => {
	CliInternals.parsedCli['enable-cancellation'] = enableCancellationOption;
	parsedLambdaCli['function-name'] = originalFunctionName;
	parsedLambdaCli.region = originalRegion;
	doAfter();
});

test('Ctrl+C cancels an opted-in Lambda CLI render', async () => {
	let resolveProgressRequested: () => void = () => undefined;
	const progressRequested = new Promise<void>((resolve) => {
		resolveProgressRequested = resolve;
	});
	fakeAws().invokeWithResponseStream.mockClear();
	fakeAws().invokeWithResponseStream.mockImplementation(
		mockStartedRenderStream(resolveProgressRequested),
	);

	let cancellationWrites = 0;
	fakeAws().readFile.mockImplementation(({key}) => {
		expect(key).toBe('renders/render-id/progress.json');
		return Promise.resolve(
			Readable.from([Buffer.from(JSON.stringify({cancellationEnabled: true}))]),
		);
	});
	fakeAws().writeFile.mockImplementation((input) => {
		expect(input.key).toBe('renders/render-id/cancel.json');
		cancellationWrites++;
		return Promise.resolve();
	});

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
	}).catch(() => undefined);

	try {
		await progressRequested;
		process.emit('SIGINT', 'SIGINT');

		expect(await exitCode).toBe(130);
		expect(
			fakeAws().invokeWithResponseStream.mock.calls.map(
				([input]) =>
					(input.payload as {enableCancellation: boolean}).enableCancellation,
			),
		).toEqual([true]);
		expect(cancellationWrites).toBe(1);
		expect(getProcessWriteOutput()).toContain('Cancelling Lambda render...');
		expect(getProcessWriteOutput()).toContain('Cancellation signal sent.');
	} finally {
		unregisterCtrlC();
	}
});

test('Ctrl+C leaves a Lambda CLI render running without the flag', async () => {
	CliInternals.parsedCli['enable-cancellation'] = false;
	let resolveProgressRequested: () => void = () => undefined;
	const progressRequested = new Promise<void>((resolve) => {
		resolveProgressRequested = resolve;
	});
	fakeAws().invokeWithResponseStream.mockClear();
	fakeAws().invokeWithResponseStream.mockImplementation(
		mockStartedRenderStream(resolveProgressRequested),
	);

	let cancellationWrites = 0;
	fakeAws().writeFile.mockImplementation(() => {
		cancellationWrites++;
		return Promise.resolve();
	});

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
	}).catch(() => undefined);

	try {
		await progressRequested;
		process.emit('SIGINT', 'SIGINT');

		expect(await exitCode).toBe(130);
		expect(
			fakeAws().invokeWithResponseStream.mock.calls.map(
				([input]) =>
					(input.payload as {enableCancellation: boolean}).enableCancellation,
			),
		).toEqual([false]);
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
