import {
	LambdaClientInternals,
	ServerlessRoutines,
	type ServerlessPayload,
	type StreamingPayload,
} from '@remotion/lambda-client';
import {DEFAULT_X264_PRESET} from '../helpers/default-x264-preset';
import {getCurrentFunctionName} from '../helpers/get-current-function-name';
import {getCurrentRegionInFunction} from '../helpers/get-current-region';
import {makeInitialOverallRenderProgress} from '../overall-render-progress';
import {printLoggingGrepHelper} from '../print-logging-grep-helper';
import {checkVersionMismatch} from './check-version-mismatch';
import {launchHandler} from './launch';
import type {RequestContext} from './renderer';

type Options = {
	expectedBucketOwner: string | null;
	timeoutInMilliseconds: number;
	renderId: string;
};

export const startHandler = async ({
	params,
	options,
	context,
	publish,
}: {
	params: ServerlessPayload;
	options: Options;
	context: RequestContext | null;
	publish: ((message: StreamingPayload) => void) | null;
}) => {
	if (params.type !== ServerlessRoutines.start) {
		throw new TypeError('Expected type start');
	}

	checkVersionMismatch({
		apiName:
			params.output?.type === 'sequence'
				? 'renderFramesOnLambda()'
				: 'renderMediaOnLambda()',
		params,
	});

	const region = getCurrentRegionInFunction();
	const bucketName =
		params.bucketName ??
		(
			await LambdaClientInternals.internalGetOrCreateBucket({
				region: getCurrentRegionInFunction(),
				enableFolderExpiry: null,
				customCredentials: null,
				forcePathStyle: params.forcePathStyle,
				skipPutAcl: false,
				requestHandler: null,
				logLevel: params.logLevel,
			})
		).bucketName;
	const realServeUrl = LambdaClientInternals.convertToServeUrlImplementation({
		urlOrId: params.serveUrl,
		region,
		bucketName,
	});

	LambdaClientInternals.validateDeleteAfter(params.deleteAfter);

	const initialFile = LambdaClientInternals.lambdaWriteFileImplementation({
		bucketName,
		downloadBehavior: null,
		region,
		body: JSON.stringify(
			makeInitialOverallRenderProgress(
				options.timeoutInMilliseconds + Date.now(),
				params.enableCancellation ?? false,
			),
		),
		expectedBucketOwner: options.expectedBucketOwner,
		key: LambdaClientInternals.overallProgressKey(options.renderId),
		privacy: 'private',
		customCredentials: null,
		forcePathStyle: params.forcePathStyle,
		storageClass: null,
		requestHandler: null,
	});

	const payload: ServerlessPayload = {
		enableCancellation: params.enableCancellation ?? false,
		type: ServerlessRoutines.launch,
		framesPerFunction: params.framesPerLambda,
		concurrency: params.concurrency,
		composition: params.composition,
		serveUrl: realServeUrl,
		inputProps: params.inputProps,
		bucketName,
		renderId: options.renderId,
		codec: params.codec,
		output: params.output,
		imageFormat: params.imageFormat,
		crf: params.crf ?? null,
		envVariables: params.envVariables,
		pixelFormat: params.pixelFormat ?? null,
		proResProfile: params.proResProfile ?? null,
		x264Preset:
			params.x264Preset ??
			(params.codec === 'h264' ? DEFAULT_X264_PRESET : null),
		gopSize: params.gopSize ?? null,
		disableSharedMemoryCapture: params.disableSharedMemoryCapture,
		jpegQuality: params.jpegQuality,
		maxRetries: params.maxRetries,
		privacy: params.privacy,
		logLevel: params.logLevel,
		frameRange: params.frameRange,
		outName: params.outName,
		separateAudioTo: params.separateAudioTo ?? null,
		timeoutInMilliseconds: params.timeoutInMilliseconds,
		chromiumOptions: params.chromiumOptions,
		scale: params.scale,
		numberOfGifLoops: params.numberOfGifLoops,
		everyNthFrame: params.everyNthFrame,
		concurrencyPerFunction: params.concurrencyPerLambda,
		downloadBehavior: params.downloadBehavior,
		muted: params.muted,
		overwrite: params.overwrite,
		webhook: params.webhook,
		audioBitrate: params.audioBitrate,
		videoBitrate: params.videoBitrate,
		encodingBufferSize: params.encodingBufferSize,
		encodingMaxRate: params.encodingMaxRate,
		forceHeight: params.forceHeight,
		forceWidth: params.forceWidth,
		forceFps: params.forceFps ?? null,
		forceDurationInFrames: params.forceDurationInFrames ?? null,
		rendererFunctionName: params.rendererFunctionName,
		audioCodec: params.audioCodec,
		offthreadVideoCacheSizeInBytes: params.offthreadVideoCacheSizeInBytes,
		deleteAfter: params.deleteAfter,
		colorSpace: params.colorSpace,
		preferLossless: params.preferLossless,
		forcePathStyle: params.forcePathStyle,
		metadata: params.metadata,
		licenseKey: params.licenseKey,
		offthreadVideoThreads: params.offthreadVideoThreads,
		storageClass: params.storageClass,
		mediaCacheSizeInBytes: params.mediaCacheSizeInBytes,
		preferredEffectBackend: params.preferredEffectBackend,
		isProduction: params.isProduction ?? true,
		sampleRate: params.sampleRate ?? 48000,
	};

	if (params.streamProgress) {
		await initialFile;
		if (!context || !publish) {
			throw new Error('Missing streaming start context');
		}

		publish({
			type: 'render-started',
			payload: LambdaClientInternals.makeRenderMediaOnLambdaOutput({
				renderId: options.renderId,
				bucketName,
				functionName: getCurrentFunctionName(),
				region,
				rendererFunctionName: params.rendererFunctionName,
			}),
		});
		if (LambdaClientInternals.isInsideLambda()) {
			printLoggingGrepHelper(
				ServerlessRoutines.launch,
				{renderId: options.renderId},
				params.logLevel,
			);
		}

		await launchHandler({
			params: payload,
			options: {
				expectedBucketOwner: options.expectedBucketOwner,
				getRemainingTimeInMillis: context.getRemainingTimeInMillis,
				requestContext: context,
			},
			onProgress: (progress) => {
				publish(
					progress.fatalErrorEncountered
						? {
								type: 'render-failed',
								payload: {
									message:
										progress.errors.find((e) => e.isFatal && !e.willRetry)
											?.message ?? 'Lambda render failed',
									stack: null,
									progress,
								},
							}
						: {
								type: progress.done ? 'render-complete' : 'render-progress',
								payload: progress,
							},
				);
			},
		});
		return {type: 'success' as const, bucketName, renderId: options.renderId};
	}

	await LambdaClientInternals.callFunctionAsyncImplementation({
		functionName: getCurrentFunctionName(),
		type: ServerlessRoutines.launch,
		payload,
		region,
		timeoutInTest: options.timeoutInMilliseconds,
		requestHandler: null,
	});

	await initialFile;

	return {
		type: 'success' as const,
		bucketName,
		renderId: options.renderId,
	};
};
