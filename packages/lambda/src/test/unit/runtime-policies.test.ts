import {expect, mock, spyOn, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {LambdaClientInternals} from '@remotion/lambda-client';
import type {AwsProvider} from '@remotion/lambda-client';
import type * as Renderer from '@remotion/renderer';
import {rendererHandler, VERSION} from '@remotion/serverless';
import type {StreamingPayload} from '@remotion/serverless';
import {serverAwsImplementation} from '../../functions/aws-server-implementation';

// Serverless is published as CommonJS, so intercept its renderer instance.
const {RenderInternals} = require('@remotion/renderer') as typeof Renderer;

test.each(['angle', null] as const)(
	'Lambda renders with software GL and one browser process for gl=%s',
	async (gl) => {
		const testRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'lambda-runtime-'));
		const tmpDirSpy = spyOn(RenderInternals, 'tmpDir').mockImplementation(() =>
			fs.mkdtempSync(path.join(testRoot, 'render-')),
		);
		// Fake the Chromium process and encoder, keeping the shared handler,
		// browser cache, and Lambda runtime policy wired together.
		const browser = {
			on: mock(() => undefined),
			close: mock(() => Promise.resolve()),
			runner: {
				forgetEventLoop: () => undefined,
				deleteBrowserCaches: () => undefined,
			},
		};
		const openBrowserSpy = spyOn(
			RenderInternals,
			'internalOpenBrowser',
		).mockResolvedValue(browser as never);
		const renderMediaSpy = spyOn(
			RenderInternals,
			'internalRenderMedia',
		).mockResolvedValue({slowestFrames: []} as never);
		const messages: StreamingPayload<AwsProvider>[] = [];
		let launchedBrowser: Awaited<
			ReturnType<typeof serverAwsImplementation.getBrowserInstance>
		> | null = null;
		const chromiumOptions = {gl, enableMultiProcessOnLinux: true};

		try {
			await rendererHandler<AwsProvider>({
				params: {
					type: 'renderer',
					chromiumOptions,
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
					retriesLeft: 0,
					attempt: 1,
					chunk: 0,
					enableCancellation: false,
				} as never,
				options: {expectedBucketOwner: '123456789012', isWarm: false},
				onStream: (message) => {
					messages.push(message);
					return Promise.resolve();
				},
				providerSpecifics: LambdaClientInternals.awsImplementation,
				insideFunctionSpecifics: {
					...serverAwsImplementation,
					getCurrentRegionInFunction: () => 'us-east-1',
					getBrowserInstance: async (options) => {
						launchedBrowser =
							await serverAwsImplementation.getBrowserInstance(options);
						return launchedBrowser;
					},
				},
				requestContext: {
					requestId: 'request-id',
					expectedBucketOwner: '123456789012',
					getRemainingTimeInMillis: () => 120_000,
				},
				onMediaFiles: () => Promise.resolve(),
				executionMode: 'invoked',
			});

			expect(messages).toContainEqual(
				expect.objectContaining({type: 'chunk-complete'}),
			);
			expect(openBrowserSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					chromiumOptions: expect.objectContaining({
						gl: 'swangle',
						enableMultiProcessOnLinux: false,
					}),
				}),
			);
			expect(renderMediaSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					chromiumOptions: expect.objectContaining({
						gl: gl === 'angle' ? 'swangle' : null,
					}),
				}),
			);
			expect(chromiumOptions).toEqual({gl, enableMultiProcessOnLinux: true});
			expect(serverAwsImplementation.startRendererDiagnostics).toBeNull();
		} finally {
			if (launchedBrowser) {
				await serverAwsImplementation.closeBrowserInstance({launchedBrowser});
			}

			tmpDirSpy.mockRestore();
			openBrowserSpy.mockRestore();
			renderMediaSpy.mockRestore();
			fs.rmSync(testRoot, {recursive: true, force: true});
		}
	},
);
