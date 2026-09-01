import {expect, test} from 'bun:test';
import {estimatePriceFromMetadata} from '@remotion/serverless-client';
import {awsImplementation} from '../aws-provider';
import {estimatePrice} from '../estimate-price';

test('Should not throw while calculating prices when time shifts occur', () => {
	const aDate = Date.now();
	process.env.AWS_REGION = 'us-east-1';

	const price = estimatePriceFromMetadata({
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
			rendererFunctionName: 'remotion-render-la8ffw',
			dimensions: {
				height: 1080,
				width: 1920,
			},
			scale: 1,
		},
		diskSizeInMb: 512,
		functionsInvoked: 1,
		timings: [
			{
				chunk: 1,
				rendered: aDate - 2000,
				start: aDate,
			},
		],
		region: 'eu-central-1',
		providerSpecifics: awsImplementation,
		fatalErrorTimestamp: null,
	});
	expect(price?.accruedSoFar).toBeGreaterThanOrEqual(0);
});

test('China prices use CNY ARM duration, request, and regional storage rates', () => {
	const input = {
		memorySizeInMb: 1024,
		diskSizeInMb: 10240,
		lambdasInvoked: 100,
		durationInMilliseconds: 1_000_000,
	};
	const beijing = estimatePrice({...input, region: 'cn-north-1'});
	const ningxia = estimatePrice({...input, region: 'cn-northwest-1'});

	expect(beijing).toBe(0.09312);
	expect(ningxia).toBe(0.09288);
	expect(beijing).toBeGreaterThan(ningxia);

	expect(
		estimatePrice({...input, diskSizeInMb: 512, region: 'cn-north-1'}),
	).toBe(0.09094);
});
