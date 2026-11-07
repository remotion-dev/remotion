import {afterEach, beforeEach, expect, test} from 'bun:test';
// eslint-disable-next-line no-restricted-imports
import {CliInternals} from '@remotion/cli';
import {
	LambdaClientInternals,
	ServerlessRoutines,
} from '@remotion/lambda-client';
import {parsedLambdaCli} from '../../cli/args';
import {renderCommand} from '../../cli/commands/render/render';
import {mockStartedRenderStream} from '../mocks/aws-clients';
import {fakeAws, useFakeAws} from '../mocks/fake-aws';
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

test('Uses an explicit function without discovery and only shows its main CloudWatch logs', async () => {
	fakeAws().getFunctions.mockClear();
	fakeAws().getFunctions.mockRejectedValue(
		new Error('AccessDenied: lambda:ListFunctions'),
	);

	let resolveProgressRequested: () => void = () => undefined;
	let rejectProgressRequested: (error: unknown) => void = () => undefined;
	const progressRequested = new Promise<void>((resolve, reject) => {
		resolveProgressRequested = resolve;
		rejectProgressRequested = reject;
	});
	fakeAws().invokeWithResponseStream.mockImplementation(
		mockStartedRenderStream(resolveProgressRequested),
	);

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
	}).catch(rejectProgressRequested);

	try {
		await progressRequested;
		expect(fakeAws().getFunctions).not.toHaveBeenCalled();
		expect(fakeAws().invokeWithResponseStream).toHaveBeenCalledWith(
			expect.objectContaining({
				functionName: 'custom-function',
				payload: expect.objectContaining({
					type: ServerlessRoutines.start,
					streamProgress: true,
				}),
			}),
		);
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
