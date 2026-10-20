import {afterEach, expect, mock, spyOn, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type {StreamingPayload} from '@remotion/lambda-client';
import {RenderInternals} from '@remotion/renderer';
import {VERSION} from 'remotion/version';
import * as isFlakyError from '../../../../lambda-client/src/is-flaky-error';
import * as browserInstance from '../../functions/get-browser-instance';
import type {LaunchedBrowser} from '../../functions/get-browser-instance';
import {rendererHandler} from '../../functions/handlers/renderer';
import * as chromiumPath from '../../functions/helpers/get-chromium-path';
import * as currentRegion from '../../functions/helpers/get-current-region';
import * as getTmpDir from '../../functions/helpers/get-tmp-dir';

const spies: {mockRestore: () => void}[] = [];
// Captured before any spy replaces the live bindings.
const {closeBrowserInstance, getBrowserInstance} = browserInstance;

afterEach(() => {
	spies.splice(0).forEach((spy) => spy.mockRestore());
});

// Next.js declares process.env.NODE_ENV as readonly; the handlers branch on it.
const setNodeEnv = (value: string | undefined) => {
	const env = process.env as Record<string, string | undefined>;
	if (value === undefined) {
		delete env.NODE_ENV;
	} else {
		env.NODE_ENV = value;
	}
};

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
		const tmpDirState = {
			files: [{filename: 'provider-cache', size: 123}],
			total: 123,
		};
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
		let launchedBrowser: LaunchedBrowser | null = null;
		const scheduledCallbacks: Array<() => void> = [];
		let currentInvocation = 'A';
		const forgetBrowserEventLoop = spyOn(
			browserInstance,
			'forgetBrowserEventLoop',
		).mockImplementation(() => undefined);
		spies.push(
			forgetBrowserEventLoop,
			spyOn(isFlakyError, 'isFlakyError').mockImplementation(
				(err) => err === launchError,
			),
			spyOn(chromiumPath, 'getChromiumPath').mockImplementation(() => {
				if (failure === 'Chromium path lookup' && currentInvocation === 'A') {
					throw launchError;
				}

				return '/mock-chrome';
			}),
			spyOn(getTmpDir, 'getTmpDirStateIfENoSp').mockImplementation(
				() => tmpDirState,
			),
			spyOn(currentRegion, 'getCurrentRegionInFunction').mockReturnValue(
				'eu-central-1',
			),
			spyOn(browserInstance, 'getBrowserInstance').mockImplementation(
				async (options) => {
					launchedBrowser = await getBrowserInstance(options);
					return launchedBrowser;
				},
			),
		);
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
		const streamedMessages: StreamingPayload[] = [];

		try {
			setNodeEnv('production');
			const invoke = () =>
				rendererHandler({
					params: {
						type: 'renderer',
						output: {type: 'media'},
						chromiumOptions: {gl: 'angle', enableMultiProcessOnLinux: true},
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
					requestContext: {
						requestId: currentInvocation,
						expectedBucketOwner: null,
						getRemainingTimeInMillis: () => 120_000,
					},
					onMediaFiles,
					executionMode: 'invoked',
				});

			await invoke();
			expect(streamedMessages).toHaveLength(1);
			expect(streamedMessages[0]).toMatchObject({
				type: 'error-occurred',
				payload: {
					shouldRetry: true,
					errorInfo: {message: launchError.message, tmpDir: tmpDirState},
				},
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
			// Lambda renders with software GL in a single browser process.
			expect(openBrowserSpy).toHaveBeenLastCalledWith(
				expect.objectContaining({
					chromiumOptions: expect.objectContaining({
						gl: 'swangle',
						enableMultiProcessOnLinux: false,
					}),
				}),
			);
			expect(renderMediaSpy).toHaveBeenLastCalledWith(
				expect.objectContaining({
					chromiumOptions: expect.objectContaining({gl: 'swangle'}),
				}),
			);
			expect(onMediaFiles).toHaveBeenCalledTimes(1);
			expect(forgetBrowserEventLoop).toHaveBeenCalledTimes(1);
			expect(exits).toEqual([]);
		} finally {
			if (launchedBrowser) {
				await closeBrowserInstance({launchedBrowser});
			}

			tmpDirSpy.mockRestore();
			openBrowserSpy.mockRestore();
			renderMediaSpy.mockRestore();
			fs.rmSync(testRoot, {recursive: true, force: true});
			timeoutSpy.mockRestore();
			exitSpy.mockRestore();
			setNodeEnv(previousNodeEnv);
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
	const streamedMessages: StreamingPayload[] = [];
	const closeBrowser = spyOn(
		browserInstance,
		'closeBrowserInstance',
	).mockImplementation(() => {
		notifyCloseStarted();
		return closing;
	});
	spies.push(
		closeBrowser,
		spyOn(isFlakyError, 'isFlakyError').mockImplementation(() => true),
		spyOn(currentRegion, 'getCurrentRegionInFunction').mockReturnValue(
			'eu-central-1',
		),
		spyOn(browserInstance, 'getBrowserInstance').mockImplementation(() =>
			Promise.resolve(browser as never),
		),
	);

	try {
		setNodeEnv('production');
		const handlerPromise = rendererHandler({
			params: {
				type: 'renderer',
				output: {type: 'media'},
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
			requestContext: {
				requestId: 'invocation-a',
				expectedBucketOwner: null,
				getRemainingTimeInMillis: () => 120_000,
			},
			onMediaFiles: null,
			executionMode: 'invoked',
		});

		expect(
			await Promise.race([
				closeStarted.then(() => 'close-started'),
				handlerPromise.then(() => 'handler-returned'),
			]),
		).toBe('close-started');
		expect(closeBrowser).toHaveBeenCalledTimes(1);
		expect(closeBrowser).toHaveBeenCalledWith({
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
		setNodeEnv(previousNodeEnv);
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
	spies.push(
		spyOn(chromiumPath, 'getChromiumPath').mockImplementation(
			() => '/mock-chrome',
		),
	);
	let first: LaunchedBrowser | null = null;
	let second: LaunchedBrowser | null = null;

	try {
		first = await getBrowserInstance({
			logLevel: 'error',
			indent: false,
			chromiumOptions: {},
		});
		await closeBrowserInstance({launchedBrowser: first});
		second = await getBrowserInstance({
			logLevel: 'error',
			indent: false,
			chromiumOptions: {},
		});

		expect(openBrowserSpy).toHaveBeenCalledTimes(2);
		expect(first.instance as unknown).toBe(firstBrowser);
		expect(second.instance as unknown).toBe(secondBrowser);
	} finally {
		if (second) {
			await closeBrowserInstance({launchedBrowser: second});
		}

		if (first) {
			await closeBrowserInstance({launchedBrowser: first});
		}

		openBrowserSpy.mockRestore();
	}
});
