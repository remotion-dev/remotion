import {InvokeCommand} from '@aws-sdk/client-lambda';
import type {BrowserLog, Codec} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {VERSION} from 'remotion/version';
import {getLambdaClient} from '../shared/aws-clients';
import {writeLambdaInitializedFile} from '../shared/chunk-progress';
import type {LambdaPayload, LambdaPayloads} from '../shared/constants';
import {
	chunkKeyForIndex,
	LambdaRoutines,
	lambdaTimingsKey,
	RENDERER_PATH_TOKEN,
} from '../shared/constants';
import {deserializeInputProps} from '../shared/deserialize-input-props';
import type {
	ChunkTimingData,
	ObjectChunkTimingData,
} from './chunk-optimization/types';
import {getBrowserInstance} from './helpers/get-browser-instance';
import {executablePath} from './helpers/get-chromium-executable-path';
import {getCurrentRegionInFunction} from './helpers/get-current-region';
import {lambdaWriteFile} from './helpers/io';
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
	logs: BrowserLog[]
) => {
	if (params.type !== LambdaRoutines.renderer) {
		throw new Error('Params must be renderer');
	}

	if (params.launchFunctionConfig.version !== VERSION) {
		throw new Error(
			`The version of the function that was specified as "rendererFunctionName" is ${VERSION} but the version of the function that invoked the render is ${params.launchFunctionConfig.version}. Please make sure that the version of the function that is specified as "rendererFunctionName" is the same as the version of the function that is invoked.`
		);
	}

	const inputPropsPromise = deserializeInputProps({
		bucketName: params.bucketName,
		expectedBucketOwner: options.expectedBucketOwner,
		region: getCurrentRegionInFunction(),
		serialized: params.inputProps,
	});

	const browserInstance = await getBrowserInstance(
		RenderInternals.isEqualOrBelowLogLevel(params.logLevel, 'verbose'),
		params.chromiumOptions ?? {}
	);

	const outputPath = RenderInternals.tmpDir('remotion-render-');

	if (typeof params.chunk !== 'number') {
		throw new Error('must pass chunk');
	}

	if (!params.frameRange) {
		throw new Error('must pass framerange');
	}

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
			'0'
		)}.${RenderInternals.getFileExtensionFromCodec(
			chunkCodec,
			RenderInternals.getDefaultAudioCodec({
				codec: params.codec,
				preferLossless: true,
			})
		)}`
	);

	const downloads: Record<string, number> = {};

	const inputProps = await inputPropsPromise;
	await new Promise<void>((resolve, reject) => {
		RenderInternals.internalRenderMedia({
			composition: {
				id: params.composition,
				durationInFrames: params.durationInFrames,
				fps: params.fps,
				height: params.height,
				width: params.width,
			},
			imageFormat: params.imageFormat,
			inputProps,
			frameRange: params.frameRange,
			onProgress: ({renderedFrames, encodedFrames, stitchStage}) => {
				if (
					renderedFrames % 5 === 0 &&
					RenderInternals.isEqualOrBelowLogLevel(params.logLevel, 'verbose')
				) {
					console.log(
						`Rendered ${renderedFrames} frames, encoded ${encodedFrames} frames, stage = ${stitchStage}`
					);
					writeLambdaInitializedFile({
						attempt: params.attempt,
						bucketName: params.bucketName,
						chunk: params.chunk,
						expectedBucketOwner: options.expectedBucketOwner,
						framesRendered: renderedFrames,
						renderId: params.renderId,
					}).catch((err) => reject(err));
				}

				const allFrames = RenderInternals.getFramesToRender(
					params.frameRange,
					params.everyNthFrame
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
			puppeteerInstance: browserInstance,
			serveUrl: params.serveUrl,
			jpegQuality: params.jpegQuality ?? RenderInternals.DEFAULT_JPEG_QUALITY,
			envVariables: params.envVariables ?? {},
			dumpBrowserLogs:
				params.dumpBrowserLogs ??
				RenderInternals.isEqualOrBelowLogLevel(params.logLevel, 'verbose'),
			verbose: RenderInternals.isEqualOrBelowLogLevel(
				params.logLevel,
				'verbose'
			),
			onBrowserLog: (log) => {
				logs.push(log);
			},
			outputLocation,
			codec: chunkCodec,
			crf: params.crf ?? null,
			pixelFormat: params.pixelFormat ?? RenderInternals.DEFAULT_PIXEL_FORMAT,
			proResProfile: params.proResProfile,
			onDownload: (src: string) => {
				console.log('Downloading', src);
				downloads[src] = 0;
				return ({percent, downloaded}) => {
					if (percent === null) {
						console.log(
							`Download progress (${src}): ${downloaded} bytes. Don't know final size of download, no Content-Length header.`
						);
						return;
					}

					if (
						// Only report every 10% change
						downloads[src] > percent - 0.1 &&
						percent !== 1
					) {
						return;
					}

					downloads[src] = percent;
					console.log(
						`Download progress (${src}): ${downloaded} bytes, ${(
							percent * 100
						).toFixed(1)}%`
					);
					if (percent === 1) {
						console.log(`Download complete: ${src}`);
					}
				};
			},
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
		})
			.then(({slowestFrames}) => {
				console.log();
				console.log(`Slowest frames:`);
				slowestFrames.forEach(({frame, time}) => {
					console.log(`Frame ${frame} (${time.toFixed(3)}ms)`);
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
};

export const rendererHandler = async (
	params: LambdaPayload,
	options: Options
) => {
	if (params.type !== LambdaRoutines.renderer) {
		throw new Error('Params must be renderer');
	}

	const logs: BrowserLog[] = [];

	try {
		await renderHandler(params, options, logs);
	} catch (err) {
		if (process.env.NODE_ENV === 'test') {
			console.log({err});
			throw err;
		}

		// If this error is encountered, we can just retry as it
		// is a very rare error to occur
		const isBrowserError =
			(err as Error).message.includes('FATAL:zygote_communication_linux.cc') ||
			(err as Error).message.includes(
				'error while loading shared libraries: libnss3.so'
			);
		const shouldNotRetry = (err as Error).name === 'CancelledError';

		const willRetry =
			(isBrowserError || params.retriesLeft > 0) && !shouldNotRetry;

		console.log('Error occurred');
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
				isFatal: !isBrowserError,
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
			await getLambdaClient(getCurrentRegionInFunction()).send(
				new InvokeCommand({
					FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
					// @ts-expect-error
					Payload: JSON.stringify(retryPayload),
					InvocationType: 'Event',
				})
			);
		}
	}
};
