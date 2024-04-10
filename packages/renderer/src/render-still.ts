import fs, {statSync} from 'node:fs';
import path from 'node:path';
import type {VideoConfig} from 'remotion/no-react';
import {NoReactInternals} from 'remotion/no-react';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import type {DownloadMap} from './assets/download-map';
import {DEFAULT_BROWSER} from './browser';
import type {BrowserExecutable} from './browser-executable';
import type {BrowserLog} from './browser-log';
import type {HeadlessBrowser} from './browser/Browser';
import type {ConsoleMessage} from './browser/ConsoleMessage';
import {DEFAULT_TIMEOUT} from './browser/TimeoutSettings';
import {defaultBrowserDownloadProgress} from './browser/browser-download-progress-bar';
import type {SourceMapGetter} from './browser/source-map-getter';
import type {Codec} from './codec';
import type {Compositor} from './compositor/compositor';
import {convertToPositiveFrameIndex} from './convert-to-positive-frame-index';
import {ensureOutputDirectory} from './ensure-output-directory';
import {handleJavascriptException} from './error-handling/handle-javascript-exception';
import {findRemotionRoot} from './find-closest-package-json';
import type {StillImageFormat} from './image-format';
import {
	DEFAULT_STILL_IMAGE_FORMAT,
	validateStillImageFormat,
} from './image-format';
import {DEFAULT_JPEG_QUALITY, validateJpegQuality} from './jpeg-quality';
import type {CancelSignal} from './make-cancel-signal';
import {cancelErrorMessages} from './make-cancel-signal';
import type {ChromiumOptions} from './open-browser';
import {internalOpenBrowser} from './open-browser';
import type {ToOptions} from './options/option';
import type {optionsMap} from './options/options-map';
import {DEFAULT_OVERWRITE} from './overwrite';
import type {RemotionServer} from './prepare-server';
import {makeOrReuseServer} from './prepare-server';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';
import {seekToFrame} from './seek-to-frame';
import {setPropsAndEnv} from './set-props-and-env';
import {takeFrameAndCompose} from './take-frame-and-compose';
import {
	validateDimension,
	validateDurationInFrames,
	validateFps,
} from './validate';
import {validatePuppeteerTimeout} from './validate-puppeteer-timeout';
import {validateScale} from './validate-scale';
import {wrapWithErrorHandling} from './wrap-with-error-handling';

type InternalRenderStillOptions = {
	composition: VideoConfig;
	output: string | null;
	frame: number;
	serializedInputPropsWithCustomSchema: string;
	serializedResolvedPropsWithCustomSchema: string;
	imageFormat: StillImageFormat;
	jpegQuality: number;
	puppeteerInstance: HeadlessBrowser | null;
	envVariables: Record<string, string>;
	overwrite: boolean;
	browserExecutable: BrowserExecutable;
	onBrowserLog: null | ((log: BrowserLog) => void);
	chromiumOptions: ChromiumOptions;
	scale: number;
	onDownload: RenderMediaOnDownload | null;
	cancelSignal: CancelSignal | null;
	indent: boolean;
	server: RemotionServer | undefined;
	serveUrl: string;
	port: number | null;
	offthreadVideoCacheSizeInBytes: number | null;
} & ToOptions<typeof optionsMap.renderStill>;

export type RenderStillOptions = {
	port?: number | null;
	composition: VideoConfig;
	output?: string | null;
	frame?: number;
	inputProps?: Record<string, unknown>;
	imageFormat?: StillImageFormat;
	puppeteerInstance?: HeadlessBrowser;
	/**
	 * @deprecated Use "logLevel": "verbose" instead
	 */
	dumpBrowserLogs?: boolean;
	envVariables?: Record<string, string>;
	overwrite?: boolean;
	browserExecutable?: BrowserExecutable;
	onBrowserLog?: (log: BrowserLog) => void;
	chromiumOptions?: ChromiumOptions;
	scale?: number;
	onDownload?: RenderMediaOnDownload;
	cancelSignal?: CancelSignal;
	/**
	 * @deprecated Use "logLevel" instead
	 */
	verbose?: boolean;
	serveUrl: string;
	/**
	 * @deprecated Renamed to `jpegQuality`
	 */
	quality?: never;
} & Partial<ToOptions<typeof optionsMap.renderStill>>;

type CleanupFn = () => Promise<unknown>;
type RenderStillReturnValue = {buffer: Buffer | null};

const innerRenderStill = async ({
	composition,
	imageFormat = DEFAULT_STILL_IMAGE_FORMAT,
	serveUrl,
	puppeteerInstance,
	onError,
	serializedInputPropsWithCustomSchema,
	envVariables,
	output,
	frame = 0,
	overwrite,
	browserExecutable,
	timeoutInMilliseconds,
	chromiumOptions,
	scale,
	proxyPort,
	cancelSignal,
	jpegQuality,
	onBrowserLog,
	compositor,
	sourceMapGetter,
	downloadMap,
	logLevel,
	indent,
	serializedResolvedPropsWithCustomSchema,
	onBrowserDownload,
}: InternalRenderStillOptions & {
	downloadMap: DownloadMap;
	serveUrl: string;
	onError: (err: Error) => void;
	proxyPort: number;
	compositor: Compositor;
	sourceMapGetter: SourceMapGetter;
}): Promise<RenderStillReturnValue> => {
	validateDimension(
		composition.height,
		'height',
		'in the `config` object passed to `renderStill()`',
	);

	validateDimension(
		composition.width,
		'width',
		'in the `config` object passed to `renderStill()`',
	);
	validateFps(
		composition.fps,
		'in the `config` object of `renderStill()`',
		false,
	);
	validateDurationInFrames(composition.durationInFrames, {
		component: 'in the `config` object passed to `renderStill()`',
		allowFloats: false,
	});
	validateStillImageFormat(imageFormat);
	NoReactInternals.validateFrame({
		frame,
		durationInFrames: composition.durationInFrames,
		allowFloats: false,
	});
	const stillFrame = convertToPositiveFrameIndex({
		durationInFrames: composition.durationInFrames,
		frame,
	});
	validatePuppeteerTimeout(timeoutInMilliseconds);
	validateScale(scale);

	output =
		typeof output === 'string' ? path.resolve(process.cwd(), output) : null;

	validateJpegQuality(jpegQuality);

	if (output) {
		if (fs.existsSync(output)) {
			if (!overwrite) {
				throw new Error(
					`Cannot render still - "overwrite" option was set to false, but the output destination ${output} already exists.`,
				);
			}

			const stat = statSync(output);

			if (!stat.isFile()) {
				throw new Error(
					`The output location ${output} already exists, but is not a file, but something else (e.g. folder). Cannot save to it.`,
				);
			}
		}

		ensureOutputDirectory(output);
	}

	const browserInstance =
		puppeteerInstance ??
		(await internalOpenBrowser({
			browser: DEFAULT_BROWSER,
			browserExecutable,
			chromiumOptions,
			forceDeviceScaleFactor: scale,
			indent,
			viewport: null,
			logLevel,
			onBrowserDownload,
		}));
	const page = await browserInstance.newPage(sourceMapGetter, logLevel, indent);
	await page.setViewport({
		width: composition.width,
		height: composition.height,
		deviceScaleFactor: scale,
	});

	const errorCallback = (err: Error) => {
		onError(err);
		cleanup();
	};

	const cleanUpJSException = handleJavascriptException({
		page,
		onError: errorCallback,
		frame: null,
	});

	const logCallback = (log: ConsoleMessage) => {
		onBrowserLog?.({
			stackTrace: log.stackTrace(),
			text: log.text,
			type: log.type,
		});
	};

	const cleanup = async () => {
		cleanUpJSException();
		page.off('console', logCallback);

		if (puppeteerInstance) {
			await page.close();
		} else {
			browserInstance.close(true, logLevel, indent).catch((err) => {
				console.log('Unable to close browser', err);
			});
		}
	};

	cancelSignal?.(() => {
		cleanup();
	});

	if (onBrowserLog) {
		page.on('console', logCallback);
	}

	await setPropsAndEnv({
		serializedInputPropsWithCustomSchema,
		envVariables,
		page,
		serveUrl,
		initialFrame: stillFrame,
		timeoutInMilliseconds,
		proxyPort,
		retriesRemaining: 2,
		audioEnabled: false,
		videoEnabled: true,
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
	await seekToFrame({
		frame: stillFrame,
		page,
		composition: composition.id,
		timeoutInMilliseconds,
		indent,
		logLevel,
		attempt: 0,
	});

	const {buffer} = await takeFrameAndCompose({
		frame: stillFrame,
		freePage: page,
		height: composition.height,
		width: composition.width,
		imageFormat,
		scale,
		output,
		jpegQuality,
		wantsBuffer: !output,
		compositor,
		downloadMap,
		timeoutInMilliseconds,
	});

	await cleanup();

	return {buffer: output ? null : buffer};
};

const internalRenderStillRaw = (
	options: InternalRenderStillOptions,
): Promise<RenderStillReturnValue> => {
	const cleanup: CleanupFn[] = [];

	const happyPath = new Promise<RenderStillReturnValue>((resolve, reject) => {
		const onError = (err: Error) => reject(err);

		makeOrReuseServer(
			options.server,
			{
				webpackConfigOrServeUrl: options.serveUrl,
				port: options.port,
				remotionRoot: findRemotionRoot(),
				concurrency: 1,
				logLevel: options.logLevel,
				indent: options.indent,
				offthreadVideoCacheSizeInBytes: options.offthreadVideoCacheSizeInBytes,
				binariesDirectory: options.binariesDirectory,
				forceIPv4: false,
			},
			{
				onDownload: options.onDownload,
				onError,
			},
		)
			.then(({server, cleanupServer}) => {
				cleanup.push(() => cleanupServer(false));
				const {
					serveUrl,
					offthreadPort,
					compositor,
					sourceMap: sourceMapGetter,
					downloadMap,
				} = server;

				return innerRenderStill({
					...options,
					serveUrl,
					onError,
					proxyPort: offthreadPort,
					compositor,
					sourceMapGetter,
					downloadMap,
				});
			})

			.then((res) => resolve(res))
			.catch((err) => reject(err))
			.finally(() => {
				cleanup.forEach((c) => {
					c().catch((err) => {
						console.log('Cleanup error:', err);
					});
				});
			});
	});

	return Promise.race([
		happyPath,
		new Promise<RenderStillReturnValue>((_resolve, reject) => {
			options.cancelSignal?.(() => {
				reject(new Error(cancelErrorMessages.renderStill));
			});
		}),
	]);
};

export const internalRenderStill = wrapWithErrorHandling(
	internalRenderStillRaw,
);

/**
 *
 * @description Render a still frame from a composition
 * @see [Documentation](https://www.remotion.dev/docs/renderer/render-still)
 */
export const renderStill = (
	options: RenderStillOptions,
): Promise<RenderStillReturnValue> => {
	const {
		composition,
		serveUrl,
		browserExecutable,
		cancelSignal,
		chromiumOptions,
		dumpBrowserLogs,
		envVariables,
		frame,
		imageFormat,
		inputProps,
		jpegQuality,
		onBrowserLog,
		onDownload,
		output,
		overwrite,
		port,
		puppeteerInstance,
		scale,
		timeoutInMilliseconds,
		verbose,
		quality,
		offthreadVideoCacheSizeInBytes,
		logLevel: passedLogLevel,
		binariesDirectory,
		onBrowserDownload,
	} = options;

	if (typeof jpegQuality !== 'undefined' && imageFormat !== 'jpeg') {
		throw new Error(
			"You can only pass the `quality` option if `imageFormat` is 'jpeg'.",
		);
	}

	if (quality) {
		console.warn(
			'Passing `quality()` to `renderStill` is deprecated. Use `jpegQuality` instead.',
		);
	}

	const logLevel =
		passedLogLevel ?? (verbose || dumpBrowserLogs ? 'verbose' : 'info');
	const indent = false;

	return internalRenderStill({
		composition,
		browserExecutable: browserExecutable ?? null,
		cancelSignal: cancelSignal ?? null,
		chromiumOptions: chromiumOptions ?? {},
		envVariables: envVariables ?? {},
		frame: frame ?? 0,
		imageFormat: imageFormat ?? DEFAULT_STILL_IMAGE_FORMAT,
		indent,
		serializedInputPropsWithCustomSchema:
			NoReactInternals.serializeJSONWithDate({
				staticBase: null,
				indent: undefined,
				data: inputProps ?? {},
			}).serializedString,
		jpegQuality: jpegQuality ?? quality ?? DEFAULT_JPEG_QUALITY,
		onBrowserLog: onBrowserLog ?? null,
		onDownload: onDownload ?? null,
		output: output ?? null,
		overwrite: overwrite ?? DEFAULT_OVERWRITE,
		port: port ?? null,
		puppeteerInstance: puppeteerInstance ?? null,
		scale: scale ?? 1,
		server: undefined,
		serveUrl,
		timeoutInMilliseconds: timeoutInMilliseconds ?? DEFAULT_TIMEOUT,
		logLevel,
		serializedResolvedPropsWithCustomSchema:
			NoReactInternals.serializeJSONWithDate({
				indent: undefined,
				staticBase: null,
				data: composition.props ?? {},
			}).serializedString,
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes ?? null,
		binariesDirectory: binariesDirectory ?? null,
		onBrowserDownload:
			onBrowserDownload ??
			defaultBrowserDownloadProgress({indent, logLevel, api: 'renderStill()'}),
	});
};
