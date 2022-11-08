import fs from 'fs';
import path from 'path';
import {performance} from 'perf_hooks';
import type {SmallTCompMetadata, TAsset} from 'remotion';
import {Internals} from 'remotion';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {downloadAndMapAssetsToFileUrl} from './assets/download-and-map-assets-to-file';
import type {DownloadMap} from './assets/download-map';
import {makeDownloadMap} from './assets/download-map';
import {DEFAULT_BROWSER} from './browser';
import type {BrowserExecutable} from './browser-executable';
import type {BrowserLog} from './browser-log';
import type {Browser} from './browser/Browser';
import type {Page} from './browser/BrowserPage';
import type {ConsoleMessage} from './browser/ConsoleMessage';
import {compressAsset} from './compress-assets';
import {cycleBrowserTabs} from './cycle-browser-tabs';
import {handleJavascriptException} from './error-handling/handle-javascript-exception';
import type {FfmpegExecutable} from './ffmpeg-executable';
import type {FrameRange} from './frame-range';
import {getActualConcurrency} from './get-concurrency';
import {getFramesToRender} from './get-duration-from-frame-range';
import type {CountType} from './get-frame-padded-index';
import {
	getFilePadLength,
	getFrameOutputFileName,
} from './get-frame-padded-index';
import {getRealFrameRange} from './get-frame-to-render';
import type {ImageFormat} from './image-format';
import {DEFAULT_IMAGE_FORMAT} from './image-format';
import type {ServeUrlOrWebpackBundle} from './legacy-webpack-config';
import {getServeUrlWithFallback} from './legacy-webpack-config';
import type {CancelSignal} from './make-cancel-signal';
import type {ChromiumOptions} from './open-browser';
import {openBrowser} from './open-browser';
import {startPerfMeasure, stopPerfMeasure} from './perf';
import {Pool} from './pool';
import {prepareServer} from './prepare-server';
import {provideScreenshot} from './provide-screenshot';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';
import {validateQuality} from './quality';
import {handleBrowserCrash} from './replace-browser';
import {seekToFrame} from './seek-to-frame';
import {setPropsAndEnv} from './set-props-and-env';
import {truthy} from './truthy';
import type {OnStartData, RenderFramesOutput} from './types';
import {validateScale} from './validate-scale';

type ConfigOrComposition =
	| {
			/**
			 * @deprecated This field has been renamed to `composition`
			 */
			config: SmallTCompMetadata;
	  }
	| {
			composition: SmallTCompMetadata;
	  };

type ConcurrencyOrParallelism =
	| {
			concurrency?: number | null;
	  }
	| {
			/**
			 * @deprecated This field has been renamed to `concurrency`
			 */
			parallelism?: number | null;
	  };

const MAX_RETRIES_PER_FRAME = 1;

type RenderFramesOptions = {
	onStart: (data: OnStartData) => void;
	onFrameUpdate: (
		framesRendered: number,
		frameIndex: number,
		timeToRenderInMilliseconds: number
	) => void;
	outputDir: string | null;
	inputProps: unknown;
	envVariables?: Record<string, string>;
	imageFormat: ImageFormat;
	quality?: number;
	frameRange?: FrameRange | null;
	everyNthFrame?: number;
	dumpBrowserLogs?: boolean;
	puppeteerInstance?: Browser;
	browserExecutable?: BrowserExecutable;
	onBrowserLog?: (log: BrowserLog) => void;
	onFrameBuffer?: (buffer: Buffer, frame: number) => void;
	onDownload?: RenderMediaOnDownload;
	timeoutInMilliseconds?: number;
	chromiumOptions?: ChromiumOptions;
	scale?: number;
	ffmpegExecutable?: FfmpegExecutable;
	ffprobeExecutable?: FfmpegExecutable;
	port?: number | null;
	cancelSignal?: CancelSignal;
	/**
	 * @deprecated Only for Remotion internal usage
	 */
	downloadMap?: DownloadMap;
	muted?: boolean;
} & ConfigOrComposition &
	ConcurrencyOrParallelism &
	ServeUrlOrWebpackBundle;

const getComposition = (others: ConfigOrComposition) => {
	if ('composition' in others) {
		return others.composition;
	}

	if ('config' in others) {
		return others.config;
	}

	return undefined;
};

const getConcurrency = (others: ConcurrencyOrParallelism) => {
	if ('concurrency' in others) {
		return others.concurrency;
	}

	if ('parallelism' in others) {
		return others.parallelism;
	}

	return undefined;
};

const getPool = async (pages: Promise<Page>[]) => {
	const puppeteerPages = await Promise.all(pages);
	const pool = new Pool(puppeteerPages);
	return pool;
};

const innerRenderFrames = ({
	onFrameUpdate,
	outputDir,
	onStart,
	inputProps,
	quality,
	imageFormat = DEFAULT_IMAGE_FORMAT,
	frameRange,
	puppeteerInstance,
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
	everyNthFrame = 1,
	proxyPort,
	cancelSignal,
	downloadMap,
	muted,
	makeBrowser,
}: Omit<RenderFramesOptions, 'url' | 'onDownload'> & {
	onError: (err: Error) => void;
	pagesArray: Page[];
	serveUrl: string;
	composition: SmallTCompMetadata;
	actualConcurrency: number;
	onDownload: RenderMediaOnDownload;
	proxyPort: number;
	downloadMap: DownloadMap;
	makeBrowser: () => Promise<Browser>;
}): Promise<RenderFramesOutput> => {
	if (!puppeteerInstance) {
		throw new Error(
			'no puppeteer instance passed to innerRenderFrames - internal error'
		);
	}

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
		frameRange ?? null
	);

	const framesToRender = getFramesToRender(realFrameRange, everyNthFrame);
	const lastFrame = framesToRender[framesToRender.length - 1];

	const browserReplacer = handleBrowserCrash(puppeteerInstance);

	const makePage = async () => {
		const page = await browserReplacer.getBrowser().newPage();
		pagesArray.push(page);
		await page.setViewport({
			width: composition.width,
			height: composition.height,
			deviceScaleFactor: scale ?? 1,
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
				defaultProps: unknown,
				durationInFrames: number,
				fps: number,
				height: number,
				width: number
			) => {
				window.setBundleMode({
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

	const pages = new Array(actualConcurrency).fill(true).map(() => makePage());

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

	const poolPromise = getPool(pages);

	onStart({
		frameCount: framesToRender.length,
	});

	const assets: TAsset[][] = new Array(framesToRender.length).fill(undefined);
	let stopped = false;
	cancelSignal?.(() => {
		stopped = true;
	});

	const renderFrameWithOptionToReject = async (
		frame: number,
		index: number,
		reject: (err: Error) => void
	) => {
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

		if (imageFormat !== 'none') {
			if (onFrameBuffer) {
				const id = startPerfMeasure('save');
				const buffer = await provideScreenshot({
					page: freePage,
					imageFormat,
					quality,
					options: {
						frame,
						output: null,
					},
				});
				stopPerfMeasure(id);

				onFrameBuffer(buffer, frame);
			} else {
				if (!outputDir) {
					throw new Error(
						'Called renderFrames() without specifying either `outputDir` or `onFrameBuffer`'
					);
				}

				const output = path.join(
					outputDir,
					getFrameOutputFileName({
						frame,
						imageFormat,
						index,
						countType,
						lastFrame,
						totalFrames: framesToRender.length,
					})
				);
				await provideScreenshot({
					page: freePage,
					imageFormat,
					quality,
					options: {
						frame,
						output,
					},
				});
			}
		}

		const collectedAssets = await puppeteerEvaluateWithCatch<TAsset[]>({
			pageFunction: () => {
				return window.remotion_collectAssets();
			},
			args: [],
			frame,
			page: freePage,
		});
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
		onFrameUpdate(framesRendered, frame, performance.now() - startTime);
		cleanupPageError();
		freePage.off('error', errorCallbackOnFrame);
		pool.release(freePage);
	};

	const renderFrame = (frame: number, index: number) => {
		return new Promise<void>((resolve, reject) => {
			renderFrameWithOptionToReject(frame, index, reject)
				.then(() => {
					resolve();
				})
				.catch((err) => {
					reject(err);
				});
		});
	};

	const renderFrameAndRetryTargetClose = async (
		frame: number,
		index: number,
		retriesLeft: number,
		attempt: number
	) => {
		try {
			await renderFrame(frame, index);
		} catch (err) {
			if (
				!(err as Error)?.message?.includes('Target closed') &&
				!(err as Error)?.message?.includes('Session closed')
			) {
				throw err;
			}

			if (retriesLeft === 0) {
				console.warn(
					err,
					`The browser crashed ${attempt} times while rendering frame ${frame}. Not retrying anymore. Learn more about this error under https://www.remotion.dev/docs/target-closed`
				);
				throw err;
			}

			console.warn(
				`The browser crashed while rendering frame ${frame}, retrying ${retriesLeft} more times. Learn more about this error under https://www.remotion.dev/docs/target-closed`
			);
			const pool = await poolPromise;
			await browserReplacer.replaceBrowser(makeBrowser);
			const page = await makePage();
			pool.release(page);
			await renderFrameAndRetryTargetClose(
				frame,
				index,
				retriesLeft - 1,
				attempt + 1
			);
		}
	};

	const progress = Promise.all(
		framesToRender.map((frame, index) =>
			renderFrameAndRetryTargetClose(frame, index, MAX_RETRIES_PER_FRAME, 1)
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

	return happyPath
		.then(() => {
			return Promise.all(downloadPromises);
		})
		.then(() => happyPath);
};

type CleanupFn = () => void;

export const renderFrames = (
	options: RenderFramesOptions
): Promise<RenderFramesOutput> => {
	const composition = getComposition(options);
	const concurrency = getConcurrency(options);

	if (!composition) {
		throw new Error(
			'No `composition` option has been specified for renderFrames()'
		);
	}

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
	Internals.validateDurationInFrames(
		composition.durationInFrames,
		'in the `config` object passed to `renderFrames()`'
	);
	if (options.quality !== undefined && options.imageFormat !== 'jpeg') {
		throw new Error(
			"You can only pass the `quality` option if `imageFormat` is 'jpeg'."
		);
	}

	const selectedServeUrl = getServeUrlWithFallback(options);

	validateQuality(options.quality);
	validateScale(options.scale);

	const makeBrowser = () =>
		openBrowser(DEFAULT_BROWSER, {
			shouldDumpIo: options.dumpBrowserLogs,
			browserExecutable: options.browserExecutable,
			chromiumOptions: options.chromiumOptions,
			forceDeviceScaleFactor: options.scale ?? 1,
		});

	const browserInstance = options.puppeteerInstance ?? makeBrowser();

	const downloadMap = options.downloadMap ?? makeDownloadMap();

	const onDownload = options.onDownload ?? (() => () => undefined);

	const actualConcurrency = getActualConcurrency(concurrency ?? null);

	const openedPages: Page[] = [];

	return new Promise<RenderFramesOutput>((resolve, reject) => {
		const cleanup: CleanupFn[] = [];
		const onError = (err: Error) => {
			reject(err);
		};

		Promise.race([
			new Promise<RenderFramesOutput>((_, rej) => {
				options.cancelSignal?.(() => {
					rej(new Error('renderFrames() got cancelled'));
				});
			}),
			Promise.all([
				prepareServer({
					webpackConfigOrServeUrl: selectedServeUrl,
					onDownload,
					onError,
					ffmpegExecutable: options.ffmpegExecutable ?? null,
					ffprobeExecutable: options.ffprobeExecutable ?? null,
					port: options.port ?? null,
					downloadMap,
				}),
				browserInstance,
			]).then(([{serveUrl, closeServer, offthreadPort}, puppeteerInstance]) => {
				const {stopCycling} = cycleBrowserTabs(
					puppeteerInstance,
					actualConcurrency
				);

				cleanup.push(stopCycling);
				cleanup.push(closeServer);

				return innerRenderFrames({
					...options,
					puppeteerInstance,
					onError,
					pagesArray: openedPages,
					serveUrl,
					composition,
					actualConcurrency,
					onDownload,
					proxyPort: offthreadPort,
					downloadMap,
					makeBrowser,
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

				if (options.puppeteerInstance) {
					Promise.all(openedPages.map((p) => p.close())).catch((err) => {
						console.log('Unable to close browser tab', err);
					});
				} else {
					Promise.resolve(browserInstance)
						.then((puppeteerInstance) => {
							return puppeteerInstance.close();
						})
						.catch((err) => {
							console.log('Unable to close browser', err);
						});
				}

				cleanup.forEach((c) => {
					c();
				});
				// Don't clear download dir because it might be used by stitchFramesToVideo
			});
	});
};
