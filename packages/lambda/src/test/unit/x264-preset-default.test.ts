import {expect, test} from 'bun:test';
import type {AwsProvider} from '@remotion/lambda-client';
import type {
	ProviderSpecifics,
	ServerlessPayload,
	ServerlessStartPayload,
} from '@remotion/serverless';
import {ServerlessRoutines, startHandler, VERSION} from '@remotion/serverless';
import {NoReactInternals} from 'remotion/no-react';
import {serverAwsImplementation} from '../../functions/aws-server-implementation';
import {mockServerImplementation} from '../mock-implementation';
import {mockImplementation} from '../mocks/mock-implementation';

const makeStartPayload = ({
	codec,
	x264Preset,
}: Pick<ServerlessStartPayload<AwsProvider>, 'codec' | 'x264Preset'>) => {
	return {
		type: ServerlessRoutines.start,
		rendererFunctionName: null,
		serveUrl: 'https://example.com',
		composition: 'test-composition',
		framesPerLambda: null,
		concurrency: null,
		inputProps: {type: 'payload', payload: '{}'},
		codec,
		audioCodec: null,
		imageFormat: 'jpeg',
		crf: null,
		envVariables: {},
		pixelFormat: null,
		proResProfile: null,
		x264Preset,
		gopSize: null,
		jpegQuality: 80,
		maxRetries: 1,
		privacy: 'public',
		logLevel: 'error',
		frameRange: null,
		outName: null,
		timeoutInMilliseconds: 30_000,
		chromiumOptions: {},
		scale: 1,
		everyNthFrame: 1,
		numberOfGifLoops: null,
		concurrencyPerLambda: 1,
		downloadBehavior: {type: 'play-in-browser'},
		muted: false,
		version: VERSION,
		overwrite: true,
		audioBitrate: null,
		videoBitrate: null,
		encodingMaxRate: null,
		encodingBufferSize: null,
		webhook: null,
		forceHeight: null,
		forceWidth: null,
		forceFps: null,
		forceDurationInFrames: null,
		bucketName: 'test-bucket',
		offthreadVideoCacheSizeInBytes: null,
		offthreadVideoThreads: null,
		mediaCacheSizeInBytes: null,
		deleteAfter: null,
		colorSpace: null,
		preferLossless: false,
		forcePathStyle: false,
		enableCancellation: null,
		metadata: null,
		licenseKey: null,
		storageClass: null,
		isProduction: true,
		sampleRate: 48_000,
	} satisfies ServerlessStartPayload<AwsProvider>;
};

test('resolves the Lambda x264 preset at the runtime boundary', async () => {
	const launchedPayloads: ServerlessPayload<AwsProvider>[] = [];
	const providerSpecifics = {
		...mockImplementation,
		callFunctionAsync: ({payload}) => {
			launchedPayloads.push(payload);
			return Promise.resolve();
		},
	} satisfies ProviderSpecifics<AwsProvider>;

	for (const payload of [
		makeStartPayload({codec: 'h264', x264Preset: null}),
		makeStartPayload({codec: 'h264', x264Preset: 'medium'}),
		makeStartPayload({codec: 'vp8', x264Preset: null}),
	]) {
		await startHandler({
			params: payload,
			options: {
				expectedBucketOwner: '123456789012',
				timeoutInMilliseconds: 120_000,
				renderId: 'test-render',
			},
			providerSpecifics,
			insideFunctionSpecifics: mockServerImplementation,
		});
	}

	const launchPayloads = launchedPayloads.map((payload) => {
		if (payload.type !== ServerlessRoutines.launch) {
			throw new Error('Expected a launch payload');
		}

		return payload;
	});

	expect(serverAwsImplementation.defaultX264Preset).toBe(
		NoReactInternals.ENABLE_V5_BREAKING_CHANGES ? 'veryfast' : null,
	);
	expect(launchPayloads[0].x264Preset).toBe(
		NoReactInternals.ENABLE_V5_BREAKING_CHANGES ? 'veryfast' : null,
	);
	expect(launchPayloads[1].x264Preset).toBe('medium');
	expect(launchPayloads[2].x264Preset).toBe(null);
});
