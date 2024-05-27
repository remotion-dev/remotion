/* eslint-disable @typescript-eslint/no-use-before-define */
import type {LogOptions} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {existsSync, mkdirSync, rmSync} from 'fs';
import {join} from 'path';
import {VERSION} from 'remotion/version';
import {
	compressInputProps,
	decompressInputProps,
	getNeedsToUpload,
	serializeOrThrow,
} from '../shared/compress-props';
import type {
	LambdaPayload,
	PostRenderData,
	RenderMetadata,
} from '../shared/constants';
import {
	CONCAT_FOLDER_TOKEN,
	LambdaRoutines,
	MAX_FUNCTIONS_PER_RENDER,
	renderMetadataKey,
} from '../shared/constants';
import {DOCS_URL} from '../shared/docs-url';
import {invokeWebhook} from '../shared/invoke-webhook';
import {
	validateDimension,
	validateDurationInFrames,
	validateFps,
} from '../shared/validate';
import {validateFramesPerLambda} from '../shared/validate-frames-per-lambda';
import {validateOutname} from '../shared/validate-outname';
import {validatePrivacy} from '../shared/validate-privacy';
import {planFrameRanges} from './chunk-optimization/plan-frame-ranges';
import {bestFramesPerLambdaParam} from './helpers/best-frames-per-lambda-param';
import {getExpectedOutName} from './helpers/expected-out-name';
import {findOutputFileInBucket} from './helpers/find-output-file-in-bucket';
import {
	forgetBrowserEventLoop,
	getBrowserInstance,
} from './helpers/get-browser-instance';
import {getCurrentRegionInFunction} from './helpers/get-current-region';
import {lambdaDeleteFile, lambdaWriteFile} from './helpers/io';
import {mergeChunksAndFinishRender} from './helpers/merge-chunks';
import {makeOverallRenderProgress} from './helpers/overall-render-progress';
import {streamRendererFunctionWithRetry} from './helpers/stream-renderer';
import {validateComposition} from './helpers/validate-composition';
import {
	getTmpDirStateIfENoSp,
	writeLambdaError,
} from './helpers/write-lambda-error';

type Options = {
	expectedBucketOwner: string;
	getRemainingTimeInMillis: () => number;
};

const innerLaunchHandler = async ({
	functionName,
	params,
	options,
}: {
	functionName: string;
	params: LambdaPayload;
	options: Options;
}): Promise<PostRenderData> => {
	if (params.type !== LambdaRoutines.launch) {
		throw new Error('Expected launch type');
	}

	const startedDate = Date.now();

	const browserInstance = getBrowserInstance(
		params.logLevel,
		false,
		params.chromiumOptions,
	);

	const inputPropsPromise = decompressInputProps({
		bucketName: params.bucketName,
		expectedBucketOwner: options.expectedBucketOwner,
		region: getCurrentRegionInFunction(),
		serialized: params.inputProps,
		propsType: 'input-props',
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
	const comp = await validateComposition({
		serveUrl: params.serveUrl,
		composition: params.composition,
		browserInstance: instance,
		serializedInputPropsWithCustomSchema,
		envVariables: params.envVariables ?? {},
		timeoutInMilliseconds: params.timeoutInMilliseconds,
		chromiumOptions: params.chromiumOptions,
		port: null,
		forceHeight: params.forceHeight,
		forceWidth: params.forceWidth,
		logLevel: params.logLevel,
		server: undefined,
		offthreadVideoCacheSizeInBytes: params.offthreadVideoCacheSizeInBytes,
		onBrowserDownload: () => {
			throw new Error('Should not download a browser in Lambda');
		},
	});
	RenderInternals.Log.info(
		logOptions,
		'Composition validated, resolved props',
		comp.props,
	);

	validateDurationInFrames(comp.durationInFrames, {
		component: 'passed to a Lambda render',
		allowFloats: false,
	});
	validateFps(comp.fps, 'passed to a Lambda render', false);
	validateDimension(comp.height, 'height', 'passed to a Lambda render');
	validateDimension(comp.width, 'width', 'passed to a Lambda render');

	RenderInternals.validateBitrate(params.audioBitrate, 'audioBitrate');
	RenderInternals.validateBitrate(params.videoBitrate, 'videoBitrate');

	RenderInternals.validateConcurrency({
		value: params.concurrencyPerLambda,
		setting: 'concurrencyPerLambda',
		checkIfValidForCurrentMachine: true,
	});

	const realFrameRange = RenderInternals.getRealFrameRange(
		comp.durationInFrames,
		params.frameRange,
	);

	const frameCount = RenderInternals.getFramesToRender(
		realFrameRange,
		params.everyNthFrame,
	);

	const framesPerLambda =
		params.framesPerLambda ?? bestFramesPerLambdaParam(frameCount.length);

	validateFramesPerLambda({
		framesPerLambda,
		durationInFrames: frameCount.length,
	});

	validateOutname({
		outName: params.outName,
		codec: params.codec,
		audioCodecSetting: params.audioCodec,
		separateAudioTo: null,
	});
	validatePrivacy(params.privacy, true);
	RenderInternals.validatePuppeteerTimeout(params.timeoutInMilliseconds);

	const {chunks} = planFrameRanges({
		framesPerLambda,
		frameRange: realFrameRange,
		everyNthFrame: params.everyNthFrame,
	});

	if (chunks.length > MAX_FUNCTIONS_PER_RENDER) {
		throw new Error(
			`Too many functions: This render would cause ${chunks.length} functions to spawn. We limit this amount to ${MAX_FUNCTIONS_PER_RENDER} functions as more would result in diminishing returns. Values set: frameCount = ${frameCount}, framesPerLambda=${framesPerLambda}. See ${DOCS_URL}/docs/lambda/concurrency#too-many-functions for help.`,
		);
	}

	const overallProgress = makeOverallRenderProgress({
		renderId: params.renderId,
		bucketName: params.bucketName,
		expectedBucketOwner: options.expectedBucketOwner,
		region: getCurrentRegionInFunction(),
		expectedChunks: chunks.length,
	});

	const sortedChunks = chunks.slice().sort((a, b) => a[0] - b[0]);

	const serializedResolved = serializeOrThrow(comp.props, 'resolved-props');

	const needsToUpload = getNeedsToUpload('video-or-audio', [
		serializedResolved.length,
		params.inputProps.type === 'bucket-url'
			? params.inputProps.hash.length
			: params.inputProps.payload.length,
	]);

	const serializedResolvedProps = await compressInputProps({
		propsType: 'resolved-props',
		region: getCurrentRegionInFunction(),
		stringifiedInputProps: serializedResolved,
		userSpecifiedBucketName: params.bucketName,
		needsToUpload,
	});

	const fps = comp.fps / params.everyNthFrame;

	const lambdaPayloads = chunks.map((chunkPayload) => {
		const payload: LambdaPayload = {
			type: LambdaRoutines.renderer,
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
			crf: params.crf,
			envVariables: params.envVariables,
			pixelFormat: params.pixelFormat,
			proResProfile: params.proResProfile,
			x264Preset: params.x264Preset,
			jpegQuality: params.jpegQuality,
			privacy: params.privacy,
			logLevel: params.logLevel ?? 'info',
			attempt: 1,
			timeoutInMilliseconds: params.timeoutInMilliseconds,
			chromiumOptions: params.chromiumOptions,
			scale: params.scale,
			everyNthFrame: params.everyNthFrame,
			concurrencyPerLambda: params.concurrencyPerLambda,
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
		};
		return payload;
	});

	RenderInternals.Log.info(
		logOptions,
		'Render plan: ',
		chunks.map((c, i) => `Chunk ${i} (Frames ${c[0]} - ${c[1]})`).join(', '),
	);

	const renderMetadata: RenderMetadata = {
		startedDate,
		videoConfig: comp,
		totalChunks: chunks.length,
		estimatedTotalLambdaInvokations: [
			// Direct invokations
			chunks.length,
			// This function
			1,
		].reduce((a, b) => a + b, 0),
		estimatedRenderLambdaInvokations: chunks.length,
		compositionId: comp.id,
		siteId: params.serveUrl,
		codec: params.codec,
		type: 'video',
		imageFormat: params.imageFormat,
		inputProps: params.inputProps,
		lambdaVersion: VERSION,
		framesPerLambda,
		memorySizeInMb: Number(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE),
		region: getCurrentRegionInFunction(),
		renderId: params.renderId,
		outName: params.outName ?? undefined,
		privacy: params.privacy,
		everyNthFrame: params.everyNthFrame,
		frameRange: realFrameRange,
		audioCodec: params.audioCodec,
		deleteAfter: params.deleteAfter,
		numberOfGifLoops: params.numberOfGifLoops,
		downloadBehavior: params.downloadBehavior,
		audioBitrate: params.audioBitrate,
		muted: params.muted,
	};

	const {key, renderBucketName, customCredentials} = getExpectedOutName(
		renderMetadata,
		params.bucketName,
		typeof params.outName === 'string' || typeof params.outName === 'undefined'
			? null
			: params.outName?.s3OutputProvider ?? null,
	);

	// TODO: Once we don't check for output file in S3, we can do this asynchronously
	const output = await findOutputFileInBucket({
		bucketName: params.bucketName,
		customCredentials,
		region: getCurrentRegionInFunction(),
		renderMetadata,
	});

	if (output) {
		if (params.overwrite) {
			console.info(
				'Deleting',
				{bucketName: renderBucketName, key},
				'because it already existed and will be overwritten',
			);
			await lambdaDeleteFile({
				bucketName: renderBucketName,
				customCredentials,
				key,
				region: getCurrentRegionInFunction(),
			});
		} else {
			throw new TypeError(
				`Output file "${key}" in bucket "${renderBucketName}" in region "${getCurrentRegionInFunction()}" already exists. Delete it before re-rendering, or use the overwrite option to delete it before render."`,
			);
		}
	}

	// TODO: Can we not await this?
	await lambdaWriteFile({
		bucketName: params.bucketName,
		key: renderMetadataKey(params.renderId),
		body: JSON.stringify(renderMetadata),
		region: getCurrentRegionInFunction(),
		privacy: 'private',
		expectedBucketOwner: options.expectedBucketOwner,
		downloadBehavior: null,
		customCredentials: null,
	});

	const outdir = join(RenderInternals.tmpDir(CONCAT_FOLDER_TOKEN), 'bucket');
	if (existsSync(outdir)) {
		rmSync(outdir, {
			recursive: true,
		});
	}

	mkdirSync(outdir);

	const files: string[] = [];

	// TODO: Now this will wait for the render to complete
	await Promise.all(
		lambdaPayloads.map(async (payload) => {
			await streamRendererFunctionWithRetry({
				files,
				functionName,
				outdir,
				overallProgress,
				payload,
				logLevel: params.logLevel,
			});
		}),
	);

	const postRenderData = await mergeChunksAndFinishRender({
		bucketName: params.bucketName,
		renderId: params.renderId,
		expectedBucketOwner: options.expectedBucketOwner,
		numberOfFrames: frameCount.length,
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
	});

	return postRenderData;
};

export const launchHandler = async (
	params: LambdaPayload,
	options: Options,
): Promise<{
	type: 'success';
}> => {
	if (params.type !== LambdaRoutines.launch) {
		throw new Error('Expected launch type');
	}

	const functionName =
		params.rendererFunctionName ??
		(process.env.AWS_LAMBDA_FUNCTION_NAME as string);

	const logOptions: LogOptions = {
		indent: false,
		logLevel: params.logLevel,
	};

	const onTimeout = async () => {
		RenderInternals.Log.error(
			{indent: false, logLevel: params.logLevel},
			'Function is about to time out. Can not finish render.',
		);

		if (!params.webhook) {
			return;
		}

		if (webhookInvoked) {
			return;
		}

		try {
			await invokeWebhook(
				{
					url: params.webhook.url,
					secret: params.webhook.secret,
					payload: {
						type: 'timeout',
						renderId: params.renderId,
						expectedBucketOwner: options.expectedBucketOwner,
						bucketName: params.bucketName,
						customData: params.webhook.customData ?? null,
					},
					redirectsSoFar: 0,
				},
				params.logLevel,
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

			await writeLambdaError({
				bucketName: params.bucketName,
				errorInfo: {
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
				},
				renderId: params.renderId,
				expectedBucketOwner: options.expectedBucketOwner,
			});
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

	try {
		const postRenderData = await innerLaunchHandler({
			functionName,
			params,
			options,
		});
		clearTimeout(webhookDueToTimeout);

		if (!params.webhook || webhookInvoked) {
			return {
				type: 'success',
			};
		}

		try {
			await invokeWebhook(
				{
					url: params.webhook.url,
					secret: params.webhook.secret,
					payload: {
						type: 'success',
						renderId: params.renderId,
						expectedBucketOwner: options.expectedBucketOwner,
						bucketName: params.bucketName,
						customData: params.webhook.customData ?? null,
						outputUrl: postRenderData.outputFile,
						lambdaErrors: postRenderData.errors,
						outputFile: postRenderData.outputFile,
						timeToFinish: postRenderData.timeToFinish,
						costs: postRenderData.cost,
					},
					redirectsSoFar: 0,
				},
				params.logLevel,
			);
			webhookInvoked = true;
		} catch (err) {
			if (process.env.NODE_ENV === 'test') {
				throw err;
			}

			await writeLambdaError({
				bucketName: params.bucketName,
				errorInfo: {
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
				},
				renderId: params.renderId,
				expectedBucketOwner: options.expectedBucketOwner,
			});
			RenderInternals.Log.error(
				{indent: false, logLevel: params.logLevel},
				'Failed to invoke webhook:',
			);
			RenderInternals.Log.error(
				{indent: false, logLevel: params.logLevel},
				err,
			);
		}

		return {
			type: 'success',
		};
	} catch (err) {
		if (process.env.NODE_ENV === 'test') {
			throw err;
		}

		RenderInternals.Log.error(
			{indent: false, logLevel: params.logLevel},
			'Error occurred',
			err,
		);
		await writeLambdaError({
			bucketName: params.bucketName,
			errorInfo: {
				chunk: null,
				frame: null,
				name: (err as Error).name as string,
				stack: (err as Error).stack as string,
				type: 'stitcher',
				isFatal: true,
				tmpDir: getTmpDirStateIfENoSp((err as Error).stack as string),
				attempt: 1,
				totalAttempts: 1,
				willRetry: false,
				message: (err as Error).message,
			},
			expectedBucketOwner: options.expectedBucketOwner,
			renderId: params.renderId,
		});
		RenderInternals.Log.error(
			{indent: false, logLevel: params.logLevel},
			'Wrote error to S3',
		);
		clearTimeout(webhookDueToTimeout);

		if (params.webhook && !webhookInvoked) {
			try {
				await invokeWebhook(
					{
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
						redirectsSoFar: 0,
					},
					params.logLevel,
				);
				webhookInvoked = true;
			} catch (error) {
				if (process.env.NODE_ENV === 'test') {
					throw error;
				}

				await writeLambdaError({
					bucketName: params.bucketName,
					errorInfo: {
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
					},
					renderId: params.renderId,
					expectedBucketOwner: options.expectedBucketOwner,
				});
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

		throw err;
	} finally {
		forgetBrowserEventLoop(params.logLevel);
	}
};
