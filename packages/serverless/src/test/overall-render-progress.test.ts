import {expect, test} from 'bun:test';
import type {
	CloudProvider,
	PostRenderData,
	ProviderSpecifics,
} from '@remotion/serverless-client';
import {makeOverallRenderProgress} from '../overall-render-progress';

type MockProvider = CloudProvider<
	'eu-central-1',
	{s3Key: string; s3Url: string},
	{},
	'standard',
	{}
>;

const makeProviderSpecifics = ({
	writeFile,
}: {
	writeFile: ProviderSpecifics<MockProvider>['writeFile'];
}): ProviderSpecifics<MockProvider> => {
	return {
		applyLifeCycle: () => Promise.resolve(),
		bucketExists: () => Promise.resolve(true),
		callFunctionAsync: () => Promise.resolve(),
		callFunctionStreaming: () => Promise.resolve(),
		callFunctionSync: () => Promise.reject(new Error('Not implemented')),
		checkCredentials: () => undefined,
		convertToServeUrl: () => 'serve-url',
		createBucket: () => Promise.resolve(),
		deleteFile: () => Promise.resolve(),
		deleteFunction: () => Promise.resolve(),
		estimatePrice: () => 0,
		getAccountId: () => Promise.resolve('123456789012'),
		getBucketPrefix: () => 'remotionlambda-',
		getBuckets: () => Promise.resolve([]),
		getChromiumPath: () => null,
		getEphemeralStorageForPriceCalculation: () => 512,
		getFunctions: () => Promise.resolve([]),
		getLoggingUrlForMethod: () => 'logs',
		getLoggingUrlForRendererFunction: () => 'logs',
		getMaxNonInlinePayloadSizePerFunction: () => 0,
		getMaxStillInlinePayloadSize: () => 0,
		getOutputUrl: () => ({key: 'out.mp4', url: 'https://example.com/out.mp4'}),
		headFile: () => Promise.resolve({}),
		isFlakyError: () => false,
		listObjects: () => Promise.resolve([]),
		parseFunctionName: () => null,
		printLoggingHelper: false,
		randomHash: () => 'hash',
		readFile: () => Promise.reject(new Error('Not implemented')),
		serverStorageProductName: () => 'S3',
		validateDeleteAfter: () => undefined,
		writeFile,
	};
};

const postRenderData: PostRenderData<MockProvider> = {
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

test('setPostRenderData retries transient progress upload failures', async () => {
	let attempts = 0;
	let persistedBody: string | null = null;
	const providerSpecifics = makeProviderSpecifics({
		writeFile: ({body}) => {
			attempts++;
			if (attempts < 3) {
				return Promise.reject(new Error('Temporary progress upload failure'));
			}

			persistedBody = String(body);
			return Promise.resolve();
		},
	});
	const overallProgress = makeOverallRenderProgress({
		bucketName: 'bucket',
		expectedBucketOwner: '123456789012',
		forcePathStyle: false,
		logLevel: 'error',
		providerSpecifics,
		region: 'eu-central-1',
		renderId: 'render-id',
		timeoutTimestamp: 1,
	});

	await overallProgress.setPostRenderData(postRenderData);

	expect(attempts).toBe(3);
	if (persistedBody === null) {
		throw new Error('Expected progress to be persisted');
	}

	expect(JSON.parse(persistedBody).postRenderData).toEqual(postRenderData);
});
