import {expect, test} from 'bun:test';
import {Readable} from 'node:stream';
import {overallProgressKey} from '../constants';
import {getExpectedOutName} from '../expected-out-name';
import type {OverallRenderProgress} from '../overall-render-progress';
import {getProgress} from '../progress';
import type {
	EstimatePriceInput,
	ProviderSpecifics,
} from '../provider-implementation';
import type {RenderMetadata} from '../render-metadata';
import type {CloudProvider} from '../types';

type MockProvider = CloudProvider<
	'eu-central-1',
	{s3Key: string; s3Url: string},
	{},
	'standard',
	{}
>;

const renderId = 'test-render';
const bucketName = 'source-bucket';
const startedDate = Date.now() - 30000;

const renderMetadata: RenderMetadata<MockProvider> = {
	audioBitrate: null,
	audioCodec: null,
	codec: 'h264',
	compositionId: 'comp',
	deleteAfter: null,
	dimensions: {
		height: 1080,
		width: 1920,
	},
	downloadBehavior: {type: 'play-in-browser'},
	estimatedRenderLambdaInvokations: 2,
	estimatedTotalLambdaInvokations: 3,
	everyNthFrame: 1,
	frameRange: [0, 19],
	framesPerLambda: 10,
	functionName: 'remotion-render-4-0-0-mem2048mb-disk512mb-120sec',
	imageFormat: 'png',
	inputProps: {
		type: 'payload',
		payload: '{}',
	},
	lambdaVersion: '4.0.0',
	memorySizeInMb: 2048,
	metadata: null,
	muted: true,
	numberOfGifLoops: null,
	outName: {
		bucketName: 'output-bucket',
		key: 'custom-output.mp4',
	},
	privacy: 'private',
	region: 'eu-central-1',
	rendererFunctionName: 'remotion-render-4-0-0-mem2048mb-disk512mb-120sec',
	renderId,
	scale: 1,
	siteId: 'site',
	startedDate,
	totalChunks: 2,
	type: 'video',
};

const progress: OverallRenderProgress<MockProvider> = {
	chunks: [0, 1],
	combinedFrames: 20,
	compositionValidated: startedDate + 2,
	errors: [],
	fatalErrorTimestamp: null,
	framesEncoded: 20,
	framesRendered: 20,
	functionLaunched: startedDate,
	lambdasInvoked: 2,
	postRenderData: null,
	receivedArtifact: [],
	renderMetadata,
	retries: [],
	serveUrlOpened: startedDate + 1,
	timeToCombine: 500,
	timeToEncode: 1000,
	timeToRenderFrames: 750,
	timeoutTimestamp: startedDate + 120000,
	timings: [
		{chunk: 0, start: startedDate, rendered: startedDate + 100},
		{chunk: 1, start: startedDate + 100, rendered: startedDate + 250},
	],
};

const makeProviderSpecifics = ({
	onEstimatePrice,
	onHeadFile,
}: {
	onEstimatePrice?: (input: EstimatePriceInput<MockProvider>) => number;
	onHeadFile: ProviderSpecifics<MockProvider>['headFile'];
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
		estimatePrice: (input) => onEstimatePrice?.(input) ?? 0.01,
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
		getOutputUrl: ({
			renderMetadata: metadata,
			customCredentials,
			currentRegion,
		}) => {
			const {key, renderBucketName} = getExpectedOutName({
				renderMetadata: metadata,
				bucketName,
				customCredentials,
				bucketNamePrefix: 'remotionlambda-',
			});
			return {
				key,
				url: `https://s3.${currentRegion}.amazonaws.com/${renderBucketName}/${key}`,
			};
		},
		isFlakyError: () => false,
		listObjects: () => Promise.resolve([]),
		parseFunctionName: () => ({
			diskSizeInMb: 512,
			memorySizeInMb: 2048,
			timeoutInSeconds: 120,
			version: '4.0.0',
		}),
		printLoggingHelper: false,
		randomHash: () => 'hash',
		readFile: ({key}) => {
			expect(key).toBe(overallProgressKey(renderId));
			return Promise.resolve(
				Readable.from([Buffer.from(JSON.stringify(progress))]),
			);
		},
		serverStorageProductName: () => 'S3',
		validateDeleteAfter: () => undefined,
		writeFile: () => Promise.resolve(),
		headFile: onHeadFile,
	};
};

test('getProgress treats an existing output file as finished if postRenderData was not persisted', async () => {
	const headedFiles: {bucketName: string; key: string}[] = [];
	const providerSpecifics = makeProviderSpecifics({
		onHeadFile: ({bucketName: headedBucketName, key}) => {
			headedFiles.push({bucketName: headedBucketName, key});
			return Promise.resolve({ContentLength: 1234});
		},
	});

	const renderProgress = await getProgress({
		bucketName,
		customCredentials: null,
		expectedBucketOwner: null,
		forcePathStyle: false,
		functionName: renderMetadata.functionName,
		memorySizeInMb: 2048,
		providerSpecifics,
		region: 'eu-central-1',
		renderId,
		requestHandler: null,
		timeoutInMilliseconds: 1000,
	});

	expect(headedFiles).toEqual([
		{bucketName: 'output-bucket', key: 'custom-output.mp4'},
	]);
	expect(renderProgress.done).toBe(true);
	expect(renderProgress.outputFile).toBe(
		'https://s3.eu-central-1.amazonaws.com/output-bucket/custom-output.mp4',
	);
	expect(renderProgress.outputSizeInBytes).toBe(1234);
	expect(renderProgress.errors).toEqual([]);
});

test('getProgress estimates costs from invoked lambdas only', async () => {
	const priceInputs: EstimatePriceInput<MockProvider>[] = [];
	const originalTimings = progress.timings;
	const originalChunks = progress.chunks;
	const originalLambdasInvoked = progress.lambdasInvoked;

	try {
		progress.timings = [];
		progress.chunks = [];
		progress.lambdasInvoked = 1;

		const providerSpecifics = makeProviderSpecifics({
			onEstimatePrice: (input) => {
				priceInputs.push(input);
				return input.durationInMilliseconds;
			},
			onHeadFile: () => Promise.resolve({ContentLength: 0}),
		});

		const renderProgress = await getProgress({
			bucketName,
			customCredentials: null,
			expectedBucketOwner: null,
			forcePathStyle: false,
			functionName: renderMetadata.functionName,
			memorySizeInMb: 2048,
			providerSpecifics,
			region: 'eu-central-1',
			renderId,
			requestHandler: null,
			timeoutInMilliseconds: 120000,
		});

		expect(priceInputs).toHaveLength(1);
		expect(priceInputs[0].lambdasInvoked).toBe(1);
		expect(renderProgress.estimatedBillingDurationInMilliseconds).toBeLessThan(
			60000,
		);
	} finally {
		progress.timings = originalTimings;
		progress.chunks = originalChunks;
		progress.lambdasInvoked = originalLambdasInvoked;
	}
});
