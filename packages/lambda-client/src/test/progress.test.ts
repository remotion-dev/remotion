import {afterEach, expect, spyOn, test} from 'bun:test';
import {Readable} from 'node:stream';
import type {HeadFile} from '../aws-operations';
import * as awsRegionMetadata from '../aws-region-metadata';
import * as estimatePriceModule from '../estimate-price';
import type {EstimatePriceInput} from '../estimate-price';
import {OutputFileAccessDeniedError} from '../find-output-file-in-bucket';
import * as headFile from '../head-file';
import type {OverallRenderProgress} from '../overall-render-progress';
import {getProgress} from '../progress';
import * as readFile from '../read-file';
import type {RenderMetadata} from '../render-metadata';
import {overallProgressKey} from '../shared-constants';

const renderId = 'test-render';
const bucketName = 'source-bucket';
const startedDate = Date.now() - 30000;

const renderMetadata: RenderMetadata = {
	separateAudioTo: null,
	separateAudioOutputFileIsConditional: null,
	outputFileIsConditional: null,
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

const progress: OverallRenderProgress = {
	separateAudio: null,
	cancellationEnabled: false,
	chunks: [0, 1],
	combinedFrames: 20,
	compositionValidated: startedDate + 2,
	errors: [],
	fatalErrorTimestamp: null,
	framesEncoded: 20,
	framesUploaded: 0,
	uploadedSizeInBytes: 0,
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

const spies: {mockRestore: () => void}[] = [];

afterEach(() => {
	spies.splice(0).forEach((spy) => spy.mockRestore());
});

const installFakes = ({
	onEstimatePrice = null,
	onHeadFile,
	billingCurrency = 'USD',
	renderProgress,
}: {
	onEstimatePrice?: ((input: EstimatePriceInput) => number) | null;
	onHeadFile: HeadFile;
	billingCurrency?: 'USD' | 'CNY';
	renderProgress: OverallRenderProgress | null;
}) => {
	spies.splice(0).forEach((spy) => spy.mockRestore());
	spies.push(
		spyOn(estimatePriceModule, 'estimatePrice').mockImplementation(
			(input) => onEstimatePrice?.(input) ?? 0.01,
		),
		spyOn(awsRegionMetadata, 'getBillingCurrency').mockImplementation(
			() => billingCurrency,
		),
		spyOn(readFile, 'lambdaReadFileImplementation').mockImplementation(
			({key}) => {
				expect(key).toBe(overallProgressKey(renderId));
				return Promise.resolve(
					Readable.from([
						Buffer.from(JSON.stringify(renderProgress ?? progress)),
					]),
				);
			},
		),
		spyOn(headFile, 'lambdaHeadFileImplementation').mockImplementation(
			onHeadFile,
		),
	);
};

test('getProgress treats an existing output file as finished if postRenderData was not persisted', async () => {
	const headedFiles: {bucketName: string; key: string}[] = [];
	installFakes({
		billingCurrency: 'CNY',
		onHeadFile: ({bucketName: headedBucketName, key}) => {
			headedFiles.push({bucketName: headedBucketName, key});
			return Promise.resolve({
				ContentLength: 1234,
				Metadata: {'remotion-render-id': renderId},
			});
		},
		renderProgress: null,
	});

	const renderProgress = await getProgress({
		bucketName,
		customCredentials: null,
		expectedBucketOwner: null,
		forcePathStyle: false,
		functionName: renderMetadata.functionName,
		memorySizeInMb: 2048,
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
	expect(renderProgress.costs.currency).toBe('CNY');
	expect(renderProgress.costs.displayCost).toBe('¥0.010');
});

test('getProgress estimates costs from invoked lambdas only', async () => {
	const priceInputs: EstimatePriceInput[] = [];
	const originalTimings = progress.timings;
	const originalChunks = progress.chunks;
	const originalLambdasInvoked = progress.lambdasInvoked;

	try {
		progress.timings = [];
		progress.chunks = [];
		progress.lambdasInvoked = 1;

		installFakes({
			onEstimatePrice: (input) => {
				priceInputs.push(input);
				if (!('durationInMilliseconds' in input)) {
					throw new Error('Expected durationInMilliseconds');
				}

				return input.durationInMilliseconds;
			},
			onHeadFile: () => Promise.resolve({ContentLength: 0}),
			renderProgress: null,
		});

		const renderProgress = await getProgress({
			bucketName,
			customCredentials: null,
			expectedBucketOwner: null,
			forcePathStyle: false,
			functionName: renderMetadata.functionName,
			memorySizeInMb: 2048,
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

test('getProgress keeps direct render progress finite', async () => {
	const directProgress: OverallRenderProgress = {
		...progress,
		chunks: [],
		combinedFrames: 0,
		framesEncoded: 0,
		framesUploaded: 0,
		uploadedSizeInBytes: 0,
		framesRendered: 0,
		lambdasInvoked: 0,
		renderMetadata: {
			...renderMetadata,
			estimatedRenderLambdaInvokations: 0,
			estimatedTotalLambdaInvokations: 1,
			totalChunks: 1,
		},
		timeToCombine: null,
	};
	installFakes({
		onHeadFile: () => Promise.reject(new Error('Unexpected headFile call')),
		renderProgress: directProgress,
	});

	for (const lambdasInvoked of [0, 1]) {
		directProgress.lambdasInvoked = lambdasInvoked;
		const renderProgress = await getProgress({
			bucketName,
			customCredentials: null,
			expectedBucketOwner: null,
			forcePathStyle: false,
			functionName: renderMetadata.functionName,
			memorySizeInMb: 2048,
			region: 'eu-central-1',
			renderId,
			requestHandler: null,
			timeoutInMilliseconds: 120000,
		});

		expect(renderProgress.done).toBe(false);
		expect(Number.isFinite(renderProgress.overallProgress)).toBe(true);
		expect(renderProgress.overallProgress).toBeGreaterThanOrEqual(0);
		expect(renderProgress.overallProgress).toBeLessThanOrEqual(1);
	}
});

test('getProgress falls back to persisted progress when destination reads are denied', async () => {
	let heads = 0;
	installFakes({
		renderProgress: null,
		onHeadFile: () => {
			heads++;
			return Promise.reject(
				new OutputFileAccessDeniedError('Destination read access denied'),
			);
		},
	});
	for (const timeoutInMilliseconds of [120000, 1000]) {
		const result = await getProgress({
			bucketName,
			renderId,
			customCredentials: null,
			expectedBucketOwner: null,
			forcePathStyle: false,
			functionName: renderMetadata.functionName,
			memorySizeInMb: 2048,
			region: 'eu-central-1',
			requestHandler: null,
			timeoutInMilliseconds,
		});
		expect(result.done).toBe(false);
		expect(result.framesRendered).toBe(20);
		expect(result.outputFile).toBeNull();
		expect(result.fatalErrorEncountered).toBe(timeoutInMilliseconds === 1000);
	}

	expect(heads).toBe(2);
});

test('getProgress preserves upload failures and unexpected storage errors', async () => {
	const uploadFailure = {
		type: 'stitcher' as const,
		message: 'Output already exists',
		name: 'Error',
		stack: '',
		frame: null,
		chunk: null,
		isFatal: true,
		attempt: 1,
		willRetry: false,
		totalAttempts: 1,
		tmpDir: null,
	};
	let heads = 0;
	const storageError = Object.assign(new Error('Storage unavailable'), {
		$metadata: {httpStatusCode: 500},
	});
	for (const errors of [[uploadFailure], []]) {
		installFakes({
			renderProgress: {...progress, errors},
			onHeadFile: () => {
				heads++;
				return Promise.reject(storageError);
			},
		});
		const pending = getProgress({
			bucketName,
			renderId,
			customCredentials: null,
			expectedBucketOwner: null,
			forcePathStyle: false,
			functionName: renderMetadata.functionName,
			memorySizeInMb: 2048,
			region: 'eu-central-1',
			requestHandler: null,
			timeoutInMilliseconds: 120000,
		});
		if (errors.length) {
			const result = await pending;
			expect(result.done).toBe(false);
			expect(result.fatalErrorEncountered).toBe(true);
			expect(result.errors[0].message).toBe('Output already exists');
		} else {
			await expect(pending).rejects.toBe(storageError);
		}
	}

	expect(heads).toBe(1);
});
