import fs from 'node:fs';
import path from 'node:path';

import type {AudioOrVideoAsset, VideoConfig} from 'remotion/no-react';
import {NoReactInternals} from 'remotion/no-react';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import type {DownloadMap} from './assets/download-map';
import {DEFAULT_BROWSER} from './browser';
import type {BrowserExecutable} from './browser-executable';
import type {BrowserLog} from './browser-log';
import type {HeadlessBrowser} from './browser/Browser';
import type {Page} from './browser/BrowserPage';
import {DEFAULT_TIMEOUT} from './browser/TimeoutSettings';
import {defaultBrowserDownloadProgress} from './browser/browser-download-progress-bar';
import {isTargetClosedErr} from './browser/flaky-errors';
import type {SourceMapGetter} from './browser/source-map-getter';
import {getShouldUsePartitionedRendering} from './can-use-parallel-encoding';
import {cycleBrowserTabs} from './cycle-browser-tabs';
import {findRemotionRoot} from './find-closest-package-json';
import type {FrameRange} from './frame-range';
import {resolveConcurrency} from './get-concurrency';
import {getFramesToRender} from './get-duration-from-frame-range';
import {getExtraFramesToCapture} from './get-extra-frames-to-capture';
import type {CountType} from './get-frame-padded-index';
import {getFilePadLength} from './get-frame-padded-index';
import {getRealFrameRange} from './get-frame-to-render';
import type {VideoImageFormat} from './image-format';
import {DEFAULT_JPEG_QUALITY, validateJpegQuality} from './jpeg-quality';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {CancelSignal} from './make-cancel-signal';
import {cancelErrorMessages} from './make-cancel-signal';
import {makePage} from './make-page';
import {
	nextFrameToRenderState,
	partitionedNextFrameToRenderState,
} from './next-frame-to-render';
import type {ChromiumOptions} from './open-browser';
import {internalOpenBrowser} from './open-browser';
import {DEFAULT_RENDER_FRAMES_OFFTHREAD_VIDEO_THREADS} from './options/offthreadvideo-threads';
import type {ToOptions} from './options/option';
import type {optionsMap} from './options/options-map';
import {Pool} from './pool';
import type {RemotionServer} from './prepare-server';
import {makeOrReuseServer} from './prepare-server';
import {renderFrameAndRetryTargetClose} from './render-frame-and-retry-target-close';
import type {BrowserReplacer} from './replace-browser';
import {handleBrowserCrash} from './replace-browser';
import type {EmittedArtifact} from './serialize-artifact';
import type {OnStartData, RenderFramesOutput} from './types';
import {
	validateDimension,
	validateDurationInFrames,
	validateFps,
} from './validate';
import {validateScale} from './validate-scale';
import {wrapWithErrorHandling} from './wrap-with-error-handling';

const MAX_RETRIES_PER_FRAME = 1;

export type OnArtifact = (asset: EmittedArtifact) => void;

type InternalRenderFramesOptions = {
	onStart: null | ((data: OnStartData) => void);
	onFrameUpdate:
		| null
		| ((
				framesRendered: number,
				frameIndex: number,
				timeToRenderInMilliseconds: number,
		  ) => void);
	outputDir: string | null;
	envVariables: Record<string, string>;
	imageFormat: VideoImageFormat;
	jpegQuality: number;
	frameRange: FrameRange | null;
	everyNthFrame: number;
	puppeteerInstance: HeadlessBrowser | undefined;
	browserExecutable: BrowserExecutable | null;
	onBrowserLog: null | ((log: BrowserLog) => void);
	onFrameBuffer: null | ((buffer: Buffer, frame: number) => void);
	onDownload: RenderMediaOnDownload | null;
	chromiumOptions: ChromiumOptions;
	scale: number;
	port: number | null;
	cancelSignal: CancelSignal | undefined;
	composition: Omit<VideoConfig, 'props' | 'defaultProps'>;
	indent: boolean;
	server: RemotionServer | undefined;
	muted: boolean;
	concurrency: number | string | null;
	webpackBundleOrServeUrl: string;
	serializedInputPropsWithCustomSchema: string;
	serializedResolvedPropsWithCustomSchema: string;
	parallelEncodingEnabled: boolean;
	compositionStart: number;
	onArtifact: OnArtifact | null;
} & ToOptions<typeof optionsMap.renderFrames>;

type InnerRenderFramesOptions = {
	onStart: null | ((data: OnStartData) => void);
	onFrameUpdate:
		| null
		| ((
				framesRendered: number,
				frameIndex: number,
				timeToRenderInMilliseconds: number,
		  ) => void);
	outputDir: string | null;
	envVariables: Record<string, string>;
	imageFormat: VideoImageFormat;
	frameRange: FrameRange | null;
	everyNthFrame: number;
	onBrowserLog: null | ((log: BrowserLog) => void);
	onFrameBuffer: null | ((buffer: Buffer, frame: number) => void);
	onArtifact: OnArtifact | null;
	onDownload: RenderMediaOnDownload | null;
	timeoutInMilliseconds: number;
	scale: number;
	cancelSignal: CancelSignal | undefined;
	composition: Omit<VideoConfig, 'props' | 'defaultProps'>;
	muted: boolean;
	onError: (err: Error) => void;
	pagesArray: Page[];
	resolvedConcurrency: number;
	proxyPort: number;
	downloadMap: DownloadMap;
	makeBrowser: () => Promise<HeadlessBrowser>;
	browserReplacer: BrowserReplacer;
	sourceMapGetter: SourceMapGetter;
	serveUrl: string;
	indent: boolean;
	serializedInputPropsWithCustomSchema: string;
	serializedResolvedPropsWithCustomSchema: string;
	parallelEncodingEnabled: boolean;
	compositionStart: number;
	binariesDirectory: string | null;
} & ToOptions<typeof optionsMap.renderFrames>;

type ArtifactWithoutContent = {
	frame: number;
	filename: string;
};

export type FrameAndAssets = {
	frame: number;
	audioAndVideoAssets: AudioOrVideoAsset[];
	artifactAssets: ArtifactWithoutContent[];
};

export type RenderFramesOptions = {
	onStart: (data: OnStartData) => void;
	onFrameUpdate: (
		framesRendered: number,
		frameIndex: number,
		timeToRenderInMilliseconds: number,
	) => void;
	outputDir: string | null;
	inputProps: Record<string, unknown>;
	envVariables?: Record<string, string>;
	imageFormat?: VideoImageFormat;
	/**
	 * @deprecated Renamed to "jpegQuality"
	 */
	quality?: never;
	frameRange?: FrameRange | null;
	everyNthFrame?: number;
	/**
	 * @deprecated Use "logLevel": "verbose" instead
	 */
	dumpBrowserLogs?: boolean;
	/**
	 * @deprecated Use "logLevel" instead
	 */
	verbose?: boolean;
	puppeteerInstance?: HeadlessBrowser;
	browserExecutable?: BrowserExecutable;
	onBrowserLog?: (log: BrowserLog) => void;
	onFrameBuffer?: (buffer: Buffer, frame: number) => void;
	onDownload?: RenderMediaOnDownload;
	timeoutInMilliseconds?: number;
	chromiumOptions?: ChromiumOptions;
	scale?: number;
	port?: number | null;
	cancelSignal?: CancelSignal;
	composition: VideoConfig;
	muted?: boolean;
	concurrency?: number | string | null;
	onArtifact?: OnArtifact | null;
	serveUrl: string;
} & Partial<ToOptions<typeof optionsMap.renderFrames>>;

const innerRenderFrames = async ({
	onFrameUpdate,
	outputDir,
	onStart,
	serializedInputPropsWithCustomSchema,
	serializedResolvedPropsWithCustomSchema,
	jpegQuality,
	imageFormat,
	frameRange,
	onError,
	envVariables,
	onBrowserLog,
	onFrameBuffer,
	onDownload,
	pagesArray,
	serveUrl,
	composition,
	timeoutInMilliseconds,
	scale,
	resolvedConcurrency,
	everyNthFrame,
	proxyPort,
	cancelSignal,
	downloadMap,
	muted,
	makeBrowser,
	browserReplacer,
	sourceMapGetter,
	logLevel,
	indent,
	parallelEncodingEnabled,
	compositionStart,
	forSeamlessAacConcatenation,
	onArtifact,
	binariesDirectory,
}: Omit<
	InnerRenderFramesOptions,
	'offthreadVideoCacheSizeInBytes'
>): Promise<RenderFramesOutput> => {
	if (outputDir) {
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, {
				recursive: true,
			});
		}
	}

	const downloadPromises: Promise<unknown>[] = [];

	const realFrameRange = getRealFrameRange(
		composition.durationInFrames,
		frameRange,
	);

	const {
		extraFramesToCaptureAssetsBackend,
		extraFramesToCaptureAssetsFrontend,
		chunkLengthInSeconds,
		trimLeftOffset,
		trimRightOffset,
	} = getExtraFramesToCapture({
		fps: composition.fps,
		compositionStart,
		realFrameRange,
		forSeamlessAacConcatenation,
	});

	const framesToRender = getFramesToRender(realFrameRange, everyNthFrame);
	const lastFrame = framesToRender[framesToRender.length - 1];

	const concurrencyOrFramesToRender = Math.min(
		framesToRender.length,
		resolvedConcurrency,
	);

	const makeNewPage = (frame: number, pageIndex: number) => {
		return makePage({
			context: sourceMapGetter,
			initialFrame: frame,
			browserReplacer,
			indent,
			logLevel,
			onBrowserLog,
			pagesArray,
			scale,
			composition,
			envVariables,
			imageFormat,
			muted,
			proxyPort,
			serializedInputPropsWithCustomSchema,
			serializedResolvedPropsWithCustomSchema,
			serveUrl,
			timeoutInMilliseconds,
			pageIndex,
		});
	};

	const getPool = async () => {
		const pages = new Array(concurrencyOrFramesToRender)
			.fill(true)
			// TODO: Change different initial frame
			.map((_, i) => makeNewPage(framesToRender[i], i));
		const puppeteerPages = await Promise.all(pages);
		const pool = new Pool(puppeteerPages);
		return pool;
	};

	// If rendering a GIF and skipping frames, we must ensure it starts from 0
	// and then is consecutive so FFMPEG recognizes the sequence
	const countType: CountType =
		everyNthFrame === 1 ? 'actual-frames' : 'from-zero';

	const filePadLength = getFilePadLength({
		lastFrame,
		totalFrames: framesToRender.length,
		countType,
	});
	const framesRenderedObj = {
		count: 0,
	};

	const poolPromise = getPool();

	onStart?.({
		frameCount: framesToRender.length,
		parallelEncoding: parallelEncodingEnabled,
		resolvedConcurrency,
	});

	const assets: FrameAndAssets[] = [];
	const stoppedSignal = {stopped: false};
	cancelSignal?.(() => {
		stoppedSignal.stopped = true;
	});

	const frameDir = outputDir ?? downloadMap.compositingDir;

	// Render the extra frames at the beginning of the video first,
	// then the regular frames, then the extra frames at the end of the video.
	// While the order technically doesn't matter, components such as <Video> are
	// not always frame perfect and give a flicker.
	// We reduce the chance of flicker by rendering the frames in order.

	const allFramesAndExtraFrames = [
		...extraFramesToCaptureAssetsFrontend,
		...framesToRender,
		...extraFramesToCaptureAssetsBackend,
	];

	const shouldUsePartitionedRendering = getShouldUsePartitionedRendering();

	if (shouldUsePartitionedRendering) {
		Log.info(
			{indent, logLevel},
			'Experimental: Using partitioned rendering (https://github.com/remotion-dev/remotion/pull/4830)',
		);
	}

	const nextFrameToRender = shouldUsePartitionedRendering
		? partitionedNextFrameToRenderState({
				allFramesAndExtraFrames,
				concurrencyOrFramesToRender,
			})
		: nextFrameToRenderState({
				allFramesAndExtraFrames,
				concurrencyOrFramesToRender,
			});

	await Promise.all(
		allFramesAndExtraFrames.map(() => {
			return renderFrameAndRetryTargetClose({
				retriesLeft: MAX_RETRIES_PER_FRAME,
				attempt: 1,
				assets,
				binariesDirectory,
				cancelSignal,
				composition,
				countType,
				downloadMap,
				frameDir,
				framesToRender,
				imageFormat,
				indent,
				jpegQuality,
				logLevel,
				onArtifact,
				onDownload,
				onError,
				outputDir,
				poolPromise,
				scale,
				stoppedSignal,
				timeoutInMilliseconds,
				makeBrowser,
				browserReplacer,
				concurrencyOrFramesToRender,
				framesRenderedObj,
				lastFrame,
				makeNewPage,
				onFrameBuffer,
				onFrameUpdate,
				nextFrameToRender,
			});
		}),
	);

	const firstFrameIndex = countType === 'from-zero' ? 0 : framesToRender[0];

	await Promise.all(downloadPromises);
	return {
		assetsInfo: {
			assets: assets.sort((a, b) => {
				return a.frame - b.frame;
			}),
			imageSequenceName: path.join(
				frameDir,
				`element-%0${filePadLength}d.${imageFormat}`,
			),
			firstFrameIndex,
			downloadMap,
			trimLeftOffset,
			trimRightOffset,
			chunkLengthInSeconds,
			forSeamlessAacConcatenation,
		},
		frameCount: framesToRender.length,
	};
};

type CleanupFn = () => Promise<unknown>;

const internalRenderFramesRaw = ({
	browserExecutable,
	cancelSignal,
	chromiumOptions,
	composition,
	concurrency,
	envVariables,
	everyNthFrame,
	frameRange,
	imageFormat,
	indent,
	jpegQuality,
	muted,
	onBrowserLog,
	onDownload,
	onFrameBuffer,
	onFrameUpdate,
	onStart,
	outputDir,
	port,
	puppeteerInstance,
	scale,
	server,
	timeoutInMilliseconds,
	logLevel,
	webpackBundleOrServeUrl,
	serializedInputPropsWithCustomSchema,
	serializedResolvedPropsWithCustomSchema,
	offthreadVideoCacheSizeInBytes,
	parallelEncodingEnabled,
	binariesDirectory,
	forSeamlessAacConcatenation,
	compositionStart,
	onBrowserDownload,
	onArtifact,
	chromeMode,
	offthreadVideoThreads,
}: InternalRenderFramesOptions): Promise<RenderFramesOutput> => {
	validateDimension(
		composition.height,
		'height',
		'in the `config` object passed to `renderFrames()`',
	);
	validateDimension(
		composition.width,
		'width',
		'in the `config` object passed to `renderFrames()`',
	);
	validateFps(
		composition.fps,
		'in the `config` object of `renderFrames()`',
		false,
	);
	validateDurationInFrames(composition.durationInFrames, {
		component: 'in the `config` object passed to `renderFrames()`',
		allowFloats: false,
	});

	validateJpegQuality(jpegQuality);
	validateScale(scale);

	const makeBrowser = () =>
		internalOpenBrowser({
			browser: DEFAULT_BROWSER,
			browserExecutable,
			chromiumOptions,
			forceDeviceScaleFactor: scale,
			indent,
			viewport: null,
			logLevel,
			onBrowserDownload,
			chromeMode,
		});

	const browserInstance = puppeteerInstance ?? makeBrowser();

	const resolvedConcurrency = resolveConcurrency(concurrency);

	const openedPages: Page[] = [];

	return new Promise<RenderFramesOutput>((resolve, reject) => {
		const cleanup: CleanupFn[] = [];

		const onError = (err: Error) => {
			reject(err);
		};

		Promise.race([
			new Promise<RenderFramesOutput>((_, rej) => {
				cancelSignal?.(() => {
					rej(new Error(cancelErrorMessages.renderFrames));
				});
			}),
			Promise.all([
				makeOrReuseServer(
					server,
					{
						webpackConfigOrServeUrl: webpackBundleOrServeUrl,
						port,
						remotionRoot: findRemotionRoot(),
						offthreadVideoThreads:
							offthreadVideoThreads ??
							DEFAULT_RENDER_FRAMES_OFFTHREAD_VIDEO_THREADS,
						logLevel,
						indent,
						offthreadVideoCacheSizeInBytes,
						binariesDirectory,
						forceIPv4: false,
					},
					{
						onDownload,
					},
				),
				browserInstance,
			]).then(([{server: openedServer, cleanupServer}, pInstance]) => {
				const {serveUrl, offthreadPort, sourceMap, downloadMap} = openedServer;

				const browserReplacer = handleBrowserCrash(pInstance, logLevel, indent);

				const cycle = cycleBrowserTabs({
					puppeteerInstance: browserReplacer,
					concurrency: resolvedConcurrency,
					logLevel,
					indent,
				});
				cleanup.push(() => {
					cycle.stopCycling();
					return Promise.resolve();
				});
				cleanup.push(() => cleanupServer(false));

				return innerRenderFrames({
					onError,
					pagesArray: openedPages,
					serveUrl,
					composition,
					resolvedConcurrency,
					onDownload,
					proxyPort: offthreadPort,
					makeBrowser,
					browserReplacer,
					sourceMapGetter: sourceMap,
					downloadMap,
					cancelSignal,
					envVariables,
					everyNthFrame,
					frameRange,
					imageFormat,
					jpegQuality,
					muted,
					onBrowserLog,
					onFrameBuffer,
					onFrameUpdate,
					onStart,
					outputDir,
					scale,
					timeoutInMilliseconds,
					logLevel,
					indent,
					serializedInputPropsWithCustomSchema,
					serializedResolvedPropsWithCustomSchema,
					parallelEncodingEnabled,
					binariesDirectory,
					forSeamlessAacConcatenation,
					compositionStart,
					onBrowserDownload,
					onArtifact,
					chromeMode,
					offthreadVideoThreads,
				});
			}),
		])
			.then((res) => {
				server?.compositor
					.executeCommand('CloseAllVideos', {})
					.then(() => {
						Log.verbose(
							{indent, logLevel, tag: 'compositor'},
							'Freed memory from compositor',
						);
					})
					.catch((err) => {
						Log.verbose({indent, logLevel}, 'Could not close compositor', err);
					});
				return resolve(res);
			})
			.catch((err) => reject(err))
			.finally(() => {
				// If browser instance was passed in, we close all the pages
				// we opened.
				// If new browser was opened, then closing the browser as a cleanup.

				if (puppeteerInstance) {
					Promise.all(openedPages.map((p) => p.close())).catch((err) => {
						if (isTargetClosedErr(err)) {
							return;
						}

						Log.error({indent, logLevel}, 'Unable to close browser tab', err);
					});
				} else {
					Promise.resolve(browserInstance)
						.then((instance) => {
							return instance.close({silent: true});
						})
						.catch((err) => {
							if (
								!(err as Error | undefined)?.message.includes('Target closed')
							) {
								Log.error({indent, logLevel}, 'Unable to close browser', err);
							}
						});
				}

				cleanup.forEach((c) => {
					c();
				});
				// Don't clear download dir because it might be used by stitchFramesToVideo
			});
	});
};

export const internalRenderFrames = wrapWithErrorHandling(
	internalRenderFramesRaw,
);

/*
 * @description Renders a series of images using Puppeteer and computes information for mixing audio.
 * @see [Documentation](https://www.remotion.dev/docs/renderer/render-frames)
 */
export const renderFrames = (
	options: RenderFramesOptions,
): Promise<RenderFramesOutput> => {
	const {
		composition,
		inputProps,
		onFrameUpdate,
		onStart,
		outputDir,
		serveUrl,
		browserExecutable,
		cancelSignal,
		chromiumOptions,
		concurrency,
		dumpBrowserLogs,
		envVariables,
		everyNthFrame,
		frameRange,
		imageFormat,
		jpegQuality,
		muted,
		onBrowserLog,
		onDownload,
		onFrameBuffer,
		port,
		puppeteerInstance,
		scale,
		timeoutInMilliseconds,
		verbose,
		quality,
		logLevel: passedLogLevel,
		offthreadVideoCacheSizeInBytes,
		binariesDirectory,
		onBrowserDownload,
		onArtifact,
		chromeMode,
		offthreadVideoThreads,
	} = options;

	if (!composition) {
		throw new Error(
			'No `composition` option has been specified for renderFrames()',
		);
	}

	if (typeof jpegQuality !== 'undefined' && imageFormat !== 'jpeg') {
		throw new Error(
			"You can only pass the `quality` option if `imageFormat` is 'jpeg'.",
		);
	}

	const logLevel: LogLevel =
		verbose || dumpBrowserLogs ? 'verbose' : (passedLogLevel ?? 'info');
	const indent = false;

	if (quality) {
		Log.warn(
			{indent, logLevel},
			'Passing `quality()` to `renderStill` is deprecated. Use `jpegQuality` instead.',
		);
	}

	return internalRenderFrames({
		browserExecutable: browserExecutable ?? null,
		cancelSignal,
		chromiumOptions: chromiumOptions ?? {},
		composition,
		concurrency: concurrency ?? null,
		envVariables: envVariables ?? {},
		everyNthFrame: everyNthFrame ?? 1,
		frameRange: frameRange ?? null,
		imageFormat: imageFormat ?? 'jpeg',
		indent,
		jpegQuality: jpegQuality ?? DEFAULT_JPEG_QUALITY,
		onDownload: onDownload ?? null,
		serializedInputPropsWithCustomSchema:
			NoReactInternals.serializeJSONWithDate({
				indent: undefined,
				staticBase: null,
				data: inputProps ?? {},
			}).serializedString,
		serializedResolvedPropsWithCustomSchema:
			NoReactInternals.serializeJSONWithDate({
				indent: undefined,
				staticBase: null,
				data: composition.props,
			}).serializedString,
		puppeteerInstance,
		muted: muted ?? false,
		onBrowserLog: onBrowserLog ?? null,
		onFrameBuffer: onFrameBuffer ?? null,
		onFrameUpdate,
		onStart,
		outputDir,
		port: port ?? null,
		scale: scale ?? 1,
		logLevel,
		timeoutInMilliseconds: timeoutInMilliseconds ?? DEFAULT_TIMEOUT,
		webpackBundleOrServeUrl: serveUrl,
		server: undefined,
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes ?? null,
		parallelEncodingEnabled: false,
		binariesDirectory: binariesDirectory ?? null,
		compositionStart: 0,
		forSeamlessAacConcatenation: false,
		onBrowserDownload:
			onBrowserDownload ??
			defaultBrowserDownloadProgress({indent, logLevel, api: 'renderFrames()'}),
		onArtifact: onArtifact ?? null,
		chromeMode: chromeMode ?? 'headless-shell',
		offthreadVideoThreads: offthreadVideoThreads ?? null,
	});
};
