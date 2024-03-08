import {RenderInternals} from '@remotion/renderer';
import {VERSION} from 'remotion/version';
import {afterAll, beforeAll, expect, test} from 'vitest';
import {LambdaRoutines} from '../../../defaults';
import {lambdaReadFile} from '../../../functions/helpers/io';
import {callLambda} from '../../../shared/call-lambda';
import {disableLogs, enableLogs} from '../../disable-logs';

beforeAll(() => {
	disableLogs();
});

afterAll(async () => {
	enableLogs();

	await RenderInternals.killAllBrowsers();
});

test('Should add silent audio if there is no audio', async () => {
	process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '2048';

	const res = await callLambda({
		payload: {
			serveUrl:
				'https://64d3734a6bb69052c34d3616--spiffy-kelpie-71657b.netlify.app/',
			chromiumOptions: {},
			codec: 'h264',
			composition: 'react-svg',
			crf: 9,
			envVariables: {},
			frameRange: [0, 12],
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
			timeoutInMilliseconds: 12000,
			numberOfGifLoops: null,
			everyNthFrame: 1,
			concurrencyPerLambda: 1,
			downloadBehavior: {
				type: 'play-in-browser',
			},
			muted: false,
			version: VERSION,
			overwrite: true,
			webhook: null,
			audioBitrate: null,
			videoBitrate: null,
			encodingMaxRate: null,
			encodingBufferSize: null,
			forceHeight: null,
			forceWidth: null,
			rendererFunctionName: null,
			bucketName: null,
			audioCodec: null,
			offthreadVideoCacheSizeInBytes: null,
			deleteAfter: null,
			colorSpace: 'default',
			preferLossless: false,
		},
		functionName: 'remotion-dev-render',
		receivedStreamingPayload: () => undefined,
		region: 'eu-central-1',
		type: LambdaRoutines.start,
		timeoutInTest: 120000,
		retriesRemaining: 0,
	});

	const progress = await callLambda({
		payload: {
			bucketName: res.bucketName,
			renderId: res.renderId,
			version: VERSION,
			logLevel: 'info',
		},
		functionName: 'remotion-dev-render',
		receivedStreamingPayload: () => undefined,
		region: 'eu-central-1',
		type: LambdaRoutines.status,
		timeoutInTest: 120000,
		retriesRemaining: 0,
	});

	const file = await lambdaReadFile({
		bucketName: progress.outBucket as string,
		key: progress.outKey as string,
		expectedBucketOwner: 'abc',
		region: 'eu-central-1',
	});
	const probe = await RenderInternals.callFf({
		bin: 'ffprobe',
		args: ['-'],
		indent: false,
		logLevel: 'info',
		options: {
			stdin: file,
		},
		binariesDirectory: null,
		cancelSignal: undefined,
	});
	expect(probe.stderr).toMatch(/Stream #0:0/);
	expect(probe.stderr).toMatch(/Video: h264/);
	expect(probe.stderr).toMatch(/Stream #0:1/);
	expect(probe.stderr).toMatch(/Audio: aac/);
});
