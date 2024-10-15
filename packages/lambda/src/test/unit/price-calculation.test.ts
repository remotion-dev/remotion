import {expect, test} from 'vitest';
import {estimatePriceFromBucket} from '../../functions/helpers/calculate-price-from-bucket';
import {mockImplementation} from '../mock-implementation';

test('Should not throw while calculating prices when time shifts occur', () => {
	const aDate = Date.now();
	process.env.__RESERVED_IS_INSIDE_REMOTION_LAMBDA = 'true';
	process.env.AWS_REGION = 'us-east-1';

	const price = estimatePriceFromBucket({
		memorySizeInMb: 1024,
		renderMetadata: {
			audioBitrate: null,
			codec: 'h264',
			compositionId: 'react-svg',
			estimatedRenderLambdaInvokations: 10,
			estimatedTotalLambdaInvokations: 10,
			framesPerLambda: 10,
			imageFormat: 'jpeg',
			inputProps: {
				type: 'payload',
				payload: '{}',
			},
			lambdaVersion: '2021-11-29',
			memorySizeInMb: 1024,
			region: 'eu-central-1',
			renderId: '123',
			deleteAfter: null,
			siteId: 'my-site',
			startedDate: aDate + 1000,
			totalChunks: 20,
			type: 'video',
			outName: 'out.mp4',
			privacy: 'public',
			everyNthFrame: 1,
			frameRange: [0, 99],
			audioCodec: null,
			downloadBehavior: {type: 'play-in-browser'},
			numberOfGifLoops: null,
			muted: false,
			metadata: {Author: 'Lunar'},
			functionName: 'remotion-render-la8ffw',
		},
		diskSizeInMb: 512,
		lambdasInvoked: 1,
		timings: [
			{
				chunk: 1,
				rendered: aDate - 2000,
				start: aDate,
			},
		],
		providerSpecifics: mockImplementation,
	});
	expect(price?.accruedSoFar).toBeGreaterThanOrEqual(0);
});
