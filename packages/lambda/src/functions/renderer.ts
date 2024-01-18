import type {BrowserLog, Codec} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {VERSION} from 'remotion/version';
import {callLambda} from '../shared/call-lambda';
import {writeLambdaInitializedFile} from '../shared/chunk-progress';
import {decompressInputProps} from '../shared/compress-props';
import type {LambdaPayload, LambdaPayloads} from '../shared/constants';
import {
	chunkKeyForIndex,
	LambdaRoutines,
	lambdaTimingsKey,
	RENDERER_PATH_TOKEN,
} from '../shared/constants';
import {isFlakyError} from '../shared/is-flaky-error';
import {enableNodeIntrospection} from '../shared/why-is-node-running';
import type {
	ChunkTimingData,
	ObjectChunkTimingData,
} from './chunk-optimization/types';
import {
	forgetBrowserEventLoop,
	getBrowserInstance,
} from './helpers/get-browser-instance';
import {executablePath} from './helpers/get-chromium-executable-path';
import {getCurrentRegionInFunction} from './helpers/get-current-region';
import {lambdaWriteFile} from './helpers/io';
import {startLeakDetection} from './helpers/leak-detection';
import {onDownloadsHelper} from './helpers/on-downloads-logger';
import type {RequestContext} from './helpers/request-context';
import {
	getTmpDirStateIfENoSp,
	writeLambdaError,
} from './helpers/write-lambda-error';

type Options = {
	expectedBucketOwner: string;
	isWarm: boolean;
};

const renderHandler = async (
	params: LambdaPayload,
	options: Options,
	logs: BrowserLog[],
): Promise<{}> => {
	if (params.type !== LambdaRoutines.renderer) {
		throw new Error('Params must be renderer');
	}

	if (params.launchFunctionConfig.version !== VERSION) {
		throw new Error(
			`The version of the function that was specified as "rendererFunctionName" is ${VERSION} but the version of the function that invoked the render is ${params.launchFunctionConfig.version}. Please make sure that the version of the function that is specified as "rendererFunctionName" is the same as the version of the function that is invoked.`,
		);
	}

	const inputPropsPromise = decompressInputProps({
		bucketName: params.bucketName,
		expectedBucketOwner: options.expectedBucketOwner,
		region: getCurrentRegionInFunction(),
		serialized: params.inputProps,
		propsType: 'input-props',
	});

	const resolvedPropsPromise = decompressInputProps({
		bucketName: params.bucketName,
		expectedBucketOwner: options.expectedBucketOwner,
		region: getCurrentRegionInFunction(),
		serialized: params.resolvedProps,
		propsType: 'resolved-props',
	});

	const browserInstance = await getBrowserInstance(
		params.logLevel,
		false,
		params.chromiumOptions,
	);

	const outputPath = RenderInternals.tmpDir('remotion-render-');

	if (typeof params.chunk !== 'number') {
		throw new Error('must pass chunk');
	}

	if (!params.frameRange) {
		throw new Error('must pass framerange');
	}

	RenderInternals.Log.verbose(
		{indent: false, logLevel: params.logLevel},
		`Rendering frames ${params.frameRange[0]}-${params.frameRange[1]} in this Lambda function`,
	);

	const start = Date.now();
	const chunkTimingData: ObjectChunkTimingData = {
		timings: {},
		chunk: params.chunk,
		frameRange: params.frameRange,
		startDate: start,
	};

	const outdir = RenderInternals.tmpDir(RENDERER_PATH_TOKEN);

	const chunkCodec: Codec =
		params.codec === 'gif' || params.codec === 'h264'
			? 'h264-mkv'
			: params.codec;

	const outputLocation = path.join(
		outdir,
		`localchunk-${String(params.chunk).padStart(
			8,
			'0',
		)}.${RenderInternals.getFileExtensionFromCodec(
			chunkCodec,
			RenderInternals.getDefaultAudioCodec({
				codec: params.codec,
				preferLossless: true,
			}),
		)}`,
	);

	const resolvedProps = await resolvedPropsPromise;
	const serializedInputPropsWithCustomSchema = await inputPropsPromise;

	await new Promise<void>((resolve, reject) => {
		RenderInternals.internalRenderMedia({
			repro: false,
			composition: {
				id: params.composition,
				durationInFrames: params.durationInFrames,
				fps: params.fps,
				height: params.height,
				width: params.width,
				defaultCodec: null,
			},
			imageFormat: params.imageFormat,
			serializedInputPropsWithCustomSchema,
			frameRange: params.frameRange,
			onProgress: ({renderedFrames, encodedFrames, stitchStage}) => {
				if (renderedFrames % 5 === 0) {
					RenderInternals.Log.info(
						`Rendered ${renderedFrames} frames, encoded ${encodedFrames} frames, stage = ${stitchStage}`,
					);
					writeLambdaInitializedFile({
						attempt: params.attempt,
						bucketName: params.bucketName,
						chunk: params.chunk,
						expectedBucketOwner: options.expectedBucketOwner,
						framesRendered: renderedFrames,
						renderId: params.renderId,
					}).catch((err) => {
						console.log('Could not write progress', err);
						return reject(err);
					});
				} else {
					RenderInternals.Log.verbose(
						{indent: false, logLevel: params.logLevel},
						`Rendered ${renderedFrames} frames, encoded ${encodedFrames} frames, stage = ${stitchStage}`,
					);
				}

				const allFrames = RenderInternals.getFramesToRender(
					params.frameRange,
					params.everyNthFrame,
				);

				if (renderedFrames === allFrames.length) {
					console.log('Rendered all frames!');
				}

				chunkTimingData.timings[renderedFrames] = Date.now() - start;
			},
			concurrency: params.concurrencyPerLambda,
			onStart: () => {
				writeLambdaInitializedFile({
					attempt: params.attempt,
					bucketName: params.bucketName,
					chunk: params.chunk,
					expectedBucketOwner: options.expectedBucketOwner,
					framesRendered: 0,
					renderId: params.renderId,
				}).catch((err) => reject(err));
			},
			puppeteerInstance: browserInstance.instance,
			serveUrl: params.serveUrl,
			jpegQuality: params.jpegQuality ?? RenderInternals.DEFAULT_JPEG_QUALITY,
			envVariables: params.envVariables ?? {},
			logLevel: params.logLevel,
			onBrowserLog: (log) => {
				logs.push(log);
			},
			outputLocation,
			codec: chunkCodec,
			crf: params.crf ?? null,
			pixelFormat: params.pixelFormat ?? RenderInternals.DEFAULT_PIXEL_FORMAT,
			proResProfile: params.proResProfile,
			x264Preset: params.x264Preset ?? undefined,
			onDownload: onDownloadsHelper(),
			overwrite: false,
			chromiumOptions: params.chromiumOptions,
			scale: params.scale,
			timeoutInMilliseconds: params.timeoutInMilliseconds,
			port: null,
			everyNthFrame: params.everyNthFrame,
			numberOfGifLoops: null,
			muted: params.muted,
			enforceAudioTrack: true,
			audioBitrate: params.audioBitrate,
			videoBitrate: params.videoBitrate,
			encodingBufferSize: params.encodingBufferSize,
			encodingMaxRate: params.encodingMaxRate,
			// Lossless flag takes priority over audio codec
			// https://github.com/remotion-dev/remotion/issues/1647
			// Special flag only in Lambda renderer which improves the audio quality
			audioCodec: null,
			preferLossless: true,
			browserExecutable: executablePath(),
			cancelSignal: undefined,
			disallowParallelEncoding: false,
			ffmpegOverride: ({args}) => args,
			indent: false,
			onCtrlCExit: () => undefined,
			server: undefined,
			serializedResolvedPropsWithCustomSchema: resolvedProps,
			offthreadVideoCacheSizeInBytes: params.offthreadVideoCacheSizeInBytes,
			colorSpace: params.colorSpace,
			finishRenderProgress: () => undefined,
		})
			.then(({slowestFrames}) => {
				console.log(`Slowest frames:`);
				slowestFrames.forEach(({frame, time}) => {
					console.log(`  Frame ${frame} (${time.toFixed(3)}ms)`);
				});
				resolve();
			})
			.catch((err) => reject(err));
	});

	const endRendered = Date.now();

	const condensedTimingData: ChunkTimingData = {
		...chunkTimingData,
		timings: Object.values(chunkTimingData.timings),
	};

	RenderInternals.Log.verbose(
		{indent: false, logLevel: params.logLevel},
		'Writing chunk to S3',
	);
	const writeStart = Date.now();
	await lambdaWriteFile({
		bucketName: params.bucketName,
		key: chunkKeyForIndex({
			renderId: params.renderId,
			index: params.chunk,
		}),
		body: fs.createReadStream(outputLocation),
		region: getCurrentRegionInFunction(),
		privacy: params.privacy,
		expectedBucketOwner: options.expectedBucketOwner,
		downloadBehavior: null,
		customCredentials: null,
	});
	RenderInternals.Log.verbose(
		{indent: false, logLevel: params.logLevel},
		`Wrote chunk to S3 (${Date.now() - writeStart}ms)`,
	);
	RenderInternals.Log.verbose(
		{indent: false, logLevel: params.logLevel},
		'Cleaning up and writing timings',
	);
	await Promise.all([
		fs.promises.rm(outputLocation, {recursive: true}),
		fs.promises.rm(outputPath, {recursive: true}),
		lambdaWriteFile({
			bucketName: params.bucketName,
			body: JSON.stringify(condensedTimingData as ChunkTimingData, null, 2),
			key: lambdaTimingsKey({
				renderId: params.renderId,
				chunk: params.chunk,
				rendered: endRendered,
				start,
			}),
			region: getCurrentRegionInFunction(),
			privacy: 'private',
			expectedBucketOwner: options.expectedBucketOwner,
			downloadBehavior: null,
			customCredentials: null,
		}),
	]);
	RenderInternals.Log.verbose(
		{indent: false, logLevel: params.logLevel},
		'Done!',
	);
	return {};
};

export const ENABLE_SLOW_LEAK_DETECTION = false;

export const rendererHandler = async (
	params: LambdaPayload,
	options: Options,
	requestContext: RequestContext,
): Promise<{
	type: 'success';
}> => {
	if (params.type !== LambdaRoutines.renderer) {
		throw new Error('Params must be renderer');
	}

	const logs: BrowserLog[] = [];

	const leakDetection = enableNodeIntrospection(ENABLE_SLOW_LEAK_DETECTION);

	try {
		await renderHandler(params, options, logs);
		return {
			type: 'success',
		};
	} catch (err) {
		if (process.env.NODE_ENV === 'test') {
			console.log({err});
			throw err;
		}

		// If this error is encountered, we can just retry as it
		// is a very rare error to occur
		const isRetryableError = isFlakyError(err as Error);

		const shouldNotRetry = (err as Error).name === 'CancelledError';

		const willRetry =
			isRetryableError && params.retriesLeft > 0 && !shouldNotRetry;
		const isFatal = !willRetry;

		console.log(`Error occurred (will retry = ${String(willRetry)})`);
		console.log(err);
		await writeLambdaError({
			bucketName: params.bucketName,
			errorInfo: {
				name: (err as Error).name as string,
				message: (err as Error).message as string,
				stack: (err as Error).stack as string,
				chunk: params.chunk,
				frame: null,
				type: 'renderer',
				isFatal,
				tmpDir: getTmpDirStateIfENoSp((err as Error).stack as string),
				attempt: params.attempt,
				totalAttempts: params.retriesLeft + params.attempt,
				willRetry,
			},
			renderId: params.renderId,
			expectedBucketOwner: options.expectedBucketOwner,
		});
		if (willRetry) {
			const retryPayload: LambdaPayloads[LambdaRoutines.renderer] = {
				...params,
				retriesLeft: params.retriesLeft - 1,
				attempt: params.attempt + 1,
			};
			const res = await callLambda({
				functionName: process.env.AWS_LAMBDA_FUNCTION_NAME as string,
				payload: retryPayload,
				type: LambdaRoutines.renderer,
				region: getCurrentRegionInFunction(),
				receivedStreamingPayload: () => undefined,
				timeoutInTest: 120000,
				retriesRemaining: 0,
			});

			return res;
		}

		throw err;
	} finally {
		forgetBrowserEventLoop(params.logLevel);

		startLeakDetection(leakDetection, requestContext.awsRequestId);
	}
};
