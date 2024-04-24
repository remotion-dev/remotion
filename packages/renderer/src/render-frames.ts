import fs from 'node:fs';
import path from 'node:path';
import {performance} from 'perf_hooks';
// eslint-disable-next-line no-restricted-imports
import type {TAsset} from 'remotion';
import type {VideoConfig} from 'remotion/no-react';
import {NoReactInternals} from 'remotion/no-react';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {downloadAndMapAssetsToFileUrl} from './assets/download-and-map-assets-to-file';
import type {DownloadMap} from './assets/download-map';
import {DEFAULT_BROWSER} from './browser';
import type {BrowserExecutable} from './browser-executable';
import type {BrowserLog} from './browser-log';
import type {HeadlessBrowser} from './browser/Browser';
import type {Page} from './browser/BrowserPage';
import type {ConsoleMessage} from './browser/ConsoleMessage';
import {DEFAULT_TIMEOUT} from './browser/TimeoutSettings';
import {defaultBrowserDownloadProgress} from './browser/browser-download-progress-bar';
import {isTargetClosedErr} from './browser/is-target-closed-err';
import type {SourceMapGetter} from './browser/source-map-getter';
import type {Codec} from './codec';
import type {Compositor} from './compositor/compositor';
import {compressAsset} from './compress-assets';
import {cycleBrowserTabs} from './cycle-browser-tabs';
import {handleJavascriptException} from './error-handling/handle-javascript-exception';
import {findRemotionRoot} from './find-closest-package-json';
import type {FrameRange} from './frame-range';
import {getActualConcurrency} from './get-concurrency';
import {getFramesToRender} from './get-duration-from-frame-range';
import {getExtraFramesToCapture} from './get-extra-frames-to-capture';
import type {CountType} from './get-frame-padded-index';
import {
	getFilePadLength,
	getFrameOutputFileName,
} from './get-frame-padded-index';
import {getRealFrameRange} from './get-frame-to-render';
import type {VideoImageFormat} from './image-format';
import {getRetriesLeftFromError} from './is-delay-render-error-with.retry';
import {DEFAULT_JPEG_QUALITY, validateJpegQuality} from './jpeg-quality';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {CancelSignal} from './make-cancel-signal';
import {cancelErrorMessages, isUserCancelledRender} from './make-cancel-signal';
import type {ChromiumOptions} from './open-browser';
import {internalOpenBrowser} from './open-browser';
import type {ToOptions} from './options/option';
import type {optionsMap} from './options/options-map';
import {startPerfMeasure, stopPerfMeasure} from './perf';
import {Pool} from './pool';
import type {RemotionServer} from './prepare-server';
import {makeOrReuseServer} from './prepare-server';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';
import type {BrowserReplacer} from './replace-browser';
import {handleBrowserCrash} from './replace-browser';
import {seekToFrame} from './seek-to-frame';
import {setPropsAndEnv} from './set-props-and-env';
import {takeFrameAndCompose} from './take-frame-and-compose';
import {truthy} from './truthy';
import type {OnStartData, RenderFramesOutput} from './types';
import {
	validateDimension,
	validateDurationInFrames,
	validateFps,
} from './validate';
import {validateScale} from './validate-scale';
import {wrapWithErrorHandling} from './wrap-with-error-handling';

const MAX_RETRIES_PER_FRAME = 1;

export type InternalRenderFramesOptions = {
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
	onDownload: RenderMediaOnDownload | null;
	timeoutInMilliseconds: number;
	scale: number;
	cancelSignal: CancelSignal | undefined;
	composition: Omit<VideoConfig, 'props' | 'defaultProps'>;
	muted: boolean;
	onError: (err: Error) => void;
	pagesArray: Page[];
	actualConcurrency: number;
	proxyPort: number;
	downloadMap: DownloadMap;
	makeBrowser: () => Promise<HeadlessBrowser>;
	browserReplacer: BrowserReplacer;
	compositor: Compositor;
	sourceMapGetter: SourceMapGetter;
	serveUrl: string;
	indent: boolean;
	serializedInputPropsWithCustomSchema: string;
	serializedResolvedPropsWithCustomSchema: string;
	parallelEncodingEnabled: boolean;
	compositionStart: number;
} & ToOptions<typeof optionsMap.renderFrames>;

export type FrameAndAssets = {
	frame: number;
	assets: TAsset[];
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
	actualConcurrency: concurrency,
	everyNthFrame,
	proxyPort,
	cancelSignal,
	downloadMap,
	muted,
	makeBrowser,
	browserReplacer,
	compositor,
	sourceMapGetter,
	logLevel,
	indent,
	parallelEncodingEnabled,
	compositionStart,
	forSeamlessAacConcatenation,
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

	const makePage = async (context: SourceMapGetter) => {
		const page = await browserReplacer
			.getBrowser()
			.newPage(context, logLevel, indent);
		pagesArray.push(page);
		await page.setViewport({
			width: composition.width,
			height: composition.height,
			deviceScaleFactor: scale,
		});

		const logCallback = (log: ConsoleMessage) => {
			onBrowserLog?.({
				stackTrace: log.stackTrace(),
				text: log.text,
				type: log.type,
			});
		};

		if (onBrowserLog) {
			page.on('console', logCallback);
		}

		const initialFrame = realFrameRange[0];

		await setPropsAndEnv({
			serializedInputPropsWithCustomSchema,
			envVariables,
			page,
			serveUrl,
			initialFrame,
			timeoutInMilliseconds,
			proxyPort,
			retriesRemaining: 2,
			audioEnabled: !muted,
			videoEnabled: imageFormat !== 'none',
			indent,
			logLevel,
		});

		await puppeteerEvaluateWithCatch({
			// eslint-disable-next-line max-params
			pageFunction: (
				id: string,
				props: string,
				durationInFrames: number,
				fps: number,
				height: number,
				width: number,
				defaultCodec: Codec,
			) => {
				window.remotion_setBundleMode({
					type: 'composition',
					compositionName: id,
					serializedResolvedPropsWithSchema: props,
					compositionDurationInFrames: durationInFrames,
					compositionFps: fps,
					compositionHeight: height,
					compositionWidth: width,
					compositionDefaultCodec: defaultCodec,
				});
			},
			args: [
				composition.id,
				serializedResolvedPropsWithCustomSchema,
				composition.durationInFrames,
				composition.fps,
				composition.height,
				composition.width,
				composition.defaultCodec,
			],
			frame: null,
			page,
			timeoutInMilliseconds,
		});

		page.off('console', logCallback);

		return page;
	};

	const concurrencyOrFramesToRender = Math.min(
		framesToRender.length,
		concurrency,
	);

	const getPool = async (context: SourceMapGetter) => {
		const pages = new Array(concurrencyOrFramesToRender)
			.fill(true)
			.map(() => makePage(context));
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
	let framesRendered = 0;

	const poolPromise = getPool(sourceMapGetter);

	onStart?.({
		frameCount: framesToRender.length,
		parallelEncoding: parallelEncodingEnabled,
	});

	const assets: FrameAndAssets[] = [];
	let stopped = false;
	cancelSignal?.(() => {
		stopped = true;
	});

	const frameDir = outputDir ?? downloadMap.compositingDir;

	const renderFrameWithOptionToReject = async ({
		frame,
		index,
		reject,
		width,
		height,
		compId,
		assetsOnly,
		attempt,
	}: {
		frame: number;
		index: number | null;
		reject: (err: Error) => void;
		width: number;
		height: number;
		compId: string;
		assetsOnly: boolean;
		attempt: number;
	}) => {
		const pool = await poolPromise;
		const freePage = await pool.acquire();

		if (stopped) {
			return reject(new Error('Render was stopped'));
		}

		const startTime = performance.now();

		const errorCallbackOnFrame = (err: Error) => {
			reject(err);
		};

		const cleanupPageError = handleJavascriptException({
			page: freePage,
			onError: errorCallbackOnFrame,
			frame,
		});
		freePage.on('error', errorCallbackOnFrame);

		const startSeeking = Date.now();

		await seekToFrame({
			frame,
			page: freePage,
			composition: compId,
			timeoutInMilliseconds,
			indent,
			logLevel,
			attempt,
		});

		const timeToSeek = Date.now() - startSeeking;
		if (timeToSeek > 1000) {
			Log.verbose(
				{indent, logLevel},
				`Seeking to frame ${frame} took ${timeToSeek}ms`,
			);
		}

		if (!outputDir && !onFrameBuffer && imageFormat !== 'none') {
			throw new Error(
				'Called renderFrames() without specifying either `outputDir` or `onFrameBuffer`',
			);
		}

		if (outputDir && onFrameBuffer && imageFormat !== 'none') {
			throw new Error(
				'Pass either `outputDir` or `onFrameBuffer` to renderFrames(), not both.',
			);
		}

		const id = startPerfMeasure('save');

		const {buffer, collectedAssets} = await takeFrameAndCompose({
			frame,
			freePage,
			height,
			imageFormat: assetsOnly ? 'none' : imageFormat,
			output:
				index === null
					? null
					: path.join(
							frameDir,
							getFrameOutputFileName({
								frame,
								imageFormat,
								index,
								countType,
								lastFrame,
								totalFrames: framesToRender.length,
							}),
						),
			jpegQuality,
			width,
			scale,
			downloadMap,
			wantsBuffer: Boolean(onFrameBuffer),
			compositor,
			timeoutInMilliseconds,
		});
		if (onFrameBuffer && !assetsOnly) {
			if (!buffer) {
				throw new Error('unexpected null buffer');
			}

			onFrameBuffer(buffer, frame);
		}

		stopPerfMeasure(id);

		const compressedAssets = collectedAssets.map((asset) =>
			compressAsset(
				assets
					.filter(truthy)
					.map((a) => a.assets)
					.flat(2),
				asset,
			),
		);
		assets.push({
			assets: compressedAssets,
			frame,
		});
		compressedAssets.forEach((renderAsset) => {
			downloadAndMapAssetsToFileUrl({
				renderAsset,
				onDownload,
				downloadMap,
				indent,
				logLevel,
			}).catch((err) => {
				onError(
					new Error(`Error while downloading asset: ${(err as Error).stack}`),
				);
			});
		});
		if (!assetsOnly) {
			framesRendered++;
			onFrameUpdate?.(framesRendered, frame, performance.now() - startTime);
		}

		cleanupPageError();
		freePage.off('error', errorCallbackOnFrame);
		pool.release(freePage);
	};

	const renderFrame = ({
		frame,
		index,
		assetsOnly,
		attempt,
	}: {
		frame: number;
		index: number | null;
		assetsOnly: boolean;
		attempt: number;
	}) => {
		return new Promise<void>((resolve, reject) => {
			renderFrameWithOptionToReject({
				frame,
				index,
				reject,
				width: composition.width,
				height: composition.height,
				compId: composition.id,
				assetsOnly,
				attempt,
			})
				.then(() => {
					resolve();
				})
				.catch((err) => {
					reject(err);
				});
		});
	};

	const renderFrameAndRetryTargetClose = async ({
		frame,
		index,
		retriesLeft,
		attempt,
		assetsOnly,
	}: {
		frame: number;
		index: number | null;
		retriesLeft: number;
		attempt: number;
		assetsOnly: boolean;
	}): Promise<void> => {
		try {
			await Promise.race([
				renderFrame({frame, index, assetsOnly, attempt}),
				new Promise((_, reject) => {
					cancelSignal?.(() => {
						reject(new Error(cancelErrorMessages.renderFrames));
					});
				}),
			]);
		} catch (err) {
			const isTargetClosedError = isTargetClosedErr(err as Error);
			const shouldRetryError = (err as Error).stack?.includes(
				NoReactInternals.DELAY_RENDER_RETRY_TOKEN,
			);

			if (isUserCancelledRender(err) && !shouldRetryError) {
				throw err;
			}

			if (!isTargetClosedError && !shouldRetryError) {
				throw err;
			}

			if (stopped) {
				return;
			}

			if (retriesLeft === 0) {
				Log.warn(
					{
						indent,
						logLevel,
					},
					`The browser crashed ${attempt} times while rendering frame ${frame}. Not retrying anymore. Learn more about this error under https://www.remotion.dev/docs/target-closed`,
				);
				throw err;
			}

			if (shouldRetryError) {
				const pool = await poolPromise;
				// Replace the closed page
				const newPage = await makePage(sourceMapGetter);
				pool.release(newPage);
				Log.warn(
					{indent, logLevel},
					`delayRender() timed out while rendering frame ${frame}: ${(err as Error).message}`,
				);
				const actualRetriesLeft = getRetriesLeftFromError(err as Error);

				return renderFrameAndRetryTargetClose({
					frame,
					index,
					retriesLeft: actualRetriesLeft,
					attempt: attempt + 1,
					assetsOnly,
				});
			}

			Log.warn(
				{indent, logLevel},
				`The browser crashed while rendering frame ${frame}, retrying ${retriesLeft} more times. Learn more about this error under https://www.remotion.dev/docs/target-closed`,
			);
			// Replace the entire browser
			await browserReplacer.replaceBrowser(makeBrowser, async () => {
				const pages = new Array(concurrencyOrFramesToRender)
					.fill(true)
					.map(() => makePage(sourceMapGetter));
				const puppeteerPages = await Promise.all(pages);
				const pool = await poolPromise;
				for (const newPage of puppeteerPages) {
					pool.release(newPage);
				}
			});
			await renderFrameAndRetryTargetClose({
				frame,
				index,
				retriesLeft: retriesLeft - 1,
				attempt: attempt + 1,
				assetsOnly,
			});
		}
	};

	// Render the extra frames at the beginning of the video first,
	// then the regular frames, then the extra frames at the end of the video.
	// While the order technically doesn't matter, components such as <Video> are
	// not always frame perfect and give a flicker.
	// We reduce the chance of flicker by rendering the frames in order.

	await Promise.all(
		extraFramesToCaptureAssetsFrontend.map((frame) => {
			return renderFrameAndRetryTargetClose({
				frame,
				index: null,
				retriesLeft: MAX_RETRIES_PER_FRAME,
				attempt: 1,
				assetsOnly: true,
			});
		}),
	);
	await Promise.all(
		framesToRender.map((frame, index) => {
			return renderFrameAndRetryTargetClose({
				frame,
				index,
				retriesLeft: MAX_RETRIES_PER_FRAME,
				attempt: 1,
				assetsOnly: false,
			});
		}),
	);

	await Promise.all(
		extraFramesToCaptureAssetsBackend.map((frame) => {
			return renderFrameAndRetryTargetClose({
				frame,
				index: null,
				retriesLeft: MAX_RETRIES_PER_FRAME,
				attempt: 1,
				assetsOnly: true,
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
		});

	const browserInstance = puppeteerInstance ?? makeBrowser();

	const actualConcurrency = getActualConcurrency(concurrency);

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
						concurrency: actualConcurrency,
						logLevel,
						indent,
						offthreadVideoCacheSizeInBytes,
						binariesDirectory,
						forceIPv4: false,
					},
					{
						onDownload,
						onError,
					},
				),
				browserInstance,
			]).then(([{server: openedServer, cleanupServer}, pInstance]) => {
				const {serveUrl, offthreadPort, compositor, sourceMap, downloadMap} =
					openedServer;

				const browserReplacer = handleBrowserCrash(pInstance, logLevel, indent);

				const cycle = cycleBrowserTabs(
					browserReplacer,
					actualConcurrency,
					logLevel,
					indent,
				);
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
					actualConcurrency,
					onDownload,
					proxyPort: offthreadPort,
					makeBrowser,
					browserReplacer,
					compositor,
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
				});
			}),
		])
			.then((res) => {
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
							return instance.close(true, logLevel, indent);
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

/**
 * @description Renders a series of images using Puppeteer and computes information for mixing audio.
 * @see [Documentation](https://www.remotion.dev/docs/renderer/render-frames)
 * @param {RenderFramesOptions} options Configuration options for rendering frames.
 * @returns {Promise<RenderFramesOutput>} Information about the rendered frames and assets.
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
		verbose || dumpBrowserLogs ? 'verbose' : passedLogLevel ?? 'info';
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
	});
};
