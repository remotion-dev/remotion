import fs from 'node:fs';
import path from 'node:path';
import {performance} from 'perf_hooks';
import type {AnySmallCompMetadata, TAsset} from 'remotion';
import {Internals} from 'remotion';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {downloadAndMapAssetsToFileUrl} from './assets/download-and-map-assets-to-file';
import type {DownloadMap} from './assets/download-map';
import {DEFAULT_BROWSER} from './browser';
import type {BrowserExecutable} from './browser-executable';
import type {BrowserLog} from './browser-log';
import type {HeadlessBrowser} from './browser/Browser';
import type {Page} from './browser/BrowserPage';
import type {ConsoleMessage} from './browser/ConsoleMessage';
import {isTargetClosedErr} from './browser/is-target-closed-err';
import {DEFAULT_TIMEOUT} from './browser/TimeoutSettings';
import type {Compositor} from './compositor/compositor';
import {compressAsset} from './compress-assets';
import {cycleBrowserTabs} from './cycle-browser-tabs';
import {handleJavascriptException} from './error-handling/handle-javascript-exception';
import {findRemotionRoot} from './find-closest-package-json';
import type {FrameRange} from './frame-range';
import {getActualConcurrency} from './get-concurrency';
import {getFramesToRender} from './get-duration-from-frame-range';
import type {CountType} from './get-frame-padded-index';
import {
	getFilePadLength,
	getFrameOutputFileName,
} from './get-frame-padded-index';
import {getRealFrameRange} from './get-frame-to-render';
import type {VideoImageFormat} from './image-format';
import {DEFAULT_JPEG_QUALITY, validateJpegQuality} from './jpeg-quality';
import type {CancelSignal} from './make-cancel-signal';
import {cancelErrorMessages, isUserCancelledRender} from './make-cancel-signal';
import type {ChromiumOptions} from './open-browser';
import {internalOpenBrowser} from './open-browser';
import {startPerfMeasure, stopPerfMeasure} from './perf';
import {Pool} from './pool';
import type {RemotionServer} from './prepare-server';
import {makeOrReuseServer} from './prepare-server';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';
import type {BrowserReplacer} from './replace-browser';
import {handleBrowserCrash} from './replace-browser';
import {seekToFrame} from './seek-to-frame';
import {setPropsAndEnv} from './set-props-and-env';
import type {AnySourceMapConsumer} from './symbolicate-stacktrace';
import {takeFrameAndCompose} from './take-frame-and-compose';
import {truthy} from './truthy';
import type {OnStartData, RenderFramesOutput} from './types';
import {validateScale} from './validate-scale';

const MAX_RETRIES_PER_FRAME = 1;

export type InternalRenderFramesOptions = {
	onStart: null | ((data: OnStartData) => void);
	onFrameUpdate:
		| null
		| ((
				framesRendered: number,
				frameIndex: number,
				timeToRenderInMilliseconds: number
		  ) => void);
	outputDir: string | null;
	inputProps: Record<string, unknown>;
	envVariables: Record<string, string>;
	imageFormat: VideoImageFormat;
	jpegQuality: number;
	frameRange: FrameRange | null;
	everyNthFrame: number;
	dumpBrowserLogs: boolean;
	puppeteerInstance: HeadlessBrowser | undefined;
	browserExecutable: BrowserExecutable | null;
	onBrowserLog: null | ((log: BrowserLog) => void);
	onFrameBuffer: null | ((buffer: Buffer, frame: number) => void);
	onDownload: RenderMediaOnDownload | null;
	timeoutInMilliseconds: number;
	chromiumOptions: ChromiumOptions;
	scale: number;
	port: number | null;
	cancelSignal: CancelSignal | undefined;
	composition: AnySmallCompMetadata;
	indent: boolean;
	server: RemotionServer | undefined;
	muted: boolean;
	concurrency: number | string | null;
	webpackBundleOrServeUrl: string;
	verbose: boolean;
};

type InnerRenderFramesOptions = {
	onStart: null | ((data: OnStartData) => void);
	onFrameUpdate:
		| null
		| ((
				framesRendered: number,
				frameIndex: number,
				timeToRenderInMilliseconds: number
		  ) => void);
	outputDir: string | null;
	inputProps: Record<string, unknown>;
	envVariables: Record<string, string>;
	imageFormat: VideoImageFormat;
	jpegQuality: number;
	frameRange: FrameRange | null;
	everyNthFrame: number;
	onBrowserLog: null | ((log: BrowserLog) => void);
	onFrameBuffer: null | ((buffer: Buffer, frame: number) => void);
	onDownload: RenderMediaOnDownload | null;
	timeoutInMilliseconds: number;
	scale: number;
	cancelSignal: CancelSignal | undefined;
	composition: AnySmallCompMetadata;
	muted: boolean;
	onError: (err: Error) => void;
	pagesArray: Page[];
	actualConcurrency: number;
	proxyPort: number;
	downloadMap: DownloadMap;
	makeBrowser: () => Promise<HeadlessBrowser>;
	browserReplacer: BrowserReplacer;
	compositor: Compositor;
	sourcemapContext: AnySourceMapConsumer | null;
	serveUrl: string;
};

export type RenderFramesOptions = {
	onStart: (data: OnStartData) => void;
	onFrameUpdate: (
		framesRendered: number,
		frameIndex: number,
		timeToRenderInMilliseconds: number
	) => void;
	outputDir: string | null;
	inputProps: Record<string, unknown>;
	envVariables?: Record<string, string>;
	imageFormat?: VideoImageFormat;
	/**
	 * @deprecated Renamed to "jpegQuality"
	 */
	quality?: never;
	jpegQuality?: number;
	frameRange?: FrameRange | null;
	everyNthFrame?: number;
	dumpBrowserLogs?: boolean;
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
	composition: AnySmallCompMetadata;
	muted?: boolean;
	concurrency?: number | string | null;
	serveUrl: string;
	verbose?: boolean;
};

const innerRenderFrames = async ({
	onFrameUpdate,
	outputDir,
	onStart,
	inputProps,
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
	actualConcurrency,
	everyNthFrame,
	proxyPort,
	cancelSignal,
	downloadMap,
	muted,
	makeBrowser,
	browserReplacer,
	compositor,
	sourcemapContext,
}: InnerRenderFramesOptions): Promise<RenderFramesOutput> => {
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
		frameRange
	);

	const framesToRender = getFramesToRender(realFrameRange, everyNthFrame);
	const lastFrame = framesToRender[framesToRender.length - 1];

	const makePage = async (context: AnySourceMapConsumer | null) => {
		const page = await browserReplacer.getBrowser().newPage(context);
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
			inputProps,
			envVariables,
			page,
			serveUrl,
			initialFrame,
			timeoutInMilliseconds,
			proxyPort,
			retriesRemaining: 2,
			audioEnabled: !muted,
			videoEnabled: imageFormat !== 'none',
		});

		await puppeteerEvaluateWithCatch({
			// eslint-disable-next-line max-params
			pageFunction: (
				id: string,
				defaultProps: Record<string, unknown>,
				durationInFrames: number,
				fps: number,
				height: number,
				width: number
			) => {
				window.remotion_setBundleMode({
					type: 'composition',
					compositionName: id,
					compositionDefaultProps: defaultProps,
					compositionDurationInFrames: durationInFrames,
					compositionFps: fps,
					compositionHeight: height,
					compositionWidth: width,
				});
			},
			args: [
				composition.id,
				composition.defaultProps,
				composition.durationInFrames,
				composition.fps,
				composition.height,
				composition.width,
			],
			frame: null,
			page,
		});

		page.off('console', logCallback);

		return page;
	};

	const getPool = async (context: AnySourceMapConsumer | null) => {
		const pages = new Array(actualConcurrency)
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

	const poolPromise = getPool(sourcemapContext);

	onStart?.({
		frameCount: framesToRender.length,
	});

	const assets: TAsset[][] = new Array(framesToRender.length).fill(undefined);
	let stopped = false;
	cancelSignal?.(() => {
		stopped = true;
	});

	const renderFrameWithOptionToReject = async ({
		frame,
		index,
		reject,
		width,
		height,
	}: {
		frame: number;
		index: number;
		reject: (err: Error) => void;
		width: number;
		height: number;
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
		await seekToFrame({frame, page: freePage});

		if (!outputDir && !onFrameBuffer && imageFormat !== 'none') {
			throw new Error(
				'Called renderFrames() without specifying either `outputDir` or `onFrameBuffer`'
			);
		}

		if (outputDir && onFrameBuffer && imageFormat !== 'none') {
			throw new Error(
				'Pass either `outputDir` or `onFrameBuffer` to renderFrames(), not both.'
			);
		}

		const id = startPerfMeasure('save');

		const frameDir = outputDir ?? downloadMap.compositingDir;

		const {buffer, collectedAssets} = await takeFrameAndCompose({
			frame,
			freePage,
			height,
			imageFormat,
			output: path.join(
				frameDir,
				getFrameOutputFileName({
					frame,
					imageFormat,
					index,
					countType,
					lastFrame,
					totalFrames: framesToRender.length,
				})
			),
			jpegQuality,
			width,
			scale,
			downloadMap,
			wantsBuffer: Boolean(onFrameBuffer),
			compositor,
		});
		if (onFrameBuffer) {
			if (!buffer) {
				throw new Error('unexpected null buffer');
			}

			onFrameBuffer(buffer, frame);
		}

		stopPerfMeasure(id);

		const compressedAssets = collectedAssets.map((asset) =>
			compressAsset(assets.filter(truthy).flat(1), asset)
		);
		assets[index] = compressedAssets;
		compressedAssets.forEach((asset) => {
			downloadAndMapAssetsToFileUrl({
				asset,
				onDownload,
				downloadMap,
			}).catch((err) => {
				onError(
					new Error(`Error while downloading asset: ${(err as Error).stack}`)
				);
			});
		});
		framesRendered++;
		onFrameUpdate?.(framesRendered, frame, performance.now() - startTime);
		cleanupPageError();
		freePage.off('error', errorCallbackOnFrame);
		pool.release(freePage);
	};

	const renderFrame = (frame: number, index: number) => {
		return new Promise<void>((resolve, reject) => {
			renderFrameWithOptionToReject({
				frame,
				index,
				reject,
				width: composition.width,
				height: composition.height,
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
	}: {
		frame: number;
		index: number;
		retriesLeft: number;
		attempt: number;
	}) => {
		try {
			await Promise.race([
				renderFrame(frame, index),
				new Promise((_, reject) => {
					cancelSignal?.(() => {
						reject(new Error(cancelErrorMessages.renderFrames));
					});
				}),
			]);
		} catch (err) {
			if (isUserCancelledRender(err)) {
				throw err;
			}

			if (!isTargetClosedErr(err as Error)) {
				throw err;
			}

			if (stopped) {
				return;
			}

			if (retriesLeft === 0) {
				console.warn(
					`The browser crashed ${attempt} times while rendering frame ${frame}. Not retrying anymore. Learn more about this error under https://www.remotion.dev/docs/target-closed`
				);
				throw err;
			}

			console.warn(
				`The browser crashed while rendering frame ${frame}, retrying ${retriesLeft} more times. Learn more about this error under https://www.remotion.dev/docs/target-closed`
			);
			await browserReplacer.replaceBrowser(makeBrowser, async () => {
				const pages = new Array(actualConcurrency)
					.fill(true)
					.map(() => makePage(sourcemapContext));
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
			});
		}
	};

	const progress = Promise.all(
		framesToRender.map((frame, index) =>
			renderFrameAndRetryTargetClose({
				frame,
				index,
				retriesLeft: MAX_RETRIES_PER_FRAME,
				attempt: 1,
			})
		)
	);

	const happyPath = progress.then(() => {
		const firstFrameIndex = countType === 'from-zero' ? 0 : framesToRender[0];
		const returnValue: RenderFramesOutput = {
			assetsInfo: {
				assets,
				imageSequenceName: `element-%0${filePadLength}d.${imageFormat}`,
				firstFrameIndex,
				downloadMap,
			},
			frameCount: framesToRender.length,
		};
		return returnValue;
	});

	const result = await happyPath;
	await Promise.all(downloadPromises);
	return result;
};

type CleanupFn = () => void;

export const internalRenderFrames = ({
	browserExecutable,
	cancelSignal,
	chromiumOptions,
	composition,
	concurrency,
	dumpBrowserLogs,
	envVariables,
	everyNthFrame,
	frameRange,
	imageFormat,
	indent,
	inputProps,
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
	verbose,
	webpackBundleOrServeUrl,
}: InternalRenderFramesOptions): Promise<RenderFramesOutput> => {
	Internals.validateDimension(
		composition.height,
		'height',
		'in the `config` object passed to `renderFrames()`'
	);
	Internals.validateDimension(
		composition.width,
		'width',
		'in the `config` object passed to `renderFrames()`'
	);
	Internals.validateFps(
		composition.fps,
		'in the `config` object of `renderFrames()`',
		false
	);
	Internals.validateDurationInFrames({
		durationInFrames: composition.durationInFrames,
		component: 'in the `config` object passed to `renderFrames()`',
		allowFloats: false,
	});

	validateJpegQuality(jpegQuality);
	validateScale(scale);

	const makeBrowser = () =>
		internalOpenBrowser({
			browser: DEFAULT_BROWSER,
			shouldDumpIo: dumpBrowserLogs,
			browserExecutable,
			chromiumOptions,
			forceDeviceScaleFactor: scale,
			indent,
			viewport: null,
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
						verbose,
						indent,
					},
					{
						onDownload,
						onError,
					}
				),
				browserInstance,
			]).then(
				([
					{
						server: {
							serveUrl,
							offthreadPort,
							compositor,
							sourceMap,
							downloadMap,
						},
						cleanupServer,
					},
					pInstance,
				]) => {
					const browserReplacer = handleBrowserCrash(pInstance);

					cleanup.push(
						cycleBrowserTabs(browserReplacer, actualConcurrency).stopCycling
					);
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
						sourcemapContext: sourceMap,
						downloadMap,
						cancelSignal,
						envVariables,
						everyNthFrame,
						frameRange,
						imageFormat,
						inputProps,
						jpegQuality,
						muted,
						onBrowserLog,
						onFrameBuffer,
						onFrameUpdate,
						onStart,
						outputDir,
						scale,
						timeoutInMilliseconds,
					});
				}
			),
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

						console.log('Unable to close browser tab', err);
					});
				} else {
					Promise.resolve(browserInstance)
						.then((instance) => {
							return instance.close(true);
						})
						.catch((err) => {
							if (
								!(err as Error | undefined)?.message.includes('Target closed')
							) {
								console.log('Unable to close browser', err);
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

/**
 * @description Renders a series of images using Puppeteer and computes information for mixing audio.
 * @see [Documentation](https://www.remotion.dev/docs/renderer/render-frames)
 */
export const renderFrames = (
	options: RenderFramesOptions
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
	} = options;

	if (!composition) {
		throw new Error(
			'No `composition` option has been specified for renderFrames()'
		);
	}

	if (typeof jpegQuality !== 'undefined' && imageFormat !== 'jpeg') {
		throw new Error(
			"You can only pass the `quality` option if `imageFormat` is 'jpeg'."
		);
	}

	if (quality) {
		console.warn(
			'Passing `quality()` to `renderStill` is deprecated. Use `jpegQuality` instead.'
		);
	}

	return internalRenderFrames({
		browserExecutable: browserExecutable ?? null,
		cancelSignal,
		chromiumOptions: chromiumOptions ?? {},
		composition,
		concurrency: concurrency ?? null,
		dumpBrowserLogs: dumpBrowserLogs ?? false,
		envVariables: envVariables ?? {},
		everyNthFrame: everyNthFrame ?? 1,
		frameRange: frameRange ?? null,
		imageFormat: imageFormat ?? 'jpeg',
		indent: false,
		jpegQuality: jpegQuality ?? DEFAULT_JPEG_QUALITY,
		onDownload: onDownload ?? null,
		inputProps,
		puppeteerInstance,
		muted: muted ?? false,
		onBrowserLog: onBrowserLog ?? null,
		onFrameBuffer: onFrameBuffer ?? null,
		onFrameUpdate,
		onStart,
		outputDir,
		port: port ?? null,
		scale: scale ?? 1,
		verbose: verbose ?? false,
		timeoutInMilliseconds: timeoutInMilliseconds ?? DEFAULT_TIMEOUT,
		webpackBundleOrServeUrl: serveUrl,
		server: undefined,
	});
};
