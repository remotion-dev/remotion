import {RenderInternals} from '@remotion/renderer';
import {afterAll, beforeAll, expect, test} from 'vitest';
import {LambdaRoutines} from '../../../defaults';
import {callLambda} from '../../../shared/call-lambda';
import {disableLogs, enableLogs} from '../../disable-logs';

beforeAll(() => {
	disableLogs();
});

afterAll(async () => {
	enableLogs();

	await RenderInternals.killAllBrowsers();
});

test('Should fail when using an incompatible version', async () => {
	process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '2048';

	try {
		const aha = await callLambda({
			type: LambdaRoutines.launch,
			payload: {
				serveUrl: 'https://competent-mccarthy-56f7c9.netlify.app/',
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
				outName: null,
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
				overwrite: true,
				webhook: null,
				audioBitrate: null,
				videoBitrate: null,
				encodingBufferSize: null,
				encodingMaxRate: null,
				forceHeight: null,
				forceWidth: null,
				rendererFunctionName: null,
				bucketName: 'remotion-dev-render',
				audioCodec: null,
				renderId: 'test',
				offthreadVideoCacheSizeInBytes: null,
				deleteAfter: null,
				colorSpace: 'default',
				preferLossless: false,
			},
			functionName: 'remotion-dev-render',
			receivedStreamingPayload: () => undefined,
			region: 'us-east-1',
			timeoutInTest: 120000,
			retriesRemaining: 0,
		});
		console.log(aha);
		throw new Error('Should not reach this');
	} catch (err) {
		expect((err as Error).message).toContain(
			'Incompatible site: When visiting',
		);
	}
});
