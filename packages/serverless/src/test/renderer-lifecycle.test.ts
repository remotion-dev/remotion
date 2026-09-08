import {expect, mock, spyOn, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {RenderInternals} from '@remotion/renderer';
import type {
	CloudProvider,
	ProviderSpecifics,
	StreamingPayload,
} from '@remotion/serverless-client';
import {VERSION} from '@remotion/serverless-client';
import {
	closeBrowserInstanceImplementation,
	getBrowserInstanceImplementation,
} from '../get-browser-instance';
import type {LaunchedBrowser} from '../get-browser-instance';
import {rendererHandler} from '../handlers/renderer';
import type {InsideFunctionSpecifics} from '../provider-implementation';

type MockProvider = CloudProvider<
	'mock-region',
	Record<string, never>,
	Record<string, never>,
	'normal',
	Record<string, never>
>;

test.each(['browser launch', 'Chromium path lookup'] as const)(
	'a failed %s allows the next renderer invocation to complete without exiting',
	async (failure) => {
		const previousNodeEnv = process.env.NODE_ENV;
		const testRoot = fs.mkdtempSync(
			path.join(os.tmpdir(), 'renderer-lifecycle-'),
		);
		const tmpDirSpy = spyOn(RenderInternals, 'tmpDir').mockImplementation(() =>
			fs.mkdtempSync(path.join(testRoot, 'render-')),
		);
		const launchError = new Error(`Failed ${failure}`);
		const browser = {
			on: mock(() => undefined),
			close: mock(() => Promise.resolve()),
		};
		// Fake Chromium startup and rendering: a real connection timeout is
		// nondeterministic. Keep the handler and browser cache implementation real.
		const openBrowserSpy = spyOn(RenderInternals, 'internalOpenBrowser');
		if (failure === 'browser launch') {
			openBrowserSpy.mockRejectedValueOnce(launchError);
		}

		openBrowserSpy.mockResolvedValue(browser as never);
		const renderMediaSpy = spyOn(
			RenderInternals,
			'internalRenderMedia',
		).mockResolvedValue({
			slowestFrames: [],
		} as never);
		const onMediaFiles = mock(() => Promise.resolve());
		const forgetBrowserEventLoop = mock(() => undefined);
		let launchedBrowser: LaunchedBrowser | null = null;
		const scheduledCallbacks: Array<() => void> = [];
		let currentInvocation = 'A';
		const exits: string[] = [];
		const timeoutSpy = spyOn(globalThis, 'setTimeout').mockImplementation(((
			callback: (...args: never[]) => void,
		) => {
			scheduledCallbacks.push(callback);

			return 0 as unknown as ReturnType<typeof setTimeout>;
		}) as unknown as typeof setTimeout);
		const exitSpy = spyOn(process, 'exit').mockImplementation((() => {
			exits.push(currentInvocation);
		}) as typeof process.exit);
		const streamedMessages: StreamingPayload<MockProvider>[] = [];

		try {
			process.env.NODE_ENV = 'production';
			const invoke = () =>
				rendererHandler<MockProvider>({
					params: {
						type: 'renderer',
						chromiumOptions: {gl: null},
						launchFunctionConfig: {version: VERSION},
						inputProps: {type: 'payload', payload: '{}'},
						resolvedProps: {type: 'payload', payload: '{}'},
						bucketName: 'bucket',
						forcePathStyle: false,
						frameRange: [0, 0],
						everyNthFrame: 1,
						codec: 'h264',
						muted: true,
						framesPerLambda: 1,
						logLevel: 'error',
						retriesLeft: 1,
						attempt: 1,
						chunk: 0,
						enableCancellation: false,
					} as never,
					options: {expectedBucketOwner: 'owner', isWarm: true},
					onStream: (message) => {
						streamedMessages.push(message);
						return Promise.resolve();
					},
					providerSpecifics: {
						isFlakyError: (err: Error) => err === launchError,
						getChromiumPath: () => {
							if (
								failure === 'Chromium path lookup' &&
								currentInvocation === 'A'
							) {
								throw launchError;
							}

							return '/mock-chrome';
						},
					} as unknown as ProviderSpecifics<MockProvider>,
					requestContext: {
						awsRequestId: currentInvocation,
						invokedFunctionArn: 'arn',
						getRemainingTimeInMillis: () => 120_000,
					},
					insideFunctionSpecifics: {
						getCurrentRegionInFunction: () => 'mock-region',
						getBrowserInstance: async (options) => {
							launchedBrowser = await getBrowserInstanceImplementation(options);
							return launchedBrowser;
						},
						closeBrowserInstance: closeBrowserInstanceImplementation,
						forgetBrowserEventLoop,
						timer: () => ({end: () => undefined}),
					} satisfies Partial<
						InsideFunctionSpecifics<MockProvider>
					> as unknown as InsideFunctionSpecifics<MockProvider>,
					onMediaFiles,
					executionMode: 'invoked',
				});

			await invoke();
			expect(streamedMessages).toHaveLength(1);
			expect(streamedMessages[0]).toMatchObject({
				type: 'error-occurred',
				payload: {shouldRetry: true, errorInfo: {message: launchError.message}},
			});

			currentInvocation = 'B';
			const nextInvocation = invoke();
			for (const callback of [...scheduledCallbacks]) {
				callback();
			}

			await nextInvocation;
			expect(streamedMessages).toHaveLength(2);
			expect(streamedMessages[1]).toMatchObject({type: 'chunk-complete'});
			expect(openBrowserSpy).toHaveBeenCalledTimes(
				failure === 'browser launch' ? 2 : 1,
			);
			expect(renderMediaSpy).toHaveBeenCalledTimes(1);
			expect(onMediaFiles).toHaveBeenCalledTimes(1);
			expect(forgetBrowserEventLoop).toHaveBeenCalledTimes(1);
			expect(exits).toEqual([]);
		} finally {
			if (launchedBrowser) {
				await closeBrowserInstanceImplementation({launchedBrowser});
			}

			tmpDirSpy.mockRestore();
			openBrowserSpy.mockRestore();
			renderMediaSpy.mockRestore();
			fs.rmSync(testRoot, {recursive: true, force: true});
			timeoutSpy.mockRestore();
			exitSpy.mockRestore();
			if (previousNodeEnv === undefined) {
				delete process.env.NODE_ENV;
			} else {
				process.env.NODE_ENV = previousNodeEnv;
			}
		}
	},
);

test('a flaky renderer invocation closes its browser before returning', async () => {
	const previousNodeEnv = process.env.NODE_ENV;
	const tmpDirSpy = spyOn(RenderInternals, 'tmpDir').mockImplementation(
		() => '/tmp/remotion-renderer-lifecycle-test',
	);
	const browser = {
		instance: {
			close: mock(() => Promise.resolve()),
		},
		configurationString: 'configuration',
	};
	let notifyCloseStarted: () => void = () => undefined;
	const closeStarted = new Promise<void>((resolve) => {
		notifyCloseStarted = resolve;
	});
	let failClosing: () => void = () => undefined;
	const closing = new Promise<void>((_resolve, reject) => {
		failClosing = () => reject(new Error('Could not close browser'));
	});
	const streamedMessages: StreamingPayload<MockProvider>[] = [];
	const closeBrowserInstance = mock(() => {
		notifyCloseStarted();
		return closing;
	});

	try {
		process.env.NODE_ENV = 'production';
		const handlerPromise = rendererHandler<MockProvider>({
			params: {
				type: 'renderer',
				chromiumOptions: {gl: null},
				launchFunctionConfig: {version: VERSION},
				inputProps: {type: 'payload', payload: '{}'},
				resolvedProps: {type: 'payload', payload: '{}'},
				bucketName: 'bucket',
				forcePathStyle: false,
				logLevel: 'error',
				retriesLeft: 1,
				attempt: 1,
				enableCancellation: false,
			} as never,
			options: {expectedBucketOwner: 'owner', isWarm: true},
			onStream: (message) => {
				streamedMessages.push(message);
				return Promise.resolve();
			},
			providerSpecifics: {
				isFlakyError: () => true,
			} as unknown as ProviderSpecifics<MockProvider>,
			requestContext: {
				awsRequestId: 'invocation-a',
				invokedFunctionArn: 'arn',
				getRemainingTimeInMillis: () => 120_000,
			},
			insideFunctionSpecifics: {
				getCurrentRegionInFunction: () => 'mock-region',
				getBrowserInstance: () => Promise.resolve(browser as never),
				closeBrowserInstance,
			} as unknown as InsideFunctionSpecifics<MockProvider>,
			onMediaFiles: null,
			executionMode: 'invoked',
		});

		expect(
			await Promise.race([
				closeStarted.then(() => 'close-started'),
				handlerPromise.then(() => 'handler-returned'),
			]),
		).toBe('close-started');
		expect(closeBrowserInstance).toHaveBeenCalledTimes(1);
		expect(closeBrowserInstance).toHaveBeenCalledWith({
			launchedBrowser: browser,
		});

		let handlerReturned = false;
		handlerPromise.then(() => {
			handlerReturned = true;
		});
		await Promise.resolve();
		expect(handlerReturned).toBe(false);

		failClosing();
		await handlerPromise;
		expect(handlerReturned).toBe(true);
		expect(streamedMessages).toHaveLength(1);
		expect(streamedMessages[0]).toMatchObject({
			type: 'error-occurred',
			payload: {
				shouldRetry: true,
				errorInfo: {
					message: 'must pass chunk',
					willRetry: true,
					isFatal: false,
				},
			},
		});
	} finally {
		failClosing();
		await Promise.resolve();
		tmpDirSpy.mockRestore();
		if (previousNodeEnv === undefined) {
			delete process.env.NODE_ENV;
		} else {
			process.env.NODE_ENV = previousNodeEnv;
		}
	}
});

test('closing a cached browser makes the next invocation launch a new one', async () => {
	const makeBrowser = (id: string) => {
		let onDisconnected: (() => void) | null = null;

		return {
			id,
			on: mock((event: string, callback: () => void) => {
				if (event === 'disconnected') {
					onDisconnected = callback;
				}
			}),
			close: mock(() => {
				onDisconnected?.();
				return Promise.resolve();
			}),
		};
	};

	const firstBrowser = makeBrowser('first');
	const secondBrowser = makeBrowser('second');
	const openBrowserSpy = spyOn(
		RenderInternals,
		'internalOpenBrowser',
	).mockImplementationOnce(() => Promise.resolve(firstBrowser as never));
	openBrowserSpy.mockImplementationOnce(() =>
		Promise.resolve(secondBrowser as never),
	);
	const providerSpecifics = {
		getChromiumPath: () => '/mock-chrome',
	} as unknown as ProviderSpecifics<MockProvider>;
	const insideFunctionSpecifics = {
		getBrowserInstance: getBrowserInstanceImplementation,
	} as unknown as InsideFunctionSpecifics<MockProvider>;
	let first: LaunchedBrowser | null = null;
	let second: LaunchedBrowser | null = null;

	try {
		first = await getBrowserInstanceImplementation({
			logLevel: 'error',
			indent: false,
			chromiumOptions: {},
			providerSpecifics,
			insideFunctionSpecifics,
		});
		await closeBrowserInstanceImplementation({launchedBrowser: first});
		second = await getBrowserInstanceImplementation({
			logLevel: 'error',
			indent: false,
			chromiumOptions: {},
			providerSpecifics,
			insideFunctionSpecifics,
		});

		expect(openBrowserSpy).toHaveBeenCalledTimes(2);
		expect(first.instance as unknown).toBe(firstBrowser);
		expect(second.instance as unknown).toBe(secondBrowser);
	} finally {
		if (second) {
			await closeBrowserInstanceImplementation({launchedBrowser: second});
		}

		if (first) {
			await closeBrowserInstanceImplementation({launchedBrowser: first});
		}

		openBrowserSpy.mockRestore();
	}
});
