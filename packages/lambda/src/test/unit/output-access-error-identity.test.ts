import {expect, mock, spyOn, test} from 'bun:test';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import os from 'node:os';
import path from 'node:path';
import {Readable} from 'node:stream';
import type * as LambdaClientPackage from '@remotion/lambda-client';
import type {AwsProvider} from '@remotion/lambda-client';
import type * as RendererPackage from '@remotion/renderer';
import type * as ServerlessPackage from '@remotion/serverless';
import type {
	InsideFunctionSpecifics,
	OverallRenderProgress,
	ProviderSpecifics,
	RenderMetadata,
	ServerlessPayloads,
} from '@remotion/serverless';

// Use the shipped CommonJS entrypoints, not source aliases. lambda-client
// bundles its own serverless-client, while the handlers load another copy.
const requirePackage = createRequire(__filename);
const {LambdaClientInternals} = requirePackage(
	'@remotion/lambda-client',
) as typeof LambdaClientPackage;
const {RenderInternals} = requirePackage(
	'@remotion/renderer',
) as typeof RendererPackage;
const {
	launchHandler,
	progressHandler,
	OutputFileAccessDeniedError,
	ServerlessRoutines,
	VERSION,
} = requirePackage('@remotion/serverless') as typeof ServerlessPackage;
const directRenderer = requirePackage(
	path.join(
		path.dirname(requirePackage.resolve('@remotion/serverless')),
		'render-with-single-function.js',
	),
);

const region = 'us-east-1';
const renderId = 'output-access-test';
const bucketName = 'render-bucket';
const destination = 'output-bucket';
const params: ServerlessPayloads<AwsProvider>['launch'] = {
	type: ServerlessRoutines.launch,
	output: {type: 'media'},
	composition: 'comp',
	serveUrl: 'https://example.com',
	bucketName,
	renderId,
	codec: 'h264',
	audioCodec: null,
	imageFormat: 'png',
	inputProps: {type: 'payload', payload: '{}'},
	outName: {bucketName: destination, key: 'output.mp4'},
	separateAudioTo: null,
	concurrency: 1,
	framesPerFunction: null,
	concurrencyPerFunction: 1,
	frameRange: null,
	everyNthFrame: 1,
	scale: 1,
	privacy: 'no-acl',
	logLevel: 'error',
	timeoutInMilliseconds: 30000,
	overwrite: false,
	muted: true,
	enableCancellation: false,
	rendererFunctionName: null,
	crf: null,
	envVariables: {},
	pixelFormat: null,
	proResProfile: null,
	x264Preset: null,
	gopSize: null,
	disableSharedMemoryCapture: false,
	jpegQuality: 80,
	maxRetries: 0,
	chromiumOptions: {},
	numberOfGifLoops: null,
	downloadBehavior: {type: 'play-in-browser'},
	audioBitrate: null,
	videoBitrate: null,
	encodingMaxRate: null,
	encodingBufferSize: null,
	webhook: null,
	forceHeight: null,
	forceWidth: null,
	forceFps: null,
	forceDurationInFrames: null,
	offthreadVideoCacheSizeInBytes: null,
	offthreadVideoThreads: null,
	mediaCacheSizeInBytes: null,
	deleteAfter: null,
	colorSpace: null,
	preferLossless: false,
	forcePathStyle: false,
	metadata: null,
	licenseKey: null,
	storageClass: null,
	isProduction: false,
	sampleRate: 48000,
};

const insideFunctionSpecifics = {
	getCurrentRegionInFunction: () => region,
	getCurrentMemorySizeInMb: () => 2048,
	getCurrentFunctionName: () => 'render-worker',
	getBrowserInstance: () => Promise.resolve({instance: {}}),
	forgetBrowserEventLoop: () => undefined,
	timer: () => ({end: () => undefined}),
	normalizeChromiumOptions: null,
} as unknown as InsideFunctionSpecifics<AwsProvider>;

const makeFixture = (headError: unknown) => {
	let storedProgress: OverallRenderProgress<AwsProvider> | null = null;
	let output: Buffer | null = null;
	const conflict = new Error('Output already exists');
	const writeFileIfNotExists = mock(async ({body}: {body: unknown}) => {
		if (output !== null) {
			throw conflict;
		}

		const chunks: Uint8Array[] = [];
		for await (const chunk of body as Readable) {
			chunks.push(Uint8Array.from(chunk));
		}

		output = Buffer.concat(chunks);
	});
	const headFile = mock(() => Promise.reject(headError));
	const writeFile = mock(
		async ({body, bucketName: target}: {body: unknown; bucketName: string}) => {
			if (target === destination) {
				const chunks: Uint8Array[] = [];
				for await (const chunk of body as Readable) {
					chunks.push(Uint8Array.from(chunk));
				}

				output = Buffer.concat(chunks);
				return;
			}

			storedProgress = JSON.parse(body as string);
		},
	);
	const providerSpecifics: ProviderSpecifics<AwsProvider> = {
		...LambdaClientInternals.awsImplementation,
		headFile,
		writeFile,
		writeFileIfNotExists,
		supportsConditionalOutput: () => true,
		readFile: () =>
			Promise.resolve(
				Readable.from([Buffer.from(JSON.stringify(storedProgress))]),
			),
		getChromiumPath: () => null,
		estimatePrice: () => 0,
		parseFunctionName: () => null,
		getEphemeralStorageForPriceCalculation: () => 512,
		getBillingCurrency: () => 'USD',
	} satisfies ProviderSpecifics<AwsProvider>;
	return {
		providerSpecifics,
		headFile,
		writeFile,
		writeFileIfNotExists,
		conflict,
		getOutput: () => output,
		getProgress: () => storedProgress!,
		setProgress: (progress: OverallRenderProgress<AwsProvider>) => {
			storedProgress = progress;
		},
	};
};

const getBundledHeadError = async (httpStatusCode: number) => {
	const previousFlag = process.env.REMOTION_SKIP_AWS_CREDENTIALS_CHECK;
	process.env.REMOTION_SKIP_AWS_CREDENTIALS_CHECK = '1';
	const input = {
		region,
		customCredentials: null,
		forcePathStyle: false,
		requestHandler: null,
	} as const;
	const client = LambdaClientInternals.getS3Client(input);
	const sdkError = Object.assign(new Error('Storage request failed'), {
		$metadata: {httpStatusCode},
	});
	const send = spyOn(client, 'send').mockImplementation(() =>
		Promise.reject(sdkError),
	);
	try {
		await LambdaClientInternals.awsImplementation.headFile({
			...input,
			bucketName: destination,
			key: 'output.mp4',
		});
		throw new Error('Expected HEAD to reject');
	} catch (err) {
		expect(send).toHaveBeenCalledTimes(1);
		if (httpStatusCode === 403) {
			expect((err as Error).cause).toBe(sdkError);
		} else {
			expect(err).toBe(sdkError);
		}

		return err;
	} finally {
		send.mockRestore();
		if (previousFlag === undefined) {
			delete process.env.REMOTION_SKIP_AWS_CREDENTIALS_CHECK;
		} else {
			process.env.REMOTION_SKIP_AWS_CREDENTIALS_CHECK = previousFlag;
		}
	}
};

const invokeLaunch = (
	fixture: ReturnType<typeof makeFixture>,
	overwrite = false,
) =>
	launchHandler({
		params: {...params, overwrite},
		providerSpecifics: fixture.providerSpecifics,
		insideFunctionSpecifics,
		options: {
			expectedBucketOwner: null,
			getRemainingTimeInMillis: () => 120000,
			requestContext: {
				requestId: 'test',
				expectedBucketOwner: null,
				getRemainingTimeInMillis: () => 120000,
			},
		},
	});

const completedProgress = (): OverallRenderProgress<AwsProvider> => {
	const startedDate = Date.now() - 30000;
	const renderMetadata: RenderMetadata<AwsProvider> = {
		type: 'video',
		imageFormat: 'png',
		muted: true,
		codec: 'h264',
		frameRange: [0, 19],
		everyNthFrame: 1,
		siteId: params.serveUrl,
		startedDate,
		totalChunks: 1,
		estimatedTotalLambdaInvokations: 2,
		estimatedRenderLambdaInvokations: 1,
		compositionId: 'comp',
		audioCodec: null,
		inputProps: params.inputProps,
		framesPerLambda: 20,
		memorySizeInMb: 2048,
		functionName: 'render-worker',
		rendererFunctionName: 'render-worker',
		lambdaVersion: VERSION,
		region,
		renderId,
		outName: params.outName!,
		separateAudioTo: null,
		outputFileIsConditional: true,
		separateAudioOutputFileIsConditional: null,
		privacy: 'no-acl',
		deleteAfter: null,
		numberOfGifLoops: null,
		audioBitrate: null,
		downloadBehavior: params.downloadBehavior,
		metadata: null,
		dimensions: {width: 100, height: 100},
		scale: 1,
	};
	return {
		cancellationEnabled: false,
		chunks: [0],
		framesRendered: 20,
		framesEncoded: 20,
		framesUploaded: 0,
		uploadedSizeInBytes: 0,
		combinedFrames: 20,
		timeToCombine: 100,
		timeToEncode: 100,
		lambdasInvoked: 1,
		retries: [],
		postRenderData: null,
		separateAudio: null,
		timings: [{chunk: 0, start: startedDate, rendered: startedDate + 100}],
		renderMetadata,
		errors: [],
		fatalErrorTimestamp: null,
		timeToRenderFrames: 100,
		timeoutTimestamp: startedDate + 120000,
		functionLaunched: startedDate,
		serveUrlOpened: startedDate + 1,
		compositionValidated: startedDate + 2,
		receivedArtifact: [],
	};
};

const invokeProgress = (
	fixture: ReturnType<typeof makeFixture>,
	timeoutInMilliseconds = 120000,
) =>
	progressHandler({
		params: {
			type: ServerlessRoutines.status,
			bucketName,
			renderId,
			version: VERSION,
			logLevel: 'error',
			forcePathStyle: false,
			s3OutputProvider: null,
		},
		options: {
			expectedBucketOwner: null,
			timeoutInMilliseconds,
			retriesRemaining: 0,
			providerSpecifics: fixture.providerSpecifics,
			insideFunctionSpecifics,
		},
	});

test.each(['bundled', 'same package'] as const)(
	'packaged launch accepts %s access errors and retains final overwrite protection',
	async (copy) => {
		const error =
			copy === 'bundled'
				? await getBundledHeadError(403)
				: new OutputFileAccessDeniedError('Denied');
		if (copy === 'bundled') {
			expect(Object.getPrototypeOf(error)).not.toBe(
				OutputFileAccessDeniedError.prototype,
			);
		}

		const fixture = makeFixture(error);
		const root = fs.mkdtempSync(path.join(os.tmpdir(), 'output-access-'));
		const timers: ReturnType<typeof setTimeout>[] = [];
		const originalTimeout = globalThis.setTimeout;
		const timeout = spyOn(globalThis, 'setTimeout').mockImplementation(((
			...args: Parameters<typeof setTimeout>
		) => {
			const timer = originalTimeout(...args);
			timers.push(timer);
			return timer;
		}) as typeof setTimeout);
		const select = spyOn(
			RenderInternals,
			'internalSelectComposition',
		).mockResolvedValue({
			metadata: {
				id: 'comp',
				width: 100,
				height: 100,
				fps: 30,
				durationInFrames: 20,
				props: {},
			},
		} as never);
		// Replace only the picture renderer. The packaged launch preflight,
		// metadata, finishRender and conditional upload selection stay real.
		const render = spyOn(
			directRenderer,
			'renderWithSingleFunction',
		).mockImplementation(
			({
				overallProgress,
			}: {
				overallProgress: {
					setFrames: (input: {
						index: number;
						rendered: number;
						encoded: number;
					}) => void;
					addChunkCompleted: (
						chunk: number,
						start: number,
						rendered: number,
					) => void;
					setCombinedFrames: (frames: number) => void;
				};
			}) => {
				const file = path.join(root, 'output.mp4');
				fs.writeFileSync(file, 'rendered output');
				overallProgress.setFrames({index: 0, rendered: 20, encoded: 20});
				overallProgress.addChunkCompleted(0, Date.now(), Date.now());
				overallProgress.setCombinedFrames(20);
				return Promise.resolve({
					outputFile: file,
					separateAudioFile: null,
					cleanup: () => Promise.resolve(),
				});
			},
		);
		try {
			await invokeLaunch(fixture);
			expect(fixture.writeFileIfNotExists).toHaveBeenCalledTimes(1);
			expect(fixture.getOutput()!.toString()).toBe('rendered output');
			expect(fixture.getProgress().postRenderData).not.toBeNull();
			expect(
				fixture.getProgress().renderMetadata!.outputFileIsConditional,
			).toBe(true);
			await expect(invokeLaunch(fixture)).rejects.toBe(fixture.conflict);
			expect(fixture.writeFileIfNotExists).toHaveBeenCalledTimes(2);
			expect(fixture.getOutput()!.toString()).toBe('rendered output');
			expect(
				fixture.writeFile.mock.calls.every(
					([input]) => input.bucketName === bucketName,
				),
			).toBe(true);

			for (const conditionalSupport of [false, true]) {
				const unsupported = makeFixture(error);
				unsupported.providerSpecifics.supportsConditionalOutput = () =>
					conditionalSupport;
				if (conditionalSupport) {
					unsupported.providerSpecifics.writeFileIfNotExists = null;
				}

				await expect(invokeLaunch(unsupported)).rejects.toBe(error);
				expect(unsupported.writeFileIfNotExists).not.toHaveBeenCalled();
			}

			for (const unrelated of [
				await getBundledHeadError(500),
				Object.assign(new Error('Denied'), {
					name: 'OutputFileAccessDeniedError',
				}),
				Object.assign(new Error('Unnormalized denial'), {
					$metadata: {httpStatusCode: 403},
				}),
			]) {
				const failed = makeFixture(unrelated);
				await expect(invokeLaunch(failed)).rejects.toBe(unrelated);
				expect(failed.writeFileIfNotExists).not.toHaveBeenCalled();
			}

			const existing = makeFixture(error);
			existing.headFile.mockImplementation(
				() => Promise.resolve({ContentLength: 10}) as never,
			);
			await expect(invokeLaunch(existing)).rejects.toThrow('already exists');
			expect(existing.writeFileIfNotExists).not.toHaveBeenCalled();

			const overwrite = makeFixture(error);
			await invokeLaunch(overwrite, true);
			expect(overwrite.headFile).not.toHaveBeenCalled();
			expect(overwrite.writeFileIfNotExists).not.toHaveBeenCalled();
			expect(overwrite.getOutput()!.toString()).toBe('rendered output');
		} finally {
			select.mockRestore();
			render.mockRestore();
			timeout.mockRestore();
			timers.forEach(clearTimeout);
			fs.rmSync(root, {recursive: true, force: true});
		}
	},
);

test.each(['bundled', 'same package'] as const)(
	'packaged status falls back for %s access errors, including timed out recovery',
	async (copy) => {
		const fixture = makeFixture(
			copy === 'bundled'
				? await getBundledHeadError(403)
				: new OutputFileAccessDeniedError('Denied'),
		);
		fixture.setProgress(completedProgress());
		for (const timeout of [120000, 1000]) {
			const result = await invokeProgress(fixture, timeout);
			expect(result.done).toBe(false);
			expect(result.outputFile).toBeNull();
			expect(result.framesRendered).toBe(20);
			expect(result.fatalErrorEncountered).toBe(timeout === 1000);
		}

		expect(fixture.headFile).toHaveBeenCalledTimes(2);
	},
);

test('packaged status preserves unrelated storage failures and name-only lookalikes', async () => {
	for (const error of [
		await getBundledHeadError(500),
		Object.assign(new Error('Denied'), {name: 'OutputFileAccessDeniedError'}),
		{$metadata: {httpStatusCode: 403}},
	]) {
		const fixture = makeFixture(error);
		fixture.setProgress(completedProgress());
		await expect(invokeProgress(fixture)).rejects.toBe(error);
	}
});
