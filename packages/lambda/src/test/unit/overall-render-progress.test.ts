import {expect, spyOn, test} from 'bun:test';
import type {PostRenderData, RenderMetadata} from '@remotion/lambda-client';
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

test('persists accurate aggregate progress through duplicate updates and chunk retries', async () => {
	let persistedBody = '';
	const write = spyOn(
		writeFile,
		'lambdaWriteFileImplementation',
	).mockImplementation(({body}) => {
		persistedBody = String(body);
		return Promise.resolve();
	});
	const progress = makeOverallRenderProgress({
		cancellationEnabled: false,
		bucketName: 'bucket',
		expectedBucketOwner: null,
		forcePathStyle: false,
		logLevel: 'error',
		region: 'eu-central-1',
		renderId: 'render-id',
		timeoutTimestamp: Date.now() + 10000,
	});
	try {
		progress.setExpectedChunks(2);
		progress.setRenderMetadata({
			type: 'video',
			frameRange: [1, 20],
			everyNthFrame: 2,
			totalChunks: 2,
		} as RenderMetadata);
		let notifications = 0;
		const unsubscribe = progress.subscribe(() => notifications++);
		progress.setFrames({index: 0, rendered: 4, encoded: 2});
		progress.setFrames({index: 1, rendered: 3, encoded: 1});
		progress.setFrames({index: 1, rendered: 3, encoded: 1});
		expect(notifications).toBe(2);
		expect(progress.get()).toMatchObject({
			framesRendered: 7,
			framesEncoded: 3,
			timeToRenderFrames: null,
		});
		progress.setFrames({index: 0, rendered: 0, encoded: 0});
		expect(progress.get()).toMatchObject({framesRendered: 3, framesEncoded: 1});
		progress.setFrames({index: 0, rendered: 5, encoded: 5});
		progress.setFrames({index: 1, rendered: 5, encoded: 5});
		expect(progress.get().timeToRenderFrames).not.toBeNull();
		progress.setUploadedFrames({index: 0, uploaded: 4, sizeInBytes: 40});
		progress.setUploadedFrames({index: 1, uploaded: 5, sizeInBytes: 50});
		progress.setUploadedFrames({index: 0, uploaded: 3, sizeInBytes: 30});
		progress.setUploadedFrames({index: 0, uploaded: 5, sizeInBytes: 60});
		progress.setLambdaInvoked(0, 2048);
		progress.setLambdaInvoked(0, 2048);
		progress.setLambdaInvoked(1, 2048);
		progress.setLambdaInvoked(0, 4096);
		unsubscribe();
		const lastNotification = notifications;
		await progress.flush('test');
		expect(notifications).toBe(lastNotification);
		expect(JSON.parse(persistedBody)).toMatchObject({
			framesRendered: 10,
			framesEncoded: 10,
			framesUploaded: 10,
			uploadedSizeInBytes: 110,
			lambdasInvoked: 2,
			rendererMemorySizeInMb: 4096,
		});
	} finally {
		await progress.flush('cleanup');
		write.mockRestore();
	}
});
