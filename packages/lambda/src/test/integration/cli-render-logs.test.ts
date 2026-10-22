import {afterEach, beforeEach, expect, test} from 'bun:test';
// eslint-disable-next-line no-restricted-imports
import {CliInternals} from '@remotion/cli';
import {
	LambdaClientInternals,
	ServerlessRoutines,
} from '@remotion/lambda-client';
import {parsedLambdaCli} from '../../cli/args';
import {renderCommand} from '../../cli/commands/render/render';
import {fakeAws, useFakeAws, type FakeAwsDefaults} from '../mocks/fake-aws';
import {doAfter, doBefore, getProcessWriteOutput} from './console-hooks';

useFakeAws();

const enableCancellationOption = CliInternals.parsedCli['enable-cancellation'];
const originalFunctionName = parsedLambdaCli['function-name'];
const originalRegion = parsedLambdaCli.region;
const originalConcurrency = parsedLambdaCli.concurrency;
const originalRendererFunctionName = parsedLambdaCli['renderer-function-name'];

beforeEach(() => {
	doBefore();
	CliInternals.parsedCli['enable-cancellation'] = false;
	parsedLambdaCli['function-name'] = 'custom-function';
	parsedLambdaCli.region = 'us-east-1';
	parsedLambdaCli.concurrency = 1;
	parsedLambdaCli['renderer-function-name'] = undefined;
});

afterEach(() => {
	CliInternals.parsedCli['enable-cancellation'] = enableCancellationOption;
	parsedLambdaCli['function-name'] = originalFunctionName;
	parsedLambdaCli.region = originalRegion;
	parsedLambdaCli.concurrency = originalConcurrency;
	parsedLambdaCli['renderer-function-name'] = originalRendererFunctionName;
	doAfter();
});

test('Only shows the main CloudWatch logs for a direct single-function render', async () => {
	let resolveStatusRequested: () => void = () => undefined;
	const statusRequested = new Promise<void>((resolve) => {
		resolveStatusRequested = resolve;
	});
	const pendingStatus = new Promise<never>(() => undefined);

	fakeAws().callFunctionSync.mockImplementation(((input) => {
		if (input.type === 'start') {
			return Promise.resolve({bucketName: 'bucket', renderId: 'render-id'});
		}

		if (input.type === 'status') {
			resolveStatusRequested();
			return pendingStatus;
		}

		return Promise.reject(
			new Error(`Unexpected Lambda routine: ${input.type}`),
		);
	}) as FakeAwsDefaults['callFunctionSync']);

	let resolveExit: (exitCode: number) => void = () => undefined;
	const exitCode = new Promise<number>((resolve) => {
		resolveExit = resolve;
	});
	const unregisterCtrlC = CliInternals.handleCtrlC({
		indent: false,
		logLevel: 'verbose',
		exit: resolveExit,
	});

	renderCommand({
		args: ['https://example.com', 'composition-id'],
		remotionRoot: process.cwd(),
		logLevel: 'verbose',
	}).catch(() => undefined);

	try {
		await statusRequested;
		const output = getProcessWriteOutput();
		const mainLogs = LambdaClientInternals.getCloudwatchMethodUrl({
			region: 'us-east-1',
			functionName: 'custom-function',
			renderId: 'render-id',
			rendererFunctionName: null,
			method: ServerlessRoutines.launch,
		});
		const rendererLogs = LambdaClientInternals.getCloudwatchRendererUrl({
			region: 'us-east-1',
			functionName: 'custom-function',
			renderId: 'render-id',
			rendererFunctionName: null,
			chunk: null,
		});

		expect(output).toContain(mainLogs);
		expect(output).not.toContain(rendererLogs);

		process.emit('SIGINT', 'SIGINT');
		expect(await exitCode).toBe(130);
	} finally {
		unregisterCtrlC();
	}
});
