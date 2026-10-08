import {existsSync, mkdirSync, rmSync} from 'fs';
import {type EventEmitter} from 'node:events';
import {join} from 'path';
/* eslint-disable @typescript-eslint/no-use-before-define */
import type {LogOptions} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {validateCodec, VERSION} from '@remotion/serverless-client';
import type {
	CloudProvider,
	PostRenderData,
	ProviderSpecifics,
	RenderMetadata,
	ImageSequenceOutput,
	ImageSequenceManifest,
	RendererOutput,
	ServerlessPayload,
} from '@remotion/serverless-client';
import {
	artifactName,
	compressInputProps,
	CONCAT_FOLDER_TOKEN,
	decompressInputProps,
	DOCS_URL,
	getCredentialsFromOutName,
	getImageSequenceFrameKey,
	inspectErrors,
	rendersPrefix,
	getExpectedOutName,
	getNeedsToUpload,
	MAX_FUNCTIONS_PER_RENDER,
	OutputFileAccessDeniedError,
	rendererTransportPrefix,
	serializeOrThrow,
	ServerlessRoutines,
	validateFramesPerFunction,
	validateOutname,
	validatePrivacy,
	writeCancellationSignal,
} from '@remotion/serverless-client';
import {
	makeArtifactRegistry,
	type OnArtifactFromRenderer,
} from '../artifact-registry';
import {cleanupProps} from '../cleanup-props';
import {createPostRenderData} from '../create-post-render-data';
import {findOutputFileInBucket} from '../find-output-file-in-bucket';
import {finishRender} from '../finish-render';
import type {LaunchedBrowser} from '../get-browser-instance';
import {mergeChunksAndFinishRender} from '../merge-chunks';
import type {OverallProgressHelper} from '../overall-render-progress';
import {makeOverallRenderProgress} from '../overall-render-progress';
import {planFrameRanges} from '../plan-frame-ranges';
import type {InsideFunctionSpecifics} from '../provider-implementation';
import {removeOutnameCredentials} from '../remove-outname-credentials';
import {renderWithSingleFunction} from '../render-with-single-function';
import {renderRendererFunctionWithRetry} from '../stream-renderer';
import {validateComposition} from '../validate-composition';
import type {RequestContext} from './renderer';
import {sendTelemetryEvent} from './send-telemetry-event';

type Options = {
	expectedBucketOwner: string | null;
	getRemainingTimeInMillis: () => number;
	requestContext: RequestContext | null;
};

const innerLaunchHandler = async <Provider extends CloudProvider>({
	params,
	options,
	overallProgress,
	registerCleanupTask,
	providerSpecifics,
	insideFunctionSpecifics,
	onBrowser,
}: {
	params: ServerlessPayload<Provider>;
	options: Options;
	overallProgress: OverallProgressHelper<Provider>;
	registerCleanupTask: (cleanupTask: CleanupTask) => void;
	providerSpecifics: ProviderSpecifics<Provider>;
	insideFunctionSpecifics: InsideFunctionSpecifics<Provider>;
	onBrowser: (browser: LaunchedBrowser) => void;
}): Promise<PostRenderData<Provider>> => {
	if (params.type !== ServerlessRoutines.launch) {
		throw new Error('Expected launch type');
	}

	const startedDate = Date.now();

	const chromiumParams = insideFunctionSpecifics.normalizeChromiumOptions?.({
		chromiumOptions: params.chromiumOptions ?? {},
		logLevel: params.logLevel,
	}) ?? {...(params.chromiumOptions ?? {})};

	const browserInstance = insideFunctionSpecifics.getBrowserInstance({
		logLevel: params.logLevel,
		indent: false,
		chromiumOptions: chromiumParams,
		providerSpecifics,
		insideFunctionSpecifics,
	});

	browserInstance.then((b) => {
		onBrowser(b);
	});

	const inputPropsPromise = decompressInputProps({
		bucketName: params.bucketName,
		expectedBucketOwner: options.expectedBucketOwner,
		region: insideFunctionSpecifics.getCurrentRegionInFunction(),
		serialized: params.inputProps,
		propsType: 'input-props',
		providerSpecifics,
		forcePathStyle: params.forcePathStyle,
		requestHandler: null,
	});

	const logOptions: LogOptions = {
		indent: false,
		logLevel: params.logLevel,
	};
	const serializedInputPropsWithCustomSchema = await inputPropsPromise;

	RenderInternals.Log.info(
		logOptions,
		'Waiting for browser to be ready:',
		serializedInputPropsWithCustomSchema,
	);
	const {instance} = await browserInstance;
	RenderInternals.Log.info(
		logOptions,
		'Validating composition, input props:',
		serializedInputPropsWithCustomSchema,
	);
	const startTime = Date.now();
	let validateCompositionTimeout = params.timeoutInMilliseconds;
	const remainingTime = options.getRemainingTimeInMillis();
	if (remainingTime / 2 < params.timeoutInMilliseconds) {
		// delayRender() subtracts 2 seconds, must be positive
		validateCompositionTimeout = Math.max(3000, Math.round(remainingTime / 2));
		RenderInternals.Log.info(
			logOptions,
			`Lowering "timeoutInMilliseconds" to ${validateCompositionTimeout}ms (half the remaining function lifetime) so that any stuck processes will surface their errors`,
			validateCompositionTimeout,
		);
	}

	const comp = await validateComposition({
		serveUrl: params.serveUrl,
		composition: params.composition,
		browserInstance: instance,
		serializedInputPropsWithCustomSchema,
		envVariables: params.envVariables ?? {},
		timeoutInMilliseconds: validateCompositionTimeout,
		chromiumOptions: params.chromiumOptions ?? {},
		port: null,
		forceHeight: params.forceHeight,
		forceWidth: params.forceWidth,
		forceFps: params.forceFps ?? null,
		forceDurationInFrames: params.forceDurationInFrames ?? null,
		logLevel: params.logLevel,
		server: undefined,
		offthreadVideoCacheSizeInBytes: params.offthreadVideoCacheSizeInBytes,
		onBrowserDownload: () => {
			throw new Error('Should not download a browser in a function');
		},
		onServeUrlVisited: () => {
			overallProgress.setServeUrlOpened(Date.now());
		},
		providerSpecifics,
		offthreadVideoThreads: params.offthreadVideoThreads,
		mediaCacheSizeInBytes: params.mediaCacheSizeInBytes,
	});
	overallProgress.setCompositionValidated(Date.now());
	RenderInternals.Log.info(
		logOptions,
		'Composition validated, resolved props',
		comp.props,
	);

	RenderInternals.validateBitrate(params.audioBitrate, 'audioBitrate');
	RenderInternals.validateBitrate(params.videoBitrate, 'videoBitrate');

	RenderInternals.validateConcurrency({
		value: params.concurrencyPerFunction,
		setting: 'concurrencyPerLambda',
		checkIfValidForCurrentMachine:
			(params.rendererFunctionName ?? null) === null,
	});

	const realFrameRange = RenderInternals.getRealFrameRange(
		comp.durationInFrames,
		params.frameRange,
	);

	if (!Number.isInteger(params.everyNthFrame) || params.everyNthFrame < 1) {
		throw new Error('everyNthFrame must be a positive integer');
	}

	const frameCount = RenderInternals.getFramesToRender(
		realFrameRange,
		params.everyNthFrame,
	);

	let rendererOutput: RendererOutput<Provider> = {type: 'media'};
	let outputSequence: ImageSequenceOutput | null = null;
	let {outName} = params;
	if (params.output.type === 'sequence') {
		if (params.imageFormat !== 'png' && params.imageFormat !== 'jpeg') {
			throw new Error('Image sequences require imageFormat: "png" or "jpeg"');
		}

		const prefix = params.output.outputPrefix;
		const rawPrefix =
			typeof prefix === 'string'
				? prefix
				: (prefix?.keyPrefix ?? `${rendersPrefix(params.renderId)}/frames/`);
		if (
			rawPrefix.length === 0 ||
			rawPrefix.startsWith('/') ||
			rawPrefix
				.split('/')
				.some((segment) => segment === '.' || segment === '..') ||
			rawPrefix.includes('\\') ||
			Array.from(rawPrefix).some((character) => character.charCodeAt(0) < 32)
		) {
			throw new Error(
				'outputPrefix must be a non-empty relative storage prefix without path traversal',
			);
		}

		const keyPrefix = rawPrefix.replace(/\/+$/, '') + '/';
		const imageSequencePattern =
			params.output.imageSequencePattern ?? 'element-[frame].[ext]';
		if (
			!imageSequencePattern.includes('[frame]') ||
			imageSequencePattern.includes('/') ||
			imageSequencePattern.includes('\\') ||
			Array.from(imageSequencePattern).some(
				(character) => character.charCodeAt(0) < 32,
			)
		) {
			throw new Error(
				'imageSequencePattern must be a filename containing [frame]',
			);
		}

		const destinationBucketName =
			typeof prefix === 'object' && prefix !== null
				? prefix.bucketName
				: params.bucketName;
		const destinationCredentials =
			typeof prefix === 'object' && prefix !== null
				? (prefix.s3OutputProvider ?? null)
				: null;
		rendererOutput = {
			type: 'sequence',
			bucketName: destinationBucketName,
			keyPrefix,
			imageFormat: params.imageFormat,
			imageSequencePattern,
			framePadding: String(frameCount[frameCount.length - 1]).length,
			customCredentials: destinationCredentials,
			storageClass: params.storageClass,
			downloadBehavior: params.downloadBehavior,
		};
		const lastKey = getImageSequenceFrameKey({
			...rendererOutput,
			frame: frameCount[frameCount.length - 1],
		});
		if (
			!lastKey.endsWith(`.${params.imageFormat}`) ||
			Buffer.byteLength(lastKey) > 1024
		) {
			throw new Error(
				'imageSequencePattern must use the selected image format and produce storage keys of at most 1024 bytes',
			);
		}

		outName = {
			bucketName: destinationBucketName,
			key: `${keyPrefix}manifest.json`,
			s3OutputProvider: destinationCredentials ?? undefined,
		};
		outputSequence = {
			bucketName: destinationBucketName,
			keyPrefix,
			manifestKey: `${keyPrefix}manifest.json`,
			manifestUrl: '',
			imageFormat: params.imageFormat,
			frameCount: frameCount.length,
		};
	} else if (params.codec === null) {
		throw new Error('Media renders require a codec');
	}

	const framesPerLambda = validateFramesPerFunction({
		framesPerFunction: params.framesPerFunction,
		durationInFrames: frameCount.length,
		concurrency: params.concurrency,
	});

	validateOutname({
		outName,
		codec: params.codec,
		audioCodecSetting: params.audioCodec,
		separateAudioTo: null,
		bucketNamePrefix: providerSpecifics.getBucketPrefix(),
	});
	if (params.codec !== null) {
		validateCodec(params.codec, 'renderMediaOnLambda', 'codec');
	}

	validatePrivacy(params.privacy, true);
	RenderInternals.validatePuppeteerTimeout(params.timeoutInMilliseconds);

	const {chunks} = planFrameRanges({
		framesPerFunction: framesPerLambda,
		frameRange: realFrameRange,
		everyNthFrame: params.everyNthFrame,
	});

	if (chunks.length > MAX_FUNCTIONS_PER_RENDER) {
		throw new Error(
			`Too many functions: This render would cause ${chunks.length} functions to spawn. We limit this amount to ${MAX_FUNCTIONS_PER_RENDER} functions as more would result in diminishing returns. Values set: frameCount = ${frameCount.length}, framesPerLambda=${framesPerLambda}. See ${DOCS_URL}/docs/lambda/concurrency#too-many-functions for help.`,
		);
	}

	overallProgress.setExpectedChunks(chunks.length);

	const sortedChunks = chunks.slice().sort((a, b) => a[0] - b[0]);

	const serializedResolved = serializeOrThrow(comp.props, 'resolved-props');

	const needsToUpload = getNeedsToUpload({
		type: 'video-or-audio',
		sizes: [
			serializedResolved.length,
			params.inputProps.type === 'bucket-url'
				? params.inputProps.hash.length
				: params.inputProps.payload.length,
			JSON.stringify(params.envVariables).length,
		],
		providerSpecifics,
	});

	const serializedResolvedProps = await compressInputProps({
		propsType: 'resolved-props',
		region: insideFunctionSpecifics.getCurrentRegionInFunction(),
		stringifiedInputProps: serializedResolved,
		userSpecifiedBucketName: params.bucketName,
		needsToUpload,
		providerSpecifics,
		forcePathStyle: params.forcePathStyle,
		skipPutAcl: false,
		requestHandler: null,
		logLevel: params.logLevel,
	});

	registerCleanupTask(() => {
		return cleanupProps<Provider>({
			serializedResolvedProps,
			inputProps: params.inputProps,
			providerSpecifics,
			forcePathStyle: params.forcePathStyle,
			insideFunctionSpecifics,
		});
	});

	const fps = comp.fps / params.everyNthFrame;

	// If for 150 functions, we stream every frame, we DDos ourselves.
	// Throttling a bit, allowing more progress if there is lower concurrency.
	const progressEveryNthFrame = Math.ceil(chunks.length / 15);

	const lambdaPayloads = chunks.map((chunkPayload) => {
		const payload: ServerlessPayload<Provider> = {
			enableCancellation: params.enableCancellation ?? false,
			type: ServerlessRoutines.renderer,
			frameRange: chunkPayload,
			serveUrl: params.serveUrl,
			chunk: sortedChunks.indexOf(chunkPayload),
			composition: params.composition,
			fps: comp.fps,
			height: comp.height,
			width: comp.width,
			durationInFrames: comp.durationInFrames,
			bucketName: params.bucketName,
			retriesLeft: params.maxRetries,
			inputProps: params.inputProps,
			renderId: params.renderId,
			imageFormat: params.imageFormat,
			codec: params.codec,
			output: rendererOutput,
			crf: params.crf,
			envVariables: params.envVariables,
			pixelFormat: params.pixelFormat,
			proResProfile: params.proResProfile,
			x264Preset: params.x264Preset,
			gopSize: params.gopSize ?? null,
			disableSharedMemoryCapture: params.disableSharedMemoryCapture,
			jpegQuality: params.jpegQuality,
			privacy: params.privacy,
			logLevel: params.logLevel ?? 'info',
			attempt: 1,
			timeoutInMilliseconds: params.timeoutInMilliseconds,
			chromiumOptions: params.chromiumOptions ?? {},
			scale: params.scale,
			everyNthFrame: params.everyNthFrame,
			concurrencyPerLambda: params.concurrencyPerFunction,
			muted: params.muted,
			audioBitrate: params.audioBitrate,
			videoBitrate: params.videoBitrate,
			encodingMaxRate: params.encodingMaxRate,
			encodingBufferSize: params.encodingBufferSize,
			launchFunctionConfig: {
				version: VERSION,
			},
			resolvedProps: serializedResolvedProps,
			offthreadVideoCacheSizeInBytes: params.offthreadVideoCacheSizeInBytes,
			deleteAfter: params.deleteAfter,
			colorSpace: params.colorSpace,
			preferLossless: params.preferLossless,
			compositionStart: realFrameRange[0],
			framesPerLambda,
			progressEveryNthFrame,
			forcePathStyle: params.forcePathStyle,
			metadata: params.metadata,
			offthreadVideoThreads: params.offthreadVideoThreads,
			mediaCacheSizeInBytes: params.mediaCacheSizeInBytes,
			sampleRate: params.sampleRate,
		};
		return payload;
	});

	RenderInternals.Log.info(
		logOptions,
		'Render plan: ',
		chunks.map((c, i) => `Chunk ${i} (Frames ${c[0]} - ${c[1]})`).join(', '),
	);

	const rendererFunctionName =
		params.rendererFunctionName ??
		insideFunctionSpecifics.getCurrentFunctionName();
	const shouldRenderDirectly =
		rendererOutput.type === 'media' &&
		params.concurrency === 1 &&
		params.rendererFunctionName === null &&
		options.requestContext !== null;

	const renderMetadata: RenderMetadata<Provider> = {
		outputFileIsConditional:
			!params.overwrite &&
			providerSpecifics.supportsConditionalOutput({
				customCredentials: getCredentialsFromOutName(outName),
			}) &&
			providerSpecifics.writeFileIfNotExists !== null,
		startedDate,
		totalChunks: chunks.length,
		estimatedTotalLambdaInvokations: [
			shouldRenderDirectly ? 0 : chunks.length,
			// This function
			1,
		].reduce((a, b) => a + b, 0),
		estimatedRenderLambdaInvokations: shouldRenderDirectly ? 0 : chunks.length,
		compositionId: comp.id,
		siteId: params.serveUrl,
		...(rendererOutput.type === 'sequence' && outputSequence !== null
			? {
					type: 'sequence' as const,
					codec: null,
					imageFormat: outputSequence.imageFormat,
					muted: true as const,
					outputSequence,
					imageSequencePattern: rendererOutput.imageSequencePattern,
					framePadding: rendererOutput.framePadding,
				}
			: {
					type: 'video' as const,
					codec: params.codec as NonNullable<typeof params.codec>,
					imageFormat: params.imageFormat,
					muted: params.muted,
				}),
		inputProps: params.inputProps,
		lambdaVersion: VERSION,
		framesPerLambda,
		memorySizeInMb: insideFunctionSpecifics.getCurrentMemorySizeInMb(),
		region: insideFunctionSpecifics.getCurrentRegionInFunction(),
		renderId: params.renderId,
		outName: removeOutnameCredentials(outName ?? undefined),
		privacy: params.privacy,
		everyNthFrame: params.everyNthFrame,
		frameRange: realFrameRange,
		audioCodec: params.audioCodec,
		deleteAfter: params.deleteAfter,
		numberOfGifLoops: params.numberOfGifLoops,
		downloadBehavior: params.downloadBehavior,
		audioBitrate: params.audioBitrate,
		metadata: params.metadata,
		functionName: insideFunctionSpecifics.getCurrentFunctionName(),
		dimensions: {
			width: comp.width * (params.scale ?? 1),
			height: comp.height * (params.scale ?? 1),
		},
		rendererFunctionName:
			params.rendererFunctionName ??
			insideFunctionSpecifics.getCurrentFunctionName(),
		scale: params.scale,
	};

	const {key, renderBucketName, customCredentials} = getExpectedOutName({
		renderMetadata,
		bucketName: params.bucketName,
		customCredentials: getCredentialsFromOutName(outName),
		bucketNamePrefix: providerSpecifics.getBucketPrefix(),
	});

	if (outputSequence !== null) {
		outputSequence.manifestUrl = providerSpecifics.getOutputUrl({
			bucketName: params.bucketName,
			currentRegion: insideFunctionSpecifics.getCurrentRegionInFunction(),
			customCredentials,
			renderMetadata,
		}).url;
	}

	if (!params.overwrite) {
		const findOutputFile = insideFunctionSpecifics.timer(
			'Checking if output file already exists',
			params.logLevel,
		);
		const output = await findOutputFileInBucket({
			bucketName: params.bucketName,
			customCredentials,
			renderMetadata,
			region: insideFunctionSpecifics.getCurrentRegionInFunction(),
			currentRegion: insideFunctionSpecifics.getCurrentRegionInFunction(),
			providerSpecifics,
			forcePathStyle: params.forcePathStyle,
			requestHandler: null,
		}).catch((err) => {
			if (
				err instanceof OutputFileAccessDeniedError &&
				renderMetadata.outputFileIsConditional
			) {
				// The final conditional upload still enforces overwrite: false.
				return null;
			}

			throw err;
		});
		if (output) {
			throw new TypeError(
				`Output file "${key}" in bucket "${renderBucketName}" in region "${insideFunctionSpecifics.getCurrentRegionInFunction()}" already exists. Delete it before re-rendering, or set the 'overwrite' option in ${params.output.type === 'sequence' ? 'renderFramesOnLambda()' : 'renderMediaOnLambda()'} to overwrite it.`,
			);
		}

		findOutputFile.end();
	}

	if (rendererOutput.type === 'sequence') {
		const sequenceDestination = rendererOutput;
		const reservationKey = `${rendererOutput.keyPrefix}.remotion-render.json`;
		if (!params.overwrite) {
			const keys = [
				reservationKey,
				...(params.output.type === 'sequence' &&
				params.output.outputPrefix === null
					? []
					: frameCount.map((frame) =>
							getImageSequenceFrameKey({...sequenceDestination, frame}),
						)),
			];
			for (let index = 0; index < keys.length; index += 25) {
				await Promise.all(
					keys.slice(index, index + 25).map(async (frameKey) => {
						try {
							await providerSpecifics.headFile({
								bucketName: renderBucketName,
								key: frameKey,
								region: insideFunctionSpecifics.getCurrentRegionInFunction(),
								customCredentials,
								forcePathStyle: params.forcePathStyle,
								requestHandler: null,
							});
						} catch (err) {
							if (['NotFound', 'NoSuchKey'].includes((err as Error).name)) {
								return;
							}

							throw err;
						}

						throw new Error(
							`Image sequence output "${frameKey}" already exists. Set overwrite: true to replace it.`,
						);
					}),
				);
			}
		}

		const write =
			!params.overwrite &&
			providerSpecifics.supportsConditionalOutput({customCredentials}) &&
			providerSpecifics.writeFileIfNotExists !== null
				? providerSpecifics.writeFileIfNotExists
				: providerSpecifics.writeFile;
		await write({
			bucketName: renderBucketName,
			key: reservationKey,
			body: JSON.stringify({renderId: params.renderId}),
			region: insideFunctionSpecifics.getCurrentRegionInFunction(),
			privacy: params.privacy,
			expectedBucketOwner: options.expectedBucketOwner,
			downloadBehavior: null,
			customCredentials,
			forcePathStyle: params.forcePathStyle,
			storageClass: params.storageClass,
			requestHandler: null,
		});
		overallProgress.setRenderMetadata(renderMetadata);
		if (params.overwrite) {
			await providerSpecifics.deleteFile({
				bucketName: renderBucketName,
				key,
				region: insideFunctionSpecifics.getCurrentRegionInFunction(),
				customCredentials,
				forcePathStyle: params.forcePathStyle,
				requestHandler: null,
			});
		}
	} else {
		overallProgress.setRenderMetadata(renderMetadata);
	}

	const artifactRegistry = makeArtifactRegistry();
	const artifactUploads: Promise<void>[] = [];

	const onArtifact: OnArtifactFromRenderer = ({artifact, chunk, attempt}) => {
		const artifactRegistration = artifactRegistry.registerArtifact({
			chunk,
			frame: artifact.frame,
			attempt,
			filename: artifact.filename,
		});
		if (artifactRegistration.type !== 'accepted') {
			return artifactRegistration;
		}

		const region = insideFunctionSpecifics.getCurrentRegionInFunction();
		const storageKey = artifactName(renderMetadata.renderId, artifact.filename);

		const start = Date.now();
		RenderInternals.Log.info(
			{indent: false, logLevel: params.logLevel},
			'Writing artifact ' + artifact.filename + ' to S3',
		);
		const artifactUpload = providerSpecifics
			.writeFile({
				bucketName: renderBucketName,
				key: storageKey,
				body: artifact.content,
				region,
				privacy: params.privacy,
				expectedBucketOwner: options.expectedBucketOwner,
				downloadBehavior: artifact.downloadBehavior ?? params.downloadBehavior,
				customCredentials,
				forcePathStyle: params.forcePathStyle,
				storageClass: params.storageClass,
				requestHandler: null,
			})
			.then(() => {
				RenderInternals.Log.info(
					{indent: false, logLevel: params.logLevel},
					`Wrote artifact to S3 in ${Date.now() - start}ms`,
				);

				overallProgress.addReceivedArtifact(
					insideFunctionSpecifics.makeArtifactWithDetails({
						region,
						renderBucketName,
						storageKey,
						artifact,
					}),
				);
			})
			.catch((err) => {
				overallProgress.addErrorWithoutUpload({
					type: 'artifact',
					message: (err as Error).message,
					name: (err as Error).name as string,
					stack: (err as Error).stack as string,
					tmpDir: null,
					frame: artifact.frame,
					chunk,
					isFatal: false,
					attempt,
					willRetry: false,
					totalAttempts: 1,
				});
				overallProgress.upload('artifactWriteError');
				RenderInternals.Log.error(
					{indent: false, logLevel: params.logLevel},
					'Failed to write artifact to S3',
					err,
				);
			});
		artifactUploads.push(artifactUpload);
		return artifactRegistration;
	};

	let postRenderData: PostRenderData<Provider>;
	if (
		rendererOutput.type === 'sequence' &&
		renderMetadata.type === 'sequence'
	) {
		const sequenceDestination = rendererOutput;
		const outdir = RenderInternals.tmpDir(CONCAT_FOLDER_TOKEN);
		await Promise.all(
			lambdaPayloads.map((payload) =>
				renderRendererFunctionWithRetry({
					payload,
					files: [],
					functionName: rendererFunctionName,
					outdir,
					overallProgress,
					logLevel: params.logLevel,
					onArtifact,
					providerSpecifics,
					insideFunctionSpecifics,
					requestHandler: null,
					expectedBucketOwner: options.expectedBucketOwner,
				}),
			),
		);
		await Promise.all(artifactUploads);
		const progress = overallProgress.get();
		if (
			progress.framesUploaded !== frameCount.length ||
			progress.chunks.length !== chunks.length
		) {
			throw new Error(
				'Cannot finish the image sequence before every chunk has uploaded all its frames',
			);
		}

		const manifest: ImageSequenceManifest = {
			renderId: params.renderId,
			imageFormat: rendererOutput.imageFormat,
			width: renderMetadata.dimensions.width,
			height: renderMetadata.dimensions.height,
			fps: comp.fps,
			frameRange: realFrameRange,
			everyNthFrame: params.everyNthFrame,
			frames: frameCount.map((frame) => ({
				frame,
				key: getImageSequenceFrameKey({
					...sequenceDestination,
					frame,
				}),
			})),
		};
		const manifestBody = JSON.stringify(manifest);
		await providerSpecifics.writeFile({
			bucketName: renderBucketName,
			key,
			body: manifestBody,
			region: insideFunctionSpecifics.getCurrentRegionInFunction(),
			privacy: params.privacy,
			expectedBucketOwner: options.expectedBucketOwner,
			downloadBehavior: {type: 'play-in-browser'},
			customCredentials,
			forcePathStyle: params.forcePathStyle,
			storageClass: params.storageClass,
			requestHandler: null,
		});
		const cleanup = await cleanupProps({
			inputProps: params.inputProps,
			serializedResolvedProps,
			providerSpecifics,
			forcePathStyle: params.forcePathStyle,
			insideFunctionSpecifics,
		});
		postRenderData = createPostRenderData({
			region: insideFunctionSpecifics.getCurrentRegionInFunction(),
			memorySizeInMb: insideFunctionSpecifics.getCurrentMemorySizeInMb(),
			renderMetadata,
			errorExplanations: inspectErrors({errors: progress.errors}),
			timeToDelete: cleanup.reduce((max, time) => Math.max(max, time), 0),
			outputFile: {
				url: renderMetadata.outputSequence.manifestUrl,
				sizeInBytes: Buffer.byteLength(manifestBody),
			},
			timeToCombine: null,
			overallProgress: progress,
			timeToFinish: Date.now() - startTime,
			outputSize:
				progress.uploadedSizeInBytes + Buffer.byteLength(manifestBody),
			providerSpecifics,
		});
		await overallProgress.setPostRenderData(postRenderData);
		await providerSpecifics
			.deleteFile({
				bucketName: renderBucketName,
				key: `${rendererOutput.keyPrefix}.remotion-render.json`,
				region: insideFunctionSpecifics.getCurrentRegionInFunction(),
				customCredentials,
				forcePathStyle: params.forcePathStyle,
				requestHandler: null,
			})
			.catch(() => undefined);
	} else if (shouldRenderDirectly) {
		const directRender = await renderWithSingleFunction({
			params,
			composition: comp,
			serializedInputPropsWithCustomSchema,
			frameRange: realFrameRange,
			browserInstance: instance,
			chromiumOptions: chromiumParams,
			overallProgress,
			onArtifact,
			providerSpecifics,
			insideFunctionSpecifics,
		});
		try {
			postRenderData = await finishRender({
				expectedBucketOwner: options.expectedBucketOwner,
				renderBucketName,
				customCredentials,
				downloadBehavior: params.downloadBehavior,
				key,
				privacy: params.privacy,
				inputProps: params.inputProps,
				serializedResolvedProps,
				renderMetadata,
				logLevel: params.logLevel,
				overallProgress,
				startTime,
				providerSpecifics,
				insideFunctionSpecifics,
				forcePathStyle: params.forcePathStyle,
				storageClass: params.storageClass,
				requestHandler: null,
				outputFile: directRender.outputFile,
				timeToCombine: null,
			});
		} finally {
			await directRender.cleanup();
		}
	} else {
		if (params.codec === null) {
			throw new Error('Media renders require a codec');
		}

		const outdir = join(RenderInternals.tmpDir(CONCAT_FOLDER_TOKEN), 'bucket');
		if (existsSync(outdir)) {
			rmSync(outdir, {
				recursive: true,
			});
		}

		mkdirSync(outdir);
		const files: string[] = [];

		await Promise.all(
			lambdaPayloads.map(async (payload) => {
				await renderRendererFunctionWithRetry({
					files,
					functionName: rendererFunctionName,
					outdir,
					overallProgress,
					payload,
					logLevel: params.logLevel,
					onArtifact,
					providerSpecifics,
					insideFunctionSpecifics,
					requestHandler: null,
					expectedBucketOwner: options.expectedBucketOwner,
				});
			}),
		);

		postRenderData = await mergeChunksAndFinishRender({
			bucketName: params.bucketName,
			renderId: params.renderId,
			expectedBucketOwner: options.expectedBucketOwner,
			numberOfFrames: comp.durationInFrames,
			audioCodec: params.audioCodec,
			chunkCount: chunks.length,
			codec: params.codec,
			customCredentials,
			downloadBehavior: params.downloadBehavior,
			fps,
			key,
			numberOfGifLoops: params.numberOfGifLoops,
			privacy: params.privacy,
			renderBucketName,
			inputProps: params.inputProps,
			serializedResolvedProps,
			renderMetadata,
			audioBitrate: params.audioBitrate,
			logLevel: params.logLevel,
			framesPerLambda,
			binariesDirectory: null,
			preferLossless: params.preferLossless,
			compositionStart: realFrameRange[0],
			outdir,
			files: files.sort(),
			overallProgress,
			startTime,
			providerSpecifics,
			forcePathStyle: params.forcePathStyle,
			insideFunctionSpecifics,
			everyNthFrame: params.everyNthFrame,
			frameRange: params.frameRange,
			storageClass: params.storageClass,
			requestHandler: null,
			sampleRate: params.sampleRate,
		});
	}

	if (
		!shouldRenderDirectly &&
		providerSpecifics.getRendererFunctionTransport(
			insideFunctionSpecifics.getCurrentRegionInFunction(),
		) === 's3'
	) {
		try {
			const transportObjects = await providerSpecifics.listObjects({
				bucketName: params.bucketName,
				prefix: rendererTransportPrefix(params.renderId),
				region: insideFunctionSpecifics.getCurrentRegionInFunction(),
				expectedBucketOwner: options.expectedBucketOwner,
				forcePathStyle: params.forcePathStyle,
				requestHandler: null,
			});
			await Promise.all(
				transportObjects.map((object) =>
					providerSpecifics.deleteFile({
						bucketName: params.bucketName,
						key: object.Key,
						region: insideFunctionSpecifics.getCurrentRegionInFunction(),
						customCredentials: null,
						forcePathStyle: params.forcePathStyle,
						requestHandler: null,
					}),
				),
			);
		} catch (err) {
			RenderInternals.Log.warn(
				{indent: false, logLevel: params.logLevel},
				'Could not clean up renderer transport objects',
				err,
			);
		}
	}

	return postRenderData;
};

type CleanupTask = () => Promise<unknown>;

export const launchHandler = async <Provider extends CloudProvider>({
	params,
	options,
	providerSpecifics,
	insideFunctionSpecifics,
}: {
	params: ServerlessPayload<Provider>;
	options: Options;
	providerSpecifics: ProviderSpecifics<Provider>;
	insideFunctionSpecifics: InsideFunctionSpecifics<Provider>;
}): Promise<void> => {
	if (params.type !== ServerlessRoutines.launch) {
		throw new Error('Expected launch type');
	}

	const logOptions: LogOptions = {
		indent: false,
		logLevel: params.logLevel,
	};

	const cleanupTasks: CleanupTask[] = [];
	let instance: LaunchedBrowser | null = null;

	const registerCleanupTask = (task: CleanupTask) => {
		cleanupTasks.push(task);
	};

	const runCleanupTasks = () => {
		const prom = Promise.all(cleanupTasks)
			.then(() => {
				RenderInternals.Log.info(
					{indent: false, logLevel: params.logLevel},
					'Ran cleanup tasks',
				);
			})
			.catch((err) => {
				RenderInternals.Log.error(
					{indent: false, logLevel: params.logLevel},
					'Failed to run cleanup tasks:',
					err,
				);
			});

		cleanupTasks.length = 0;
		return prom;
	};

	const cancelOtherRenderers = async () => {
		if (!params.enableCancellation) {
			return;
		}

		try {
			await writeCancellationSignal({
				bucketName: params.bucketName,
				renderId: params.renderId,
				region: insideFunctionSpecifics.getCurrentRegionInFunction(),
				expectedBucketOwner: options.expectedBucketOwner,
				providerSpecifics,
				forcePathStyle: params.forcePathStyle,
				requestHandler: null,
			});
		} catch (err) {
			RenderInternals.Log.warn(
				{indent: false, logLevel: params.logLevel},
				'Could not signal other renderers to stop.',
				err,
			);
		}
	};

	const onTimeout = async () => {
		RenderInternals.Log.error(
			{indent: false, logLevel: params.logLevel},
			'Function is about to time out. Can not finish render.',
		);

		// @ts-expect-error - We are adding a listener to a global variable
		if (globalThis._dumpUnreleasedBuffers) {
			// @ts-expect-error - We are adding a listener to a global variable
			(globalThis._dumpUnreleasedBuffers as EventEmitter).emit(
				'dump-unreleased-buffers',
			);
		}

		runCleanupTasks();
		await cancelOtherRenderers();

		if (!params.webhook) {
			RenderInternals.Log.verbose(
				{
					indent: false,
					logLevel: params.logLevel,
				},
				'No webhook specified.',
			);
			return;
		}

		if (webhookInvoked) {
			RenderInternals.Log.verbose(
				{
					indent: false,
					logLevel: params.logLevel,
				},
				'Webhook already invoked. Not invoking again.',
			);
			return;
		}

		try {
			await insideFunctionSpecifics.invokeWebhook({
				options: {
					url: params.webhook.url,
					secret: params.webhook.secret,
					payload: {
						type: 'timeout',
						renderId: params.renderId,
						expectedBucketOwner: options.expectedBucketOwner,
						bucketName: params.bucketName,
						customData: params.webhook.customData ?? null,
					},
				},
				logLevel: params.logLevel,
			});
			RenderInternals.Log.verbose(
				{
					indent: false,
					logLevel: params.logLevel,
				},
				'Successfully invoked timeout webhook.',
				params.webhook.url,
			);
			webhookInvoked = true;
		} catch (err) {
			if (process.env.NODE_ENV === 'test') {
				throw err;
			}

			RenderInternals.Log.error(
				{indent: false, logLevel: params.logLevel},
				'Failed to invoke webhook:',
			);
			RenderInternals.Log.error(
				{indent: false, logLevel: params.logLevel},
				err,
			);

			overallProgress.addErrorWithoutUpload({
				type: 'webhook',
				message: (err as Error).message,
				name: (err as Error).name as string,
				stack: (err as Error).stack as string,
				tmpDir: null,
				frame: 0,
				chunk: 0,
				isFatal: false,
				attempt: 1,
				willRetry: false,
				totalAttempts: 1,
			});
			overallProgress.upload('timeoutWebhookError');
		}
	};

	let webhookInvoked = false;
	const webhookDueToTimeout = setTimeout(
		onTimeout,
		Math.max(options.getRemainingTimeInMillis() - 1000, 1000),
	);

	RenderInternals.Log.info(
		logOptions,
		`Function has ${Math.max(
			options.getRemainingTimeInMillis() - 1000,
			1000,
		)} before it times out`,
	);

	const overallProgress = makeOverallRenderProgress({
		cancellationEnabled: params.enableCancellation ?? false,
		renderId: params.renderId,
		bucketName: params.bucketName,
		expectedBucketOwner: options.expectedBucketOwner,
		region: insideFunctionSpecifics.getCurrentRegionInFunction(),
		timeoutTimestamp: options.getRemainingTimeInMillis() + Date.now(),
		logLevel: params.logLevel,
		providerSpecifics,
		forcePathStyle: params.forcePathStyle,
	});

	try {
		const postRenderData = await innerLaunchHandler({
			params,
			options,
			overallProgress,
			registerCleanupTask,
			providerSpecifics,
			insideFunctionSpecifics,
			onBrowser: (browser) => {
				instance = browser;
			},
		});
		clearTimeout(webhookDueToTimeout);

		sendTelemetryEvent({
			licenseKey: params.licenseKey ?? null,
			logLevel: params.logLevel,
			isStill: false,
			isProduction: params.isProduction ?? true,
			idempotencyKey: `cloud-render:${params.bucketName}:${params.renderId}`,
		});

		if (!params.webhook || webhookInvoked) {
			return;
		}

		try {
			await insideFunctionSpecifics.invokeWebhook({
				options: {
					url: params.webhook.url,
					secret: params.webhook.secret,
					payload: {
						type: 'success',
						renderId: params.renderId,
						expectedBucketOwner: options.expectedBucketOwner,
						bucketName: params.bucketName,
						customData: params.webhook.customData ?? null,
						outputUrl: postRenderData.outputFile ?? undefined,
						lambdaErrors: postRenderData.errors,
						outputFile: postRenderData.outputFile ?? undefined,
						outputSequence: postRenderData.outputSequence,
						timeToFinish: postRenderData.timeToFinish,
						costs: postRenderData.cost,
					},
				},
				logLevel: params.logLevel,
			});
			webhookInvoked = true;
		} catch (err) {
			if (process.env.NODE_ENV === 'test') {
				throw err;
			}

			overallProgress.addErrorWithoutUpload({
				type: 'webhook',
				message: (err as Error).message,
				name: (err as Error).name as string,
				stack: (err as Error).stack as string,
				tmpDir: null,
				frame: 0,
				chunk: 0,
				isFatal: false,
				attempt: 1,
				willRetry: false,
				totalAttempts: 1,
			});
			overallProgress.upload('successWebhookError');

			RenderInternals.Log.error(
				{indent: false, logLevel: params.logLevel},
				'Failed to invoke webhook:',
			);
			RenderInternals.Log.error(
				{indent: false, logLevel: params.logLevel},
				err,
			);
		}

		runCleanupTasks();
	} catch (err) {
		if (process.env.NODE_ENV === 'test') {
			throw err;
		}

		await cancelOtherRenderers();

		RenderInternals.Log.error(
			{indent: false, logLevel: params.logLevel},
			'Error occurred',
			err,
		);
		overallProgress.addErrorWithoutUpload({
			chunk: null,
			frame: null,
			name: (err as Error).name as string,
			stack: (err as Error).stack as string,
			type: 'stitcher',
			isFatal: true,
			tmpDir:
				insideFunctionSpecifics.getTmpDirState?.(
					(err as Error).stack as string,
				) ?? null,
			attempt: 1,
			totalAttempts: 1,
			willRetry: false,
			message: (err as Error).message,
		});
		await overallProgress.upload('fatalError');

		runCleanupTasks();

		RenderInternals.Log.error(
			{indent: false, logLevel: params.logLevel},
			'Wrote error to S3',
		);
		clearTimeout(webhookDueToTimeout);

		if (params.webhook && !webhookInvoked) {
			try {
				await insideFunctionSpecifics.invokeWebhook({
					options: {
						url: params.webhook.url,
						secret: params.webhook.secret,
						payload: {
							type: 'error',
							renderId: params.renderId,
							expectedBucketOwner: options.expectedBucketOwner,
							bucketName: params.bucketName,
							customData: params.webhook.customData ?? null,
							errors: [err as Error].map((e) => ({
								message: e.message,
								name: e.name as string,
								stack: e.stack as string,
							})),
						},
					},
					logLevel: params.logLevel,
				});
				webhookInvoked = true;
			} catch (error) {
				if (process.env.NODE_ENV === 'test') {
					throw error;
				}

				overallProgress.addErrorWithoutUpload({
					type: 'webhook',
					message: (err as Error).message,
					name: (err as Error).name as string,
					stack: (err as Error).stack as string,
					tmpDir: null,
					frame: 0,
					chunk: 0,
					isFatal: false,
					attempt: 1,
					willRetry: false,
					totalAttempts: 1,
				});
				overallProgress.upload('errorWebhookError');

				RenderInternals.Log.error(
					{indent: false, logLevel: params.logLevel},
					'Failed to invoke webhook:',
				);
				RenderInternals.Log.error(
					{indent: false, logLevel: params.logLevel},
					error,
				);
			}
		}
	} finally {
		if (instance) {
			insideFunctionSpecifics.forgetBrowserEventLoop({
				logLevel: params.logLevel,
				launchedBrowser: instance,
			});
		}
	}
};
