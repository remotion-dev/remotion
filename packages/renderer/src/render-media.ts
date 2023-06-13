import type {ExecaChildProcess} from 'execa';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type {AnySmallCompMetadata} from 'remotion';
import {Internals} from 'remotion';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import type {AudioCodec} from './audio-codec';
import type {BrowserExecutable} from './browser-executable';
import type {BrowserLog} from './browser-log';
import type {HeadlessBrowser} from './browser/Browser';
import {DEFAULT_TIMEOUT} from './browser/TimeoutSettings';
import {canUseParallelEncoding} from './can-use-parallel-encoding';
import type {Codec} from './codec';
import {codecSupportsMedia} from './codec-supports-media';
import {validateQualitySettings} from './crf';
import {deleteDirectory} from './delete-directory';
import {ensureFramesInOrder} from './ensure-frames-in-order';
import {ensureOutputDirectory} from './ensure-output-directory';
import type {FfmpegOverrideFn} from './ffmpeg-override';
import {findRemotionRoot} from './find-closest-package-json';
import type {FrameRange} from './frame-range';
import {getActualConcurrency} from './get-concurrency';
import {getFramesToRender} from './get-duration-from-frame-range';
import {getFileExtensionFromCodec} from './get-extension-from-codec';
import {getExtensionOfFilename} from './get-extension-of-filename';
import {getRealFrameRange} from './get-frame-to-render';
import type {VideoImageFormat} from './image-format';
import {
	DEFAULT_VIDEO_IMAGE_FORMAT,
	validateSelectedPixelFormatAndImageFormatCombination,
} from './image-format';
import {isAudioCodec} from './is-audio-codec';
import {DEFAULT_JPEG_QUALITY, validateJpegQuality} from './jpeg-quality';
import {Log} from './logger';
import type {CancelSignal} from './make-cancel-signal';
import {cancelErrorMessages, makeCancelSignal} from './make-cancel-signal';
import type {ChromiumOptions} from './open-browser';
import {DEFAULT_OVERWRITE} from './overwrite';
import {startPerfMeasure, stopPerfMeasure} from './perf';
import type {PixelFormat} from './pixel-format';
import {
	DEFAULT_PIXEL_FORMAT,
	validateSelectedPixelFormatAndCodecCombination,
} from './pixel-format';
import type {RemotionServer} from './prepare-server';
import {makeOrReuseServer} from './prepare-server';
import {prespawnFfmpeg} from './prespawn-ffmpeg';
import {shouldUseParallelEncoding} from './prestitcher-memory-usage';
import type {ProResProfile} from './prores-profile';
import {validateSelectedCodecAndProResCombination} from './prores-profile';
import {internalRenderFrames} from './render-frames';
import {internalStitchFramesToVideo} from './stitch-frames-to-video';
import type {OnStartData} from './types';
import {validateEvenDimensionsWithCodec} from './validate-even-dimensions-with-codec';
import {validateEveryNthFrame} from './validate-every-nth-frame';
import {validateFfmpegOverride} from './validate-ffmpeg-override';
import {validateNumberOfGifLoops} from './validate-number-of-gif-loops';
import {validateOutputFilename} from './validate-output-filename';
import {validateScale} from './validate-scale';
import {validateBitrate} from './validate-videobitrate';

export type StitchingState = 'encoding' | 'muxing';

const SLOWEST_FRAME_COUNT = 10;

export type SlowFrame = {frame: number; time: number};

export type RenderMediaOnProgress = (progress: {
	renderedFrames: number;
	encodedFrames: number;
	encodedDoneIn: number | null;
	renderedDoneIn: number | null;
	progress: number;
	stitchStage: StitchingState;
}) => void;

export type InternalRenderMediaOptions = {
	outputLocation: string | null;
	codec: Codec;
	composition: AnySmallCompMetadata;
	inputProps: Record<string, unknown>;
	crf: number | null;
	imageFormat: VideoImageFormat;
	pixelFormat: PixelFormat;
	envVariables: Record<string, string>;
	jpegQuality: number;
	frameRange: FrameRange | null;
	everyNthFrame: number;
	numberOfGifLoops: number | null;
	puppeteerInstance: HeadlessBrowser | undefined;
	overwrite: boolean;
	onProgress: RenderMediaOnProgress;
	onDownload: RenderMediaOnDownload;
	proResProfile: ProResProfile | undefined;
	dumpBrowserLogs: boolean;
	onBrowserLog: ((log: BrowserLog) => void) | null;
	onStart: (data: OnStartData) => void;
	timeoutInMilliseconds: number;
	chromiumOptions: ChromiumOptions;
	scale: number;
	port: number | null;
	cancelSignal: CancelSignal | undefined;
	browserExecutable: BrowserExecutable | null;
	verbose: boolean;
	onCtrlCExit: (fn: () => void) => void;
	indent: boolean;
	server: RemotionServer | undefined;
	preferLossless: boolean;
	muted: boolean;
	enforceAudioTrack: boolean;
	ffmpegOverride: FfmpegOverrideFn | undefined;
	audioBitrate: string | null;
	videoBitrate: string | null;
	disallowParallelEncoding: boolean;
	audioCodec: AudioCodec | null;
	serveUrl: string;
	concurrency: number | string | null;
};

export type RenderMediaOptions = {
	outputLocation?: string | null;
	codec: Codec;
	composition: AnySmallCompMetadata;
	inputProps?: Record<string, unknown>;
	crf?: number | null;
	imageFormat?: VideoImageFormat;
	pixelFormat?: PixelFormat;
	envVariables?: Record<string, string>;
	/**
	 * @deprecated Renamed to `jpegQuality`
	 */
	quality?: never;
	jpegQuality?: number;
	frameRange?: FrameRange | null;
	everyNthFrame?: number;
	numberOfGifLoops?: number | null;
	puppeteerInstance?: HeadlessBrowser;
	overwrite?: boolean;
	onProgress?: RenderMediaOnProgress;
	onDownload?: RenderMediaOnDownload;
	proResProfile?: ProResProfile;
	dumpBrowserLogs?: boolean;
	onBrowserLog?: ((log: BrowserLog) => void) | undefined;
	onStart?: (data: OnStartData) => void;
	timeoutInMilliseconds?: number;
	chromiumOptions?: ChromiumOptions;
	scale?: number;
	port?: number | null;
	cancelSignal?: CancelSignal;
	browserExecutable?: BrowserExecutable;
	verbose?: boolean;
	preferLossless?: boolean;
	muted?: boolean;
	enforceAudioTrack?: boolean;
	ffmpegOverride?: FfmpegOverrideFn;
	audioBitrate?: string | null;
	videoBitrate?: string | null;
	disallowParallelEncoding?: boolean;
	audioCodec?: AudioCodec | null;
	serveUrl: string;
	concurrency?: number | string | null;
};

type Await<T> = T extends PromiseLike<infer U> ? U : T;

type RenderMediaResult = {
	buffer: Buffer | null;
	slowestFrames: SlowFrame[];
};

export const internalRenderMedia = ({
	proResProfile,
	crf,
	composition,
	inputProps,
	pixelFormat,
	codec,
	envVariables,
	frameRange,
	puppeteerInstance,
	outputLocation,
	onProgress,
	overwrite,
	onDownload,
	dumpBrowserLogs,
	onBrowserLog,
	onStart,
	timeoutInMilliseconds,
	chromiumOptions,
	scale,
	browserExecutable,
	port,
	cancelSignal,
	muted,
	enforceAudioTrack,
	ffmpegOverride,
	audioBitrate,
	videoBitrate,
	audioCodec,
	concurrency,
	disallowParallelEncoding,
	everyNthFrame,
	imageFormat: provisionalImageFormat,
	indent,
	jpegQuality,
	numberOfGifLoops,
	onCtrlCExit,
	preferLossless,
	serveUrl,
	server: reusedServer,
	verbose,
}: InternalRenderMediaOptions): Promise<RenderMediaResult> => {
	validateJpegQuality(jpegQuality);
	validateQualitySettings({crf, codec, videoBitrate});
	validateBitrate(audioBitrate, 'audioBitrate');
	validateBitrate(videoBitrate, 'videoBitrate');

	validateSelectedCodecAndProResCombination({
		codec,
		proResProfile,
	});
	validateSelectedPixelFormatAndCodecCombination(pixelFormat, codec);
	if (outputLocation) {
		validateOutputFilename({
			codec,
			audioCodec,
			extension: getExtensionOfFilename(outputLocation) as string,
			preferLossless,
		});
	}

	const absoluteOutputLocation = outputLocation
		? path.resolve(process.cwd(), outputLocation)
		: null;

	validateScale(scale);

	validateFfmpegOverride(ffmpegOverride);

	validateEveryNthFrame(everyNthFrame, codec);
	validateNumberOfGifLoops(numberOfGifLoops, codec);

	let stitchStage: StitchingState = 'encoding';
	let stitcherFfmpeg: ExecaChildProcess<string> | undefined;
	let preStitcher: Await<ReturnType<typeof prespawnFfmpeg>> | null = null;
	let encodedFrames = 0;
	let renderedFrames = 0;
	let renderedDoneIn: number | null = null;
	let encodedDoneIn: number | null = null;
	let cancelled = false;

	const renderStart = Date.now();

	const {estimatedUsage, freeMemory, hasEnoughMemory} =
		shouldUseParallelEncoding({
			height: composition.height,
			width: composition.width,
		});
	const parallelEncoding =
		!disallowParallelEncoding &&
		hasEnoughMemory &&
		canUseParallelEncoding(codec);

	Log.verboseAdvanced(
		{
			indent,
			logLevel: verbose ? 'verbose' : 'info',
			tag: 'renderMedia()',
		},
		'Free memory:',
		freeMemory,
		'Estimated usage parallel encoding',
		estimatedUsage
	);
	Log.verboseAdvanced(
		{
			indent,
			logLevel: verbose ? 'verbose' : 'info',
			tag: 'renderMedia()',
		},
		'Codec supports parallel rendering:',
		canUseParallelEncoding(codec)
	);
	Log.verboseAdvanced(
		{
			indent,
			logLevel: verbose ? 'verbose' : 'info',
			tag: 'renderMedia()',
		},
		'User disallowed parallel encoding:',
		Boolean(disallowParallelEncoding)
	);
	if (parallelEncoding) {
		Log.verboseAdvanced(
			{
				indent,
				logLevel: verbose ? 'verbose' : 'info',
				tag: 'renderMedia()',
			},
			'Parallel encoding is enabled.'
		);
	} else {
		Log.verboseAdvanced(
			{
				indent,
				logLevel: verbose ? 'verbose' : 'info',
				tag: 'renderMedia()',
			},
			'Parallel encoding is disabled.'
		);
	}

	const imageFormat: VideoImageFormat = isAudioCodec(codec)
		? 'none'
		: provisionalImageFormat;

	validateSelectedPixelFormatAndImageFormatCombination(
		pixelFormat,
		imageFormat
	);

	const workingDir = fs.mkdtempSync(
		path.join(os.tmpdir(), 'react-motion-render')
	);

	const preEncodedFileLocation = parallelEncoding
		? path.join(
				workingDir,
				'pre-encode.' + getFileExtensionFromCodec(codec, audioCodec)
		  )
		: null;

	if (onCtrlCExit && workingDir) {
		onCtrlCExit(() => deleteDirectory(workingDir));
	}

	validateEvenDimensionsWithCodec({
		codec,
		height: composition.height,
		scale,
		width: composition.width,
	});

	const callUpdate = () => {
		onProgress?.({
			encodedDoneIn,
			encodedFrames,
			renderedDoneIn,
			renderedFrames,
			stitchStage,
			progress:
				Math.round(
					((0.7 * renderedFrames + 0.3 * encodedFrames) /
						composition.durationInFrames) *
						100
				) / 100,
		});
	};

	const realFrameRange = getRealFrameRange(
		composition.durationInFrames,
		frameRange
	);

	const cancelRenderFrames = makeCancelSignal();
	const cancelPrestitcher = makeCancelSignal();
	const cancelStitcher = makeCancelSignal();

	cancelSignal?.(() => {
		cancelRenderFrames.cancel();
	});

	const {waitForRightTimeOfFrameToBeInserted, setFrameToStitch, waitForFinish} =
		ensureFramesInOrder(realFrameRange);

	const fps = composition.fps / everyNthFrame;
	Internals.validateFps(fps, 'in "renderMedia()"', codec === 'gif');

	const createPrestitcherIfNecessary = () => {
		if (preEncodedFileLocation) {
			preStitcher = prespawnFfmpeg({
				width: composition.width * scale,
				height: composition.height * scale,
				fps,
				outputLocation: preEncodedFileLocation,
				pixelFormat,
				codec,
				proResProfile,
				crf,
				onProgress: (frame: number) => {
					encodedFrames = frame;
					callUpdate();
				},
				verbose,
				imageFormat,
				signal: cancelPrestitcher.cancelSignal,
				ffmpegOverride: ffmpegOverride ?? (({args}) => args),
				videoBitrate,
				indent,
			});
			stitcherFfmpeg = preStitcher.task;
		}
	};

	const waitForPrestitcherIfNecessary = async () => {
		if (stitcherFfmpeg) {
			await waitForFinish();
			stitcherFfmpeg?.stdin?.end();
			try {
				await stitcherFfmpeg;
			} catch (err) {
				throw new Error(preStitcher?.getLogs());
			}
		}
	};

	const mediaSupport = codecSupportsMedia(codec);
	const disableAudio = !mediaSupport.audio || muted;

	const slowestFrames: SlowFrame[] = [];
	let maxTime = 0;
	let minTime = 0;

	const recordFrameTime = (frameIndex: number, time: number) => {
		const frameTime: SlowFrame = {frame: frameIndex, time};

		if (time < minTime && slowestFrames.length === SLOWEST_FRAME_COUNT) {
			return;
		}

		if (time > maxTime) {
			// add at starting;
			slowestFrames.unshift(frameTime);
			maxTime = time;
		} else {
			// add frame at appropriate position
			const index = slowestFrames.findIndex(
				({time: indexTime}) => indexTime < time
			);
			slowestFrames.splice(index, 0, frameTime);
		}

		if (slowestFrames.length > SLOWEST_FRAME_COUNT) {
			slowestFrames.pop();
		}

		minTime = slowestFrames[slowestFrames.length - 1]?.time ?? minTime;
	};

	let cleanupServerFn: (force: boolean) => Promise<unknown> = () =>
		Promise.resolve(undefined);

	const happyPath = new Promise<RenderMediaResult>((resolve, reject) => {
		Promise.resolve(createPrestitcherIfNecessary())
			.then(() => {
				return makeOrReuseServer(
					reusedServer,
					{
						concurrency: getActualConcurrency(concurrency),
						indent,
						port,
						remotionRoot: findRemotionRoot(),
						verbose,
						webpackConfigOrServeUrl: serveUrl,
					},
					{
						onDownload,
						onError: (err) => reject(err),
					}
				);
			})
			.then(({server, cleanupServer}) => {
				cleanupServerFn = cleanupServer;
				const renderFramesProc = internalRenderFrames({
					composition,
					onFrameUpdate: (
						frame: number,
						frameIndex: number,
						timeToRenderInMilliseconds
					) => {
						renderedFrames = frame;
						callUpdate();
						recordFrameTime(frameIndex, timeToRenderInMilliseconds);
					},
					concurrency,
					outputDir: parallelEncoding ? null : workingDir,
					onStart: (data) => {
						renderedFrames = 0;
						callUpdate();
						onStart?.(data);
					},
					inputProps,
					envVariables,
					imageFormat,
					jpegQuality,
					frameRange,
					puppeteerInstance,
					everyNthFrame,
					onFrameBuffer: parallelEncoding
						? async (buffer, frame) => {
								await waitForRightTimeOfFrameToBeInserted(frame);
								if (cancelled) {
									return;
								}

								const id = startPerfMeasure('piping');
								stitcherFfmpeg?.stdin?.write(buffer);
								stopPerfMeasure(id);

								setFrameToStitch(
									Math.min(realFrameRange[1] + 1, frame + everyNthFrame)
								);
						  }
						: null,
					webpackBundleOrServeUrl: serveUrl,
					dumpBrowserLogs,
					onBrowserLog,
					onDownload,
					timeoutInMilliseconds,
					chromiumOptions,
					scale,
					browserExecutable,
					port,
					cancelSignal: cancelRenderFrames.cancelSignal,
					muted: disableAudio,
					verbose,
					indent,
					server,
				});

				return renderFramesProc;
			})
			.then((renderFramesReturn) => {
				return Promise.all([
					renderFramesReturn,
					waitForPrestitcherIfNecessary(),
				]);
			})
			.then(([{assetsInfo}]) => {
				renderedDoneIn = Date.now() - renderStart;
				callUpdate();

				if (absoluteOutputLocation) {
					ensureOutputDirectory(absoluteOutputLocation);
				}

				const stitchStart = Date.now();
				return Promise.all([
					internalStitchFramesToVideo({
						width: composition.width * scale,
						height: composition.height * scale,
						fps,
						outputLocation: absoluteOutputLocation,
						preEncodedFileLocation,
						preferLossless,
						indent,
						force: overwrite,
						pixelFormat,
						codec,
						proResProfile,
						crf,
						assetsInfo,
						onProgress: (frame: number) => {
							stitchStage = 'muxing';
							encodedFrames = frame;
							callUpdate();
						},
						onDownload,
						numberOfGifLoops,
						verbose,
						dir: workingDir,
						cancelSignal: cancelStitcher.cancelSignal,
						muted: disableAudio,
						enforceAudioTrack,
						ffmpegOverride: ffmpegOverride ?? null,
						audioBitrate,
						videoBitrate,
						audioCodec,
					}),
					stitchStart,
				]);
			})
			.then(([buffer, stitchStart]) => {
				encodedFrames = getFramesToRender(realFrameRange, everyNthFrame).length;
				encodedDoneIn = Date.now() - stitchStart;
				callUpdate();
				slowestFrames.sort((a, b) => b.time - a.time);
				const result: RenderMediaResult = {
					buffer,
					slowestFrames,
				};
				resolve(result);
			})
			.catch((err) => {
				/**
				 * When an error is thrown in renderFrames(...) (e.g., when delayRender() is used incorrectly), fs.unlinkSync(...) throws an error that the file is locked because ffmpeg is still running, and renderMedia returns it.
				 * Therefore we first kill the FFMPEG process before deleting the file
				 */
				cancelled = true;
				cancelRenderFrames.cancel();
				cancelStitcher.cancel();
				cancelPrestitcher.cancel();
				if (stitcherFfmpeg !== undefined && stitcherFfmpeg.exitCode === null) {
					const promise = new Promise<void>((res) => {
						setTimeout(() => {
							res();
						}, 2000);
						(stitcherFfmpeg as ExecaChildProcess<string>).on('close', res);
					});
					stitcherFfmpeg.kill();
					return promise.then(() => {
						reject(err);
					});
				}

				reject(err);
			})
			.finally(() => {
				if (
					preEncodedFileLocation !== null &&
					fs.existsSync(preEncodedFileLocation)
				) {
					deleteDirectory(path.dirname(preEncodedFileLocation));
				}

				// Clean temporary image frames when rendering ends or fails
				if (workingDir && fs.existsSync(workingDir)) {
					deleteDirectory(workingDir);
				}

				cleanupServerFn?.(false);
			});
	});

	return Promise.race([
		happyPath,
		new Promise<RenderMediaResult>((_resolve, reject) => {
			cancelSignal?.(() => {
				reject(new Error(cancelErrorMessages.renderMedia));
			});
		}),
	]);
};

/**
 *
 * @description Render a video from a composition
 * @see [Documentation](https://www.remotion.dev/docs/renderer/render-media)
 */
export const renderMedia = ({
	proResProfile,
	crf,
	composition,
	inputProps,
	pixelFormat,
	codec,
	envVariables,
	frameRange,
	puppeteerInstance,
	outputLocation,
	onProgress,
	overwrite,
	onDownload,
	dumpBrowserLogs,
	onBrowserLog,
	onStart,
	timeoutInMilliseconds,
	chromiumOptions,
	scale,
	browserExecutable,
	port,
	cancelSignal,
	muted,
	enforceAudioTrack,
	ffmpegOverride,
	audioBitrate,
	videoBitrate,
	audioCodec,
	jpegQuality,
	concurrency,
	serveUrl,
	disallowParallelEncoding,
	everyNthFrame,
	imageFormat,
	numberOfGifLoops,
	preferLossless,
	verbose,
	quality,
}: RenderMediaOptions): Promise<RenderMediaResult> => {
	if (quality !== undefined) {
		console.warn(
			`The "quality" option has been renamed. Please use "jpegQuality" instead.`
		);
	}

	return internalRenderMedia({
		proResProfile: proResProfile ?? undefined,
		codec,
		composition,
		serveUrl,
		audioBitrate: audioBitrate ?? null,
		audioCodec: audioCodec ?? null,
		browserExecutable: browserExecutable ?? null,
		cancelSignal,
		chromiumOptions: chromiumOptions ?? {},
		concurrency: concurrency ?? null,
		crf: crf ?? null,
		disallowParallelEncoding: disallowParallelEncoding ?? false,
		dumpBrowserLogs: dumpBrowserLogs ?? false,
		enforceAudioTrack: enforceAudioTrack ?? false,
		envVariables: envVariables ?? {},
		everyNthFrame: everyNthFrame ?? 1,
		ffmpegOverride: ffmpegOverride ?? undefined,
		frameRange: frameRange ?? null,
		imageFormat: imageFormat ?? DEFAULT_VIDEO_IMAGE_FORMAT,
		inputProps: inputProps ?? {},
		jpegQuality: jpegQuality ?? quality ?? DEFAULT_JPEG_QUALITY,
		muted: muted ?? false,
		numberOfGifLoops: numberOfGifLoops ?? null,
		onBrowserLog: onBrowserLog ?? null,
		onDownload: onDownload ?? (() => undefined),
		onProgress: onProgress ?? (() => undefined),
		onStart: onStart ?? (() => undefined),
		outputLocation: outputLocation ?? null,
		overwrite: overwrite ?? DEFAULT_OVERWRITE,
		pixelFormat: pixelFormat ?? DEFAULT_PIXEL_FORMAT,
		port: port ?? null,
		puppeteerInstance: puppeteerInstance ?? undefined,
		scale: scale ?? 1,
		timeoutInMilliseconds: timeoutInMilliseconds ?? DEFAULT_TIMEOUT,
		videoBitrate: videoBitrate ?? null,
		verbose: verbose ?? false,
		preferLossless: preferLossless ?? false,
		indent: false,
		onCtrlCExit: () => undefined,
		server: undefined,
	});
};
