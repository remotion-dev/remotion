import {RenderInternals} from '@remotion/renderer';
import path from 'path';
import {VERSION} from 'remotion/version';
import {beforeAll, beforeEach, describe, expect, test, vi} from 'vitest';
import {LambdaRoutines} from '../../defaults';
import {callLambda} from '../../shared/call-lambda';
import {mockableHttpClients} from '../../shared/invoke-webhook';

const originalFetch = mockableHttpClients.http;
beforeEach(() => {
	// @ts-expect-error
	mockableHttpClients.http = vi.fn(
		(
			_url: string,
			_options: unknown,
			cb: (a: {statusCode: number}) => void,
		) => {
			cb({
				statusCode: 201,
			});
			return {
				on: () => undefined,
				end: () => undefined,
			};
		},
	);
	return () => {
		mockableHttpClients.http = originalFetch;
	};
});

beforeAll(() => {
	return async () => {
		await RenderInternals.killAllBrowsers();
	};
});

const TEST_URL = 'http://localhost:8000';

describe('Webhooks', () => {
	test('Should call webhook upon completion', async () => {
		process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '2048';
		process.env.AWS_LAMBDA_FUNCTION_NAME = 'remotion-dev-lambda';

		const exampleBuild = path.join(process.cwd(), '..', 'example', 'build');

		const {port, close} = await RenderInternals.serveStatic(exampleBuild, {
			binariesDirectory: null,
			concurrency: 1,
			downloadMap: RenderInternals.makeDownloadMap(),
			indent: false,
			logLevel: 'error',
			offthreadVideoCacheSizeInBytes: null,
			port: null,
			remotionRoot: path.dirname(exampleBuild),
			forceIPv4: false,
		});

		const res = await callLambda({
			type: LambdaRoutines.start,
			payload: {
				serveUrl: `http://localhost:${port}`,
				chromiumOptions: {},
				codec: 'h264',
				composition: 'react-svg',
				crf: 9,
				envVariables: {},
				frameRange: [0, 2],
				framesPerLambda: 8,
				imageFormat: 'png',
				inputProps: {
					type: 'payload',
					payload: '{}',
				},
				logLevel: 'warn',
				maxRetries: 3,
				outName: 'out.mp4',
				pixelFormat: 'yuv420p',
				privacy: 'public',
				proResProfile: undefined,
				x264Preset: null,
				jpegQuality: undefined,
				scale: 1,
				timeoutInMilliseconds: 40000,
				numberOfGifLoops: null,
				everyNthFrame: 1,
				concurrencyPerLambda: 1,
				downloadBehavior: {
					type: 'play-in-browser',
				},
				muted: false,
				version: VERSION,
				overwrite: true,
				webhook: {
					url: TEST_URL,
					secret: 'TEST_SECRET',
					customData: {
						customID: 123,
					},
				},
				audioBitrate: null,
				videoBitrate: null,
				encodingBufferSize: null,
				encodingMaxRate: null,
				forceHeight: null,
				forceWidth: null,
				rendererFunctionName: null,
				bucketName: null,
				audioCodec: null,
				offthreadVideoCacheSizeInBytes: null,
				deleteAfter: null,
				colorSpace: null,
				preferLossless: false,
			},
			functionName: 'remotion-dev-lambda',
			onMessage: () => undefined,
			region: 'us-east-1',
			timeoutInTest: 120000,
			retriesRemaining: 0,
		});
		const parsed = res;

		await callLambda({
			type: LambdaRoutines.status,
			payload: {
				bucketName: parsed.bucketName,
				renderId: parsed.renderId,
				version: VERSION,
				logLevel: 'info',
			},
			functionName: 'remotion-dev-lambda',
			onMessage: () => undefined,
			region: 'us-east-1',
			timeoutInTest: 120000,
			retriesRemaining: 0,
		});

		expect(mockableHttpClients.http).toHaveBeenCalledTimes(1);
		expect(mockableHttpClients.http).toHaveBeenCalledWith(
			TEST_URL,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Remotion-Signature': expect.stringContaining('sha512='),
					'X-Remotion-Status': 'success',
					'X-Remotion-Mode': 'production',
					'Content-Length': expect.any(Number),
				},
				timeout: 5000,
			},
			expect.anything(),
		);
		await close();
	});

	test('Should call webhook upon timeout', async () => {
		process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '2048';

		const exampleBuild = path.join(process.cwd(), '..', 'example', 'build');

		// Maybe this can use simulateLambdaRender instead
		const {port, close} = await RenderInternals.serveStatic(exampleBuild, {
			binariesDirectory: null,
			concurrency: 1,
			downloadMap: RenderInternals.makeDownloadMap(),
			indent: false,
			logLevel: 'error',
			offthreadVideoCacheSizeInBytes: null,
			port: null,
			remotionRoot: path.dirname(exampleBuild),
			forceIPv4: false,
		});

		await callLambda({
			functionName: 'remotion-dev-lambda',
			onMessage: () => undefined,
			region: 'us-east-1',
			type: LambdaRoutines.launch,
			payload: {
				offthreadVideoCacheSizeInBytes: null,
				serveUrl: `http://localhost:${port}`,
				chromiumOptions: {},
				codec: 'h264',
				composition: 'react-svg',
				crf: 9,
				envVariables: {},
				frameRange: [0, 10],
				framesPerLambda: 8,
				imageFormat: 'png',
				inputProps: {
					type: 'payload',
					payload: '{}',
				},
				logLevel: 'warn',
				maxRetries: 3,
				outName: 'out.mp4',
				pixelFormat: 'yuv420p',
				privacy: 'public',
				proResProfile: undefined,
				x264Preset: null,
				jpegQuality: undefined,
				scale: 1,
				timeoutInMilliseconds: 3000,
				numberOfGifLoops: null,
				everyNthFrame: 1,
				concurrencyPerLambda: 1,
				downloadBehavior: {
					type: 'play-in-browser',
				},
				muted: false,
				overwrite: true,
				webhook: {
					url: TEST_URL,
					secret: 'TEST_SECRET',
					customData: {customID: 123},
				},
				audioBitrate: null,
				videoBitrate: null,
				encodingBufferSize: null,
				encodingMaxRate: null,
				bucketName: 'abc',
				renderId: 'abc',
				forceHeight: null,
				forceWidth: null,
				rendererFunctionName: null,
				audioCodec: null,
				deleteAfter: null,
				colorSpace: null,
				preferLossless: false,
			},
			timeoutInTest: 1000,
			retriesRemaining: 0,
		});

		await new Promise((resolve) => {
			setTimeout(resolve, 2000);
		});
		expect(mockableHttpClients.http).toHaveBeenCalledTimes(1);
		expect(mockableHttpClients.http).toHaveBeenCalledWith(
			TEST_URL,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Remotion-Mode': 'production',
					'X-Remotion-Signature': expect.stringContaining('sha512='),
					'X-Remotion-Status': 'timeout',
					'Content-Length': 84,
				},
				timeout: 5000,
			},
			expect.anything(),
		);
		await close();
	});
});
