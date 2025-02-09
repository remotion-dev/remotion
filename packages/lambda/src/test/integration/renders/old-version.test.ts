import {ServerlessRoutines} from '@remotion/serverless';
import {expect, test} from 'bun:test';
import {mockImplementation} from '../../mocks/mock-implementation';

test('Should fail when using an incompatible version', async () => {
	try {
		const aha = await mockImplementation.callFunctionSync({
			type: ServerlessRoutines.launch,
			payload: {
				type: ServerlessRoutines.launch,
				serveUrl: 'https://competent-mccarthy-56f7c9.netlify.app/',
				chromiumOptions: {},
				codec: 'h264',
				composition: 'react-svg',
				crf: 9,
				envVariables: {},
				frameRange: [0, 12],
				framesPerFunction: 8,
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
				proResProfile: null,
				x264Preset: null,
				jpegQuality: undefined,
				scale: 1,
				timeoutInMilliseconds: 12000,
				numberOfGifLoops: null,
				everyNthFrame: 1,
				concurrencyPerFunction: 1,
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
				offthreadVideoThreads: null,
				deleteAfter: null,
				colorSpace: null,
				preferLossless: false,
				forcePathStyle: false,
				metadata: {Author: 'Lunar'},
				apiKey: null,
			},
			functionName: 'remotion-dev-render',
			region: 'us-east-1',
			timeoutInTest: 120000,
		});
		console.log(aha);
		throw new Error('Should not reach this');
	} catch (err) {
		expect((err as Error).message).toContain(
			'Incompatible site: When visiting',
		);
	}
});
