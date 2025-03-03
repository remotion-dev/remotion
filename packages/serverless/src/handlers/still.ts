import type {EmittedArtifact, StillImageFormat} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';

import type {
	CloudProvider,
	OnStream,
	ProviderSpecifics,
	ReceivedArtifact,
	RenderMetadata,
	RenderStillFunctionResponsePayload,
	ServerlessPayload,
} from '@remotion/serverless-client';
import {
	artifactName,
	decompressInputProps,
	formatCostsInfo,
	getCredentialsFromOutName,
	getExpectedOutName,
	internalGetOrCreateBucket,
	overallProgressKey,
	serializeJSONWithDate,
	ServerlessRoutines,
	validateDownloadBehavior,
	validateOutname,
	validatePrivacy,
	VERSION,
} from '@remotion/serverless-client';
import fs from 'node:fs';
import path from 'node:path';
import {cleanupSerializedInputProps} from '../cleanup-serialized-input-props';
import {getTmpDirStateIfENoSp} from '../get-tmp-dir';
import {onDownloadsHelper} from '../on-downloads-helpers';
import {makeInitialOverallRenderProgress} from '../overall-render-progress';
import type {InsideFunctionSpecifics} from '../provider-implementation';
import {validateComposition} from '../validate-composition';
import {checkVersionMismatch} from './check-version-mismatch';
import {sendTelemetryEvent} from './send-telemetry-event';

type Options<Provider extends CloudProvider> = {
	params: ServerlessPayload<Provider>;
	renderId: string;
	expectedBucketOwner: string;
	onStream: OnStream<Provider>;
	timeoutInMilliseconds: number;
	providerSpecifics: ProviderSpecifics<Provider>;
	insideFunctionSpecifics: InsideFunctionSpecifics<Provider>;
};

const innerStillHandler = async <Provider extends CloudProvider>(
	{
		params,
		expectedBucketOwner,
		renderId,
		onStream,
		timeoutInMilliseconds,
		providerSpecifics,
		insideFunctionSpecifics,
	}: Options<Provider>,
	cleanup: CleanupFn[],
) => {
	if (params.type !== ServerlessRoutines.still) {
		throw new TypeError('Expected still type');
	}

	checkVersionMismatch({
		apiName: 'renderStillOnLambda()',
		insideFunctionSpecifics,
		params,
	});

	validateDownloadBehavior(params.downloadBehavior);
	validatePrivacy(params.privacy, true);
	validateOutname({
		outName: params.outName,
		codec: null,
		audioCodecSetting: null,
		separateAudioTo: null,
		bucketNamePrefix: providerSpecifics.getBucketPrefix(),
	});

	const start = Date.now();

	const browserInstancePromise = insideFunctionSpecifics.getBrowserInstance({
		logLevel: params.logLevel,
		indent: false,
		chromiumOptions: params.chromiumOptions,
		providerSpecifics,
		insideFunctionSpecifics,
	});

	browserInstancePromise.then((instance) => {
		cleanup.push(() => {
			insideFunctionSpecifics.forgetBrowserEventLoop({
				logLevel:
					params.type === ServerlessRoutines.still ? params.logLevel : 'error',
				launchedBrowser: instance,
			});

			return Promise.resolve();
		});
	});

	const bucketNamePromise =
		params.bucketName ??
		internalGetOrCreateBucket({
			region: insideFunctionSpecifics.getCurrentRegionInFunction(),
			enableFolderExpiry: null,
			customCredentials: null,
			providerSpecifics,
			forcePathStyle: params.forcePathStyle,
			skipPutAcl: false,
		}).then((b) => b.bucketName);

	const outputDir = RenderInternals.tmpDir('remotion-render-');

	const outputPath = path.join(outputDir, 'output');

	const region = insideFunctionSpecifics.getCurrentRegionInFunction();
	const bucketName = await bucketNamePromise;
	const serializedInputPropsWithCustomSchema = await decompressInputProps({
		bucketName,
		expectedBucketOwner,
		region,
		serialized: params.inputProps,
		propsType: 'input-props',
		providerSpecifics,
		forcePathStyle: params.forcePathStyle,
	});

	const serveUrl = providerSpecifics.convertToServeUrl({
		urlOrId: params.serveUrl,
		region,
		bucketName,
	});

	const {server, cleanupServer} = await RenderInternals.makeOrReuseServer(
		undefined,
		{
			offthreadVideoThreads:
				params.offthreadVideoThreads ??
				RenderInternals.DEFAULT_RENDER_FRAMES_OFFTHREAD_VIDEO_THREADS,
			indent: false,
			port: null,
			remotionRoot: process.cwd(),
			logLevel: params.logLevel,
			webpackConfigOrServeUrl: serveUrl,
			offthreadVideoCacheSizeInBytes: params.offthreadVideoCacheSizeInBytes,
			binariesDirectory: null,
			forceIPv4: false,
		},
		{
			onDownload: () => undefined,
		},
	);

	cleanup.push(() => cleanupServer(true));

	const browserInstance = await browserInstancePromise;
	const composition = await validateComposition({
		serveUrl,
		browserInstance: browserInstance.instance,
		composition: params.composition,
		serializedInputPropsWithCustomSchema,
		envVariables: params.envVariables ?? {},
		chromiumOptions: params.chromiumOptions,
		timeoutInMilliseconds: params.timeoutInMilliseconds,
		port: null,
		forceHeight: params.forceHeight,
		forceWidth: params.forceWidth,
		logLevel: params.logLevel,
		server,
		offthreadVideoCacheSizeInBytes: params.offthreadVideoCacheSizeInBytes,
		onBrowserDownload: () => {
			throw new Error('Should not download a browser in Lambda');
		},
		onServeUrlVisited: () => undefined,
		providerSpecifics,
		offthreadVideoThreads: params.offthreadVideoThreads,
	});

	const renderMetadata: RenderMetadata<Provider> = {
		startedDate: Date.now(),
		codec: null,
		compositionId: params.composition,
		estimatedTotalLambdaInvokations: 1,
		estimatedRenderLambdaInvokations: 1,
		siteId: serveUrl,
		totalChunks: 1,
		type: 'still',
		imageFormat: params.imageFormat,
		inputProps: params.inputProps,
		lambdaVersion: VERSION,
		framesPerLambda: 1,
		memorySizeInMb: insideFunctionSpecifics.getCurrentMemorySizeInMb(),
		region: insideFunctionSpecifics.getCurrentRegionInFunction(),
		renderId,
		outName: params.outName ?? undefined,
		privacy: params.privacy,
		audioCodec: null,
		deleteAfter: params.deleteAfter,
		numberOfGifLoops: null,
		downloadBehavior: params.downloadBehavior,
		audioBitrate: null,
		metadata: null,
		functionName: insideFunctionSpecifics.getCurrentFunctionName(),
		rendererFunctionName: insideFunctionSpecifics.getCurrentFunctionName(),
		dimensions: {
			height: composition.height * (params.scale ?? 1),
			width: composition.width * (params.scale ?? 1),
		},
	};

	const still = makeInitialOverallRenderProgress(timeoutInMilliseconds);
	still.renderMetadata = renderMetadata;

	await providerSpecifics.writeFile({
		bucketName,
		key: overallProgressKey(renderId),
		body: JSON.stringify(still),
		region: insideFunctionSpecifics.getCurrentRegionInFunction(),
		privacy: 'private',
		expectedBucketOwner,
		downloadBehavior: null,
		customCredentials: null,
		forcePathStyle: params.forcePathStyle,
	});

	const onBrowserDownload = () => {
		throw new Error('Should not download a browser in Lambda');
	};

	const receivedArtifact: ReceivedArtifact<Provider>[] = [];

	const {key, renderBucketName, customCredentials} = getExpectedOutName({
		renderMetadata,
		bucketName,
		customCredentials: getCredentialsFromOutName(params.outName),
		bucketNamePrefix: providerSpecifics.getBucketPrefix(),
	});

	const onArtifact = (artifact: EmittedArtifact): {alreadyExisted: boolean} => {
		if (receivedArtifact.find((a) => a.filename === artifact.filename)) {
			return {alreadyExisted: true};
		}

		const storageKey = artifactName(renderMetadata.renderId, artifact.filename);

		receivedArtifact.push(
			insideFunctionSpecifics.makeArtifactWithDetails({
				storageKey,
				artifact,
				region,
				renderBucketName,
			}),
		);

		const startTime = Date.now();
		RenderInternals.Log.info(
			{indent: false, logLevel: params.logLevel},
			'Writing artifact ' + artifact.filename + ' to S3',
		);
		providerSpecifics
			.writeFile({
				bucketName: renderBucketName,
				key: storageKey,
				body: artifact.content,
				region,
				privacy: params.privacy,
				expectedBucketOwner,
				downloadBehavior: params.downloadBehavior,
				customCredentials,
				forcePathStyle: params.forcePathStyle,
			})
			.then(() => {
				RenderInternals.Log.info(
					{indent: false, logLevel: params.logLevel},
					`Wrote artifact to S3 in ${Date.now() - startTime}ms`,
				);
			})
			.catch((err) => {
				RenderInternals.Log.error(
					{indent: false, logLevel: params.logLevel},
					'Failed to write artifact to S3',
					err,
				);
			});
		return {alreadyExisted: false};
	};

	await RenderInternals.internalRenderStill({
		composition,
		output: outputPath,
		serveUrl,
		envVariables: params.envVariables ?? {},
		frame: RenderInternals.convertToPositiveFrameIndex({
			frame: params.frame,
			durationInFrames: composition.durationInFrames,
		}),
		imageFormat: params.imageFormat as StillImageFormat,
		serializedInputPropsWithCustomSchema,
		overwrite: false,
		puppeteerInstance: browserInstance.instance,
		jpegQuality: params.jpegQuality ?? RenderInternals.DEFAULT_JPEG_QUALITY,
		chromiumOptions: params.chromiumOptions,
		scale: params.scale,
		timeoutInMilliseconds: params.timeoutInMilliseconds,
		browserExecutable: providerSpecifics.getChromiumPath(),
		cancelSignal: null,
		indent: false,
		onBrowserLog: null,
		onDownload: onDownloadsHelper(params.logLevel),
		port: null,
		server,
		logLevel: params.logLevel,
		serializedResolvedPropsWithCustomSchema: serializeJSONWithDate({
			indent: undefined,
			staticBase: null,
			data: composition.props,
		}).serializedString,
		offthreadVideoCacheSizeInBytes: params.offthreadVideoCacheSizeInBytes,
		binariesDirectory: null,
		onBrowserDownload,
		onArtifact,
		chromeMode: 'headless-shell',
		offthreadVideoThreads: params.offthreadVideoThreads,
	});

	const {size} = await fs.promises.stat(outputPath);

	await providerSpecifics.writeFile({
		bucketName: renderBucketName,
		key,
		privacy: params.privacy,
		body: fs.createReadStream(outputPath),
		expectedBucketOwner,
		region: insideFunctionSpecifics.getCurrentRegionInFunction(),
		downloadBehavior: params.downloadBehavior,
		customCredentials,
		forcePathStyle: params.forcePathStyle,
	});

	await Promise.all([
		fs.promises.rm(outputPath, {recursive: true}),
		cleanupSerializedInputProps({
			region: insideFunctionSpecifics.getCurrentRegionInFunction(),
			serialized: params.inputProps,
			providerSpecifics,
			forcePathStyle: params.forcePathStyle,
		}),
		server.closeServer(true),
		sendTelemetryEvent(params.apiKey, params.logLevel),
	]);

	const estimatedPrice = providerSpecifics.estimatePrice({
		durationInMilliseconds: Date.now() - start + 100,
		memorySizeInMb: insideFunctionSpecifics.getCurrentMemorySizeInMb(),
		region: insideFunctionSpecifics.getCurrentRegionInFunction(),
		lambdasInvoked: 1,
		diskSizeInMb: providerSpecifics.getEphemeralStorageForPriceCalculation(),
	});

	const {key: outKey, url} = providerSpecifics.getOutputUrl({
		renderMetadata,
		bucketName,
		customCredentials,
		currentRegion: insideFunctionSpecifics.getCurrentRegionInFunction(),
	});

	const payload: RenderStillFunctionResponsePayload<Provider> = {
		type: 'success' as const,
		output: url,
		size,
		sizeInBytes: size,
		bucketName,
		estimatedPrice: formatCostsInfo(estimatedPrice),
		renderId,
		outKey,
		receivedArtifacts: receivedArtifact,
	};

	onStream({
		type: 'still-rendered',
		payload,
	});

	await server.closeServer(true);
};

type CleanupFn = () => Promise<unknown>;

export const stillHandler = async <Provider extends CloudProvider>(
	options: Options<Provider>,
): Promise<
	| {
			type: 'success';
	  }
	| {
			type: 'error';
			message: string;
			stack: string;
	  }
> => {
	const {params} = options;

	const cleanUpFn: CleanupFn[] = [];

	if (params.type !== ServerlessRoutines.still) {
		throw new Error('Params must be renderer');
	}

	try {
		await innerStillHandler(options, cleanUpFn);
		return {type: 'success'};
	} catch (err) {
		// If this error is encountered, we can just retry as it
		// is a very rare error to occur
		const isBrowserError = options.providerSpecifics.isFlakyError(err as Error);
		const willRetry = isBrowserError || params.maxRetries > 0;

		RenderInternals.Log.error(
			{
				indent: false,
				logLevel: params.logLevel,
			},
			'Got error:',
			(err as Error).stack,
			`Will retry = ${willRetry}`,
		);

		if (params.streamed) {
			await options.onStream({
				type: 'error-occurred',
				payload: {
					error: (err as Error).stack as string,
					shouldRetry: willRetry,
					errorInfo: {
						name: (err as Error).name as string,
						message: (err as Error).message as string,
						stack: (err as Error).stack as string,
						chunk: null,
						frame: params.frame,
						type: 'renderer',
						isFatal: false,
						tmpDir: getTmpDirStateIfENoSp(
							(err as Error).stack as string,
							options.insideFunctionSpecifics,
						),
						attempt: params.attempt,
						totalAttempts: 1 + params.maxRetries,
						willRetry,
					},
				},
			});
		}

		return {
			type: 'error',
			message: (err as Error).message,
			stack: (err as Error).stack as string,
		};
	} finally {
		cleanUpFn.forEach((c) => c());
	}
};
