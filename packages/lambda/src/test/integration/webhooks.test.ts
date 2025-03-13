import {RenderInternals, ensureBrowser} from '@remotion/renderer';
import {ServerlessRoutines} from '@remotion/serverless';
import {beforeAll, expect, test} from 'bun:test';
import path from 'path';
import {VERSION} from 'remotion/version';
import {getWebhookCalls, resetWebhookCalls} from '../mock-implementation';
import {mockImplementation} from '../mocks/mock-implementation';
import {waitUntilDone} from './wait-until-done';

beforeAll(async () => {
	await ensureBrowser();
});

const TEST_URL = 'http://localhost:8000';
const exampleBuild = path.join(process.cwd(), '..', 'example', 'build');

test(
	'Should call webhook upon completion',
	async () => {
		process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '2048';
		process.env.AWS_LAMBDA_FUNCTION_NAME = 'remotion-dev-lambda';

		resetWebhookCalls();

		const {port, close} = await RenderInternals.serveStatic(exampleBuild, {
			binariesDirectory: null,
			offthreadVideoThreads: 1,
			downloadMap: RenderInternals.makeDownloadMap(),
			indent: false,
			logLevel: 'error',
			offthreadVideoCacheSizeInBytes: null,
			port: null,
			remotionRoot: path.dirname(exampleBuild),
			forceIPv4: false,
		});

		const res = await mockImplementation.callFunctionSync({
			type: ServerlessRoutines.start,
			payload: {
				type: ServerlessRoutines.start,
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
				offthreadVideoThreads: null,
				deleteAfter: null,
				colorSpace: null,
				preferLossless: false,
				forcePathStyle: false,
				metadata: {Author: 'Lunar'},
				apiKey: null,
			},
			functionName: 'remotion-dev-lambda',
			region: 'us-east-1',
			timeoutInTest: 120000,
		});

		await waitUntilDone(res.bucketName, res.renderId);

		const webhookCalls = getWebhookCalls();

		expect(webhookCalls.length).toBe(1);
		expect(webhookCalls[0].options.url).toBe(TEST_URL);
		const {payload} = webhookCalls[0].options;
		if (payload.type !== 'success') {
			throw new Error(`Expected success, got ${payload.type}`);
		}

		const {
			expectedBucketOwner,
			timeToFinish,
			renderId,
			costs,
			...testablePayload
		} = payload;
		expect(testablePayload).toEqual({
			type: 'success',
			bucketName: 'remotionlambda-eucentral1-abcdef',
			customData: {
				customID: 123,
			},
			outputUrl: 'https://s3.mock-region-1.amazonaws.com/bucket/mock.mp4',
			lambdaErrors: [],
			outputFile: 'https://s3.mock-region-1.amazonaws.com/bucket/mock.mp4',
		});
		await close();
	},
	{timeout: 10000},
);

test(
	'Should call webhook upon timeout',
	async () => {
		// Maybe this can use simulateLambdaRender instead
		const {port, close} = await RenderInternals.serveStatic(exampleBuild, {
			binariesDirectory: null,
			offthreadVideoThreads: 1,
			downloadMap: RenderInternals.makeDownloadMap(),
			indent: false,
			logLevel: 'error',
			offthreadVideoCacheSizeInBytes: null,
			port: null,
			remotionRoot: path.dirname(exampleBuild),
			forceIPv4: false,
		});

		resetWebhookCalls();

		await mockImplementation.callFunctionSync({
			functionName: 'remotion-dev-lambda',
			region: 'us-east-1',
			type: ServerlessRoutines.launch,
			payload: {
				type: ServerlessRoutines.launch,
				offthreadVideoCacheSizeInBytes: null,
				offthreadVideoThreads: null,
				serveUrl: `http://localhost:${port}`,
				chromiumOptions: {},
				codec: 'h264',
				composition: 'react-svg',
				crf: 9,
				envVariables: {},
				frameRange: [0, 10],
				framesPerFunction: 8,
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
				proResProfile: null,
				x264Preset: null,
				jpegQuality: undefined,
				scale: 1,
				timeoutInMilliseconds: 3000,
				numberOfGifLoops: null,
				everyNthFrame: 1,
				concurrencyPerFunction: 1,
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
				forcePathStyle: false,
				metadata: null,
				apiKey: null,
			},
			timeoutInTest: 1000,
		});

		await new Promise((resolve) => {
			setTimeout(resolve, 2000);
		});

		const webhookCalls = getWebhookCalls();

		expect(webhookCalls.length).toBe(1);
		expect(webhookCalls[0].options.payload).toEqual({
			type: 'timeout',
			renderId: 'abc',
			expectedBucketOwner: '124',
			bucketName: 'abc',
			customData: {
				customID: 123,
			},
		});
		await close();
	},
	{timeout: 10000},
);
