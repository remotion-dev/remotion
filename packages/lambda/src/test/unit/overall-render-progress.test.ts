import {expect, spyOn, test} from 'bun:test';
import type {PostRenderData} from '@remotion/lambda-client';
import * as writeFile from '../../../../lambda-client/src/write-file';
import {
	makeInitialOverallRenderProgress,
	makeOverallRenderProgress,
} from '../../functions/overall-render-progress';

const postRenderData: PostRenderData = {
	separateAudio: null,
	artifactProgress: [],
	cost: {
		currency: 'USD',
		disclaimer: 'test',
		estimatedCost: 0,
		estimatedDisplayCost: '$0',
	},
	deleteAfter: null,
	endTime: 1,
	errors: [],
	estimatedBillingDurationInMilliseconds: 1,
	filesCleanedUp: 0,
	mostExpensiveFrameRanges: [],
	outputFile: 'https://example.com/out.mp4',
	outputSequence: null,
	outputSize: 1,
	renderSize: 1,
	retriesInfo: [],
	startTime: 0,
	timeToCleanUp: 0,
	timeToCombine: 1,
	timeToEncode: 1,
	timeToFinish: 1,
	timeToRenderChunks: 1,
	timeToRenderFrames: 1,
};

test('stores whether cancellation is enabled', () => {
	const progress = makeInitialOverallRenderProgress(1, true);
	expect(progress.cancellationEnabled).toBe(true);
});

test('setPostRenderData retries transient progress upload failures', async () => {
	let attempts = 0;
	let persistedBody: string | null = null;
	const write = spyOn(
		writeFile,
		'lambdaWriteFileImplementation',
	).mockImplementation(({body}) => {
		attempts++;
		if (attempts < 3) {
			return Promise.reject(new Error('Temporary progress upload failure'));
		}

		persistedBody = String(body);
		return Promise.resolve();
	});
	const overallProgress = makeOverallRenderProgress({
		cancellationEnabled: false,
		bucketName: 'bucket',
		expectedBucketOwner: '123456789012',
		forcePathStyle: false,
		logLevel: 'error',
		region: 'eu-central-1',
		renderId: 'render-id',
		timeoutTimestamp: 1,
	});

	try {
		await overallProgress.setPostRenderData(postRenderData);
	} finally {
		write.mockRestore();
	}

	expect(attempts).toBe(3);
	if (persistedBody === null) {
		throw new Error('Expected progress to be persisted');
	}

	expect(JSON.parse(persistedBody).postRenderData).toEqual(postRenderData);
});
