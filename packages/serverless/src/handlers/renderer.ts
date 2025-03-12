import type {
	AudioCodec,
	BrowserLog,
	Codec,
	OnArtifact,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {NoReactAPIs} from '@remotion/renderer/pure';

import type {
	CloudProvider,
	ObjectChunkTimingData,
	OnStream,
	ProviderSpecifics,
	ServerlessPayload,
} from '@remotion/serverless-client';
import {
	decompressInputProps,
	RENDERER_PATH_TOKEN,
	serializeArtifact,
	ServerlessRoutines,
	truthy,
	VERSION,
} from '@remotion/serverless-client';
import fs from 'node:fs';
import path from 'node:path';
import {
	canConcatAudioSeamlessly,
	canConcatVideoSeamlessly,
} from '../can-concat-seamlessly';
import type {LaunchedBrowser} from '../get-browser-instance';
import {getTmpDirStateIfENoSp} from '../get-tmp-dir';
import {startLeakDetection} from '../leak-detection';
import {onDownloadsHelper} from '../on-downloads-helpers';
import type {InsideFunctionSpecifics} from '../provider-implementation';
import {enableNodeIntrospection} from '../why-is-node-running';

type Options = {
	expectedBucketOwner: string;
	isWarm: boolean;
};

export type RequestContext = {
	invokedFunctionArn: string;
	getRemainingTimeInMillis: () => number;
	awsRequestId: string;
};

const renderHandler = async <Provider extends CloudProvider>({
	params,
	options,
	logs,
	onStream,
	providerSpecifics,
	insideFunctionSpecifics,
	onBrowserInstance,
}: {
	params: ServerlessPayload<Provider>;
	options: Options;
	logs: BrowserLog[];
	onStream: OnStream<Provider>;
	providerSpecifics: ProviderSpecifics<Provider>;
	insideFunctionSpecifics: InsideFunctionSpecifics<Provider>;
	onBrowserInstance: (browserInstance: LaunchedBrowser) => void;
}): Promise<{}> => {
	if (params.type !== ServerlessRoutines.renderer) {
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
		region: insideFunctionSpecifics.getCurrentRegionInFunction(),
		serialized: params.inputProps,
		propsType: 'input-props',
		providerSpecifics,
		forcePathStyle: params.forcePathStyle,
	});

	const resolvedPropsPromise = decompressInputProps({
		bucketName: params.bucketName,
		expectedBucketOwner: options.expectedBucketOwner,
		region: insideFunctionSpecifics.getCurrentRegionInFunction(),
		serialized: params.resolvedProps,
		propsType: 'resolved-props',
		providerSpecifics,
		forcePathStyle: params.forcePathStyle,
	});

	const browserInstance = await insideFunctionSpecifics.getBrowserInstance({
		logLevel: params.logLevel,
		indent: false,
		chromiumOptions: params.chromiumOptions,
		providerSpecifics,
		insideFunctionSpecifics,
	});

	onBrowserInstance(browserInstance);

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

	const chunk = `localchunk-${String(params.chunk).padStart(8, '0')}`;
	const defaultAudioCodec = RenderInternals.getDefaultAudioCodec({
		codec: params.codec,
		preferLossless: params.preferLossless,
	});

	const seamlessAudio = canConcatAudioSeamlessly(
		defaultAudioCodec,
		params.framesPerLambda,
	);
	const seamlessVideo = canConcatVideoSeamlessly(params.codec);

	RenderInternals.Log.verbose(
		{indent: false, logLevel: params.logLevel},
		`Preparing for rendering a chunk. Audio = ${
			seamlessAudio ? 'seamless' : 'normal'
		}, Video = ${seamlessVideo ? 'seamless' : 'normal'}`,
		params.logLevel,
	);

	const chunkCodec: Codec =
		seamlessVideo && params.codec === 'h264'
			? 'h264-ts'
			: params.codec === 'gif'
				? 'h264-ts'
				: params.codec;
	const audioCodec: AudioCodec | null =
		defaultAudioCodec === null
			? null
			: seamlessAudio
				? defaultAudioCodec
				: 'pcm-16';

	const videoExtension = RenderInternals.getFileExtensionFromCodec(
		chunkCodec,
		audioCodec,
	);
	const audioExtension = audioCodec
		? RenderInternals.getExtensionFromAudioCodec(audioCodec)
		: null;

	const videoOutputLocation = path.join(outdir, `${chunk}.${videoExtension}`);

	const willRenderAudioEval = RenderInternals.getShouldRenderAudio({
		assetsInfo: null,
		codec: params.codec,
		enforceAudioTrack: true,
		muted: params.muted,
	});

	if (willRenderAudioEval === 'maybe') {
		throw new Error('Cannot determine whether to render audio or not');
	}

	const audioOutputLocation =
		willRenderAudioEval === 'no'
			? null
			: NoReactAPIs.isAudioCodec(params.codec)
				? null
				: audioExtension
					? path.join(outdir, `${chunk}.${audioExtension}`)
					: null;

	const resolvedProps = await resolvedPropsPromise;
	const serializedInputPropsWithCustomSchema = await inputPropsPromise;

	const allFrames = RenderInternals.getFramesToRender(
		params.frameRange,
		params.everyNthFrame,
	);

	const onArtifact: OnArtifact = (artifact) => {
		RenderInternals.Log.info(
			{indent: false, logLevel: params.logLevel},
			`Received artifact on frame ${artifact.frame}:`,
			artifact.filename,
			artifact.content.length + 'bytes. Streaming to main function',
		);
		const startTimestamp = Date.now();
		onStream({
			type: 'artifact-emitted',
			payload: {
				artifact: serializeArtifact(artifact),
			},
		})
			.then(() => {
				RenderInternals.Log.info(
					{indent: false, logLevel: params.logLevel},
					`Streaming artifact ${artifact.filename} to main function took ${Date.now() - startTimestamp}ms`,
				);
			})
			.catch((e) => {
				RenderInternals.Log.error(
					{indent: false, logLevel: params.logLevel},
					`Error streaming artifact ${artifact.filename} to main function`,
					e,
				);
			});
	};

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
				defaultOutName: null,
			},
			imageFormat: params.imageFormat,
			serializedInputPropsWithCustomSchema,
			frameRange: params.frameRange,
			onProgress: ({renderedFrames, encodedFrames, stitchStage}) => {
				RenderInternals.Log.verbose(
					{indent: false, logLevel: params.logLevel},
					`Rendered ${renderedFrames} frames, encoded ${encodedFrames} frames, stage = ${stitchStage}`,
				);

				const allFramesRendered = allFrames.length === renderedFrames;
				const allFramesEncoded = allFrames.length === encodedFrames;

				const frameReportPoint =
					(renderedFrames % params.progressEveryNthFrame === 0 ||
						allFramesRendered) &&
					!allFramesEncoded;
				const encodedFramesReportPoint =
					(encodedFrames % params.progressEveryNthFrame === 0 ||
						allFramesEncoded) &&
					allFramesRendered;

				if (frameReportPoint || encodedFramesReportPoint) {
					onStream({
						type: 'frames-rendered',
						payload: {rendered: renderedFrames, encoded: encodedFrames},
					});
				}

				if (renderedFrames === allFrames.length) {
					RenderInternals.Log.verbose(
						{indent: false, logLevel: params.logLevel},
						'Rendered all frames!',
					);
				}

				chunkTimingData.timings[renderedFrames] = Date.now() - start;
			},
			concurrency: params.concurrencyPerLambda,
			onStart: () => {
				onStream({
					type: 'lambda-invoked',
					payload: {
						attempt: params.attempt,
					},
				});
			},
			puppeteerInstance: browserInstance.instance,
			serveUrl: params.serveUrl,
			jpegQuality: params.jpegQuality ?? RenderInternals.DEFAULT_JPEG_QUALITY,
			envVariables: params.envVariables ?? {},
			logLevel: params.logLevel,
			onBrowserLog: (log) => {
				logs.push(log);
			},
			outputLocation: videoOutputLocation,
			codec: chunkCodec,
			crf: params.crf ?? null,
			pixelFormat: params.pixelFormat ?? RenderInternals.DEFAULT_PIXEL_FORMAT,
			proResProfile: params.proResProfile ?? undefined,
			x264Preset: params.x264Preset,
			onDownload: onDownloadsHelper(params.logLevel),
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
			audioCodec,
			preferLossless: params.preferLossless,
			browserExecutable: providerSpecifics.getChromiumPath(),
			cancelSignal: undefined,
			disallowParallelEncoding: false,
			ffmpegOverride: ({args}) => args,
			indent: false,
			onCtrlCExit: () => undefined,
			server: undefined,
			serializedResolvedPropsWithCustomSchema: resolvedProps,
			offthreadVideoCacheSizeInBytes: params.offthreadVideoCacheSizeInBytes,
			colorSpace: params.colorSpace,
			binariesDirectory: null,
			separateAudioTo: audioOutputLocation,
			forSeamlessAacConcatenation: seamlessAudio,
			compositionStart: params.compositionStart,
			onBrowserDownload: () => {
				throw new Error('Should not download a browser in Lambda');
			},
			onArtifact,
			metadata: params.metadata,
			hardwareAcceleration: 'disable',
			chromeMode: 'headless-shell',
			offthreadVideoThreads: params.offthreadVideoThreads,
		})
			.then(({slowestFrames}) => {
				RenderInternals.Log.verbose(
					{indent: false, logLevel: params.logLevel},
					`Slowest frames:`,
				);
				slowestFrames.forEach(({frame, time}) => {
					RenderInternals.Log.verbose(
						{indent: false, logLevel: params.logLevel},
						`  Frame ${frame} (${time.toFixed(3)}ms)`,
					);
				});
				resolve();
			})
			.catch((err) => reject(err));
	});

	const streamTimer = insideFunctionSpecifics.timer(
		'Streaming chunk to the main function',
		params.logLevel,
	);

	if (audioOutputLocation) {
		const audioChunkTimer = insideFunctionSpecifics.timer(
			'Sending audio chunk',
			params.logLevel,
		);
		await onStream({
			type: 'audio-chunk-rendered',
			payload: fs.readFileSync(audioOutputLocation),
		});
		audioChunkTimer.end();
	}

	if (videoOutputLocation) {
		const videoChunkTimer = insideFunctionSpecifics.timer(
			'Sending main chunk',
			params.logLevel,
		);
		await onStream({
			type: NoReactAPIs.isAudioCodec(params.codec)
				? 'audio-chunk-rendered'
				: 'video-chunk-rendered',
			payload: fs.readFileSync(videoOutputLocation),
		});
		videoChunkTimer.end();
	}

	const endRendered = Date.now();

	await onStream({
		type: 'chunk-complete',
		payload: {
			rendered: endRendered,
			start,
		},
	});

	streamTimer.end();

	RenderInternals.Log.verbose(
		{indent: false, logLevel: params.logLevel},
		'Cleaning up and writing timings',
	);

	await Promise.all(
		[
			fs.promises.rm(videoOutputLocation, {recursive: true}),
			audioOutputLocation
				? fs.promises.rm(audioOutputLocation, {recursive: true})
				: null,
			fs.promises.rm(outputPath, {recursive: true}),
		].filter(truthy),
	);
	RenderInternals.Log.verbose(
		{indent: false, logLevel: params.logLevel},
		'Done!',
	);

	return {};
};

const ENABLE_SLOW_LEAK_DETECTION = false;

export const rendererHandler = async <Provider extends CloudProvider>({
	onStream,
	options,
	params,
	providerSpecifics,
	requestContext,
	insideFunctionSpecifics,
}: {
	params: ServerlessPayload<Provider>;
	options: Options;
	onStream: OnStream<Provider>;
	requestContext: RequestContext;
	providerSpecifics: ProviderSpecifics<Provider>;
	insideFunctionSpecifics: InsideFunctionSpecifics<Provider>;
}): Promise<{
	type: 'success';
}> => {
	if (params.type !== ServerlessRoutines.renderer) {
		throw new Error('Params must be renderer');
	}

	const logs: BrowserLog[] = [];

	const leakDetection = enableNodeIntrospection(ENABLE_SLOW_LEAK_DETECTION);
	let shouldKeepBrowserOpen = true;
	let instance: LaunchedBrowser | undefined;

	try {
		await renderHandler({
			params,
			options,
			logs,
			onStream,
			providerSpecifics,
			insideFunctionSpecifics,
			onBrowserInstance: (browserInstance) => {
				instance = browserInstance;
			},
		});
		return {
			type: 'success',
		};
	} catch (err) {
		if (process.env.NODE_ENV === 'test') {
			// eslint-disable-next-line no-console
			console.log({err});
			throw err;
		}

		// If this error is encountered, we can just retry as it
		// is a very rare error to occur
		const isRetryableError = providerSpecifics.isFlakyError(err as Error);
		if (isRetryableError) {
			shouldKeepBrowserOpen = false;
		}

		const shouldNotRetry = (err as Error).name === 'CancelledError';

		const shouldRetry =
			isRetryableError && params.retriesLeft > 0 && !shouldNotRetry;

		RenderInternals.Log.error(
			{indent: false, logLevel: params.logLevel},
			`Error occurred (will retry = ${String(shouldRetry)})`,
		);
		RenderInternals.Log.error(
			{indent: false, logLevel: params.logLevel},
			(err as Error).stack,
		);

		onStream({
			type: 'error-occurred',
			payload: {
				error: (err as Error).stack as string,
				shouldRetry,
				errorInfo: {
					name: (err as Error).name as string,
					message: (err as Error).message as string,
					stack: (err as Error).stack as string,
					chunk: params.chunk,
					frame: null,
					type: 'renderer',
					isFatal: !shouldRetry,
					tmpDir: getTmpDirStateIfENoSp(
						(err as Error).stack as string,
						insideFunctionSpecifics,
					),
					attempt: params.attempt,
					totalAttempts: params.retriesLeft + params.attempt,
					willRetry: shouldRetry,
				},
			},
		});

		throw err;
	} finally {
		if (shouldKeepBrowserOpen && instance) {
			insideFunctionSpecifics.forgetBrowserEventLoop({
				logLevel: params.logLevel,
				launchedBrowser: instance,
			});
		} else {
			RenderInternals.Log.info(
				{indent: false, logLevel: params.logLevel},
				'Function did not succeed with flaky error, not keeping browser open.',
			);
			RenderInternals.Log.info(
				{indent: false, logLevel: params.logLevel},
				'Waiting 2 seconds to allow for response to be sent',
			);

			setTimeout(() => {
				RenderInternals.Log.info(
					{indent: false, logLevel: params.logLevel},
					'Quitting Function forcefully now to force not keeping the Function warm.',
				);
				process.exit(0);
			}, 2000);
		}

		if (ENABLE_SLOW_LEAK_DETECTION) {
			startLeakDetection(leakDetection, requestContext.awsRequestId);
		}
	}
};
