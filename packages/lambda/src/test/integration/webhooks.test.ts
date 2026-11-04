import {afterAll, beforeAll, expect, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'path';
import {bundle} from '@remotion/bundler';
import {
	LambdaClientInternals,
	ServerlessRoutines,
} from '@remotion/lambda-client';
import {RenderInternals, ensureBrowser} from '@remotion/renderer';
import {VERSION} from 'remotion/version';
import {
	getWebhookCalls,
	resetWebhookCalls,
	useFakeAws,
} from '../mocks/fake-aws';
import {waitUntilDone} from './wait-until-done';

useFakeAws();

const webhookBundle = fs.mkdtempSync(path.join(os.tmpdir(), 'webhook-render-'));

beforeAll(async () => {
	await ensureBrowser();
	await bundle({
		entryPoint: path.join(__dirname, 'webhooks.tsx'),
		outDir: webhookBundle,
		publicDir: null,
	});
}, 60000);

afterAll(() => {
	fs.rmSync(webhookBundle, {recursive: true, force: true});
});

const TEST_URL = 'http://localhost:8000';

test(
	'Should call webhook upon completion',
	async () => {
		process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '2048';
		process.env.AWS_LAMBDA_FUNCTION_NAME = 'remotion-dev-lambda';

		resetWebhookCalls();

		const {port, close} = await RenderInternals.serveStatic(webhookBundle, {
			binariesDirectory: null,
			offthreadVideoThreads: 1,
			downloadMap: RenderInternals.makeDownloadMap(48000),
			indent: false,
			logLevel: 'error',
			offthreadVideoCacheSizeInBytes: null,
			port: null,
			remotionRoot: process.cwd(),
			forceIPv4: false,
		});

		const res = await LambdaClientInternals.callFunctionSyncImplementation({
			type: ServerlessRoutines.start,
			payload: {
				enableCancellation: false,
				type: ServerlessRoutines.start,
				output: {type: 'media'},
				serveUrl: `http://localhost:${port}`,
				chromiumOptions: {},
				codec: 'h264',
				composition: 'webhook-success',
				crf: 9,
				envVariables: {},
				frameRange: [0, 0],
				framesPerLambda: 8,
				concurrency: null,
				imageFormat: 'png',
				inputProps: {
					type: 'payload',
					payload: '{}',
				},
				logLevel: 'warn',
				maxRetries: 3,
				outName: 'out.mp4',
				separateAudioTo: null,
				pixelFormat: 'yuv420p',
				privacy: 'public',
				proResProfile: undefined,
				x264Preset: null,
				gopSize: null,
				disableSharedMemoryCapture: false,
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
				forceFps: null,
				forceDurationInFrames: null,
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
				licenseKey: null,
				storageClass: null,
				preferredEffectBackend: 'auto',
				mediaCacheSizeInBytes: null,
				isProduction: null,
				sampleRate: 48000,
			},
			functionName: 'remotion-dev-lambda',
			region: 'us-east-1',
			timeoutInTest: 120000,
			requestHandler: null,
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
			separateAudio: null,
			outputSequence: null,
		});
		await close();
	},
	{timeout: 10000},
);

test(
	'Should call webhook upon timeout',
	async () => {
		const {port, close} = await RenderInternals.serveStatic(webhookBundle, {
			binariesDirectory: null,
			offthreadVideoThreads: 1,
			downloadMap: RenderInternals.makeDownloadMap(48000),
			indent: false,
			logLevel: 'error',
			offthreadVideoCacheSizeInBytes: null,
			port: null,
			remotionRoot: process.cwd(),
			forceIPv4: false,
		});

		resetWebhookCalls();

		await LambdaClientInternals.callFunctionSyncImplementation({
			functionName: 'remotion-dev-lambda',
			region: 'us-east-1',
			type: ServerlessRoutines.launch,
			payload: {
				enableCancellation: false,
				type: ServerlessRoutines.launch,
				output: {type: 'media'},
				preferredEffectBackend: 'auto',
				mediaCacheSizeInBytes: null,
				offthreadVideoCacheSizeInBytes: null,
				offthreadVideoThreads: null,
				serveUrl: `http://localhost:${port}`,
				chromiumOptions: {},
				codec: 'h264',
				composition: 'webhook-timeout',
				crf: 9,
				envVariables: {},
				frameRange: [0, 0],
				framesPerFunction: 8,
				concurrency: null,
				imageFormat: 'png',
				inputProps: {
					type: 'payload',
					payload: '{}',
				},
				logLevel: 'warn',
				maxRetries: 3,
				outName: 'out.mp4',
				separateAudioTo: null,
				pixelFormat: 'yuv420p',
				privacy: 'public',
				proResProfile: null,
				x264Preset: null,
				gopSize: null,
				disableSharedMemoryCapture: false,
				jpegQuality: undefined,
				scale: 1,
				timeoutInMilliseconds: 10000,
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
				forceFps: null,
				forceDurationInFrames: null,
				rendererFunctionName: null,
				audioCodec: null,
				deleteAfter: null,
				colorSpace: null,
				preferLossless: false,
				forcePathStyle: false,
				metadata: null,
				licenseKey: null,
				storageClass: null,
				isProduction: true,
				sampleRate: 48000,
			},
			timeoutInTest: 1000,
			requestHandler: null,
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
