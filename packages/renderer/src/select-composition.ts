import type {VideoConfig} from 'remotion/no-react';
import {NoReactInternals} from 'remotion/no-react';
import type {BrowserExecutable} from './browser-executable';
import type {BrowserLog} from './browser-log';
import type {HeadlessBrowser} from './browser/Browser';
import type {Page} from './browser/BrowserPage';
import {DEFAULT_TIMEOUT} from './browser/TimeoutSettings';
import {defaultBrowserDownloadProgress} from './browser/browser-download-progress-bar';
import {handleJavascriptException} from './error-handling/handle-javascript-exception';
import {findRemotionRoot} from './find-closest-package-json';
import {getPageAndCleanupFn} from './get-browser-instance';
import {Log} from './logger';
import type {ChromiumOptions} from './open-browser';
import type {ToOptions} from './options/option';
import type {optionsMap} from './options/options-map';
import type {RemotionServer} from './prepare-server';
import {makeOrReuseServer} from './prepare-server';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';
import {waitForReady} from './seek-to-frame';
import {setPropsAndEnv} from './set-props-and-env';
import type {RequiredInputPropsInV5} from './v5-required-input-props';
import {validatePuppeteerTimeout} from './validate-puppeteer-timeout';
import {wrapWithErrorHandling} from './wrap-with-error-handling';

type InternalSelectCompositionsConfig = {
	serializedInputPropsWithCustomSchema: string;
	envVariables: Record<string, string>;
	puppeteerInstance: HeadlessBrowser | undefined;
	onBrowserLog: null | ((log: BrowserLog) => void);
	browserExecutable: BrowserExecutable | null;
	chromiumOptions: ChromiumOptions;
	port: number | null;
	indent: boolean;
	server: RemotionServer | undefined;
	serveUrl: string;
	id: string;
	onServeUrlVisited: () => void;
} & ToOptions<typeof optionsMap.selectComposition>;

export type SelectCompositionOptions = RequiredInputPropsInV5 & {
	envVariables?: Record<string, string>;
	puppeteerInstance?: HeadlessBrowser;
	onBrowserLog?: (log: BrowserLog) => void;
	browserExecutable?: BrowserExecutable;
	chromiumOptions?: ChromiumOptions;
	port?: number | null;
	/**
	 * @deprecated Use `logLevel` instead.
	 */
	verbose?: boolean;
	serveUrl: string;
	id: string;
} & Partial<ToOptions<typeof optionsMap.selectComposition>>;

type CleanupFn = () => Promise<unknown>;

type InnerSelectCompositionConfig = Omit<
	InternalSelectCompositionsConfig,
	'port' | 'offthreadVideoThreads' | 'onBrowserLog'
> & {
	page: Page;
	port: number;
};

const innerSelectComposition = async ({
	page,
	serializedInputPropsWithCustomSchema,
	envVariables,
	serveUrl,
	timeoutInMilliseconds,
	port,
	id,
	indent,
	logLevel,
	onServeUrlVisited,
}: InnerSelectCompositionConfig): Promise<InternalReturnType> => {
	validatePuppeteerTimeout(timeoutInMilliseconds);

	await setPropsAndEnv({
		serializedInputPropsWithCustomSchema,
		envVariables,
		page,
		serveUrl,
		initialFrame: 0,
		timeoutInMilliseconds,
		proxyPort: port,
		retriesRemaining: 2,
		audioEnabled: false,
		videoEnabled: false,
		indent,
		logLevel,
		onServeUrlVisited,
	});

	await puppeteerEvaluateWithCatch({
		page,
		pageFunction: () => {
			window.remotion_setBundleMode({
				type: 'evaluation',
			});
		},
		frame: null,
		args: [],
		timeoutInMilliseconds,
	});

	await waitForReady({
		page,
		timeoutInMilliseconds,
		frame: null,
		logLevel,
		indent,
	});

	Log.verbose(
		{
			indent,
			tag: 'selectComposition()',
			logLevel,
		},
		'Running calculateMetadata()...',
	);
	const time = Date.now();
	const {value: result, size} = await puppeteerEvaluateWithCatch({
		pageFunction: (_id: string) => {
			return window.remotion_calculateComposition(_id);
		},
		frame: null,
		page,
		args: [id],
		timeoutInMilliseconds,
	});
	Log.verbose(
		{
			indent,
			tag: 'selectComposition()',
			logLevel,
		},
		`calculateMetadata() took ${Date.now() - time}ms`,
	);

	const res = result as Awaited<
		ReturnType<typeof window.remotion_calculateComposition>
	>;

	const {width, durationInFrames, fps, height, defaultCodec, defaultOutName} =
		res;
	return {
		metadata: {
			id,
			width,
			height,
			fps,
			durationInFrames,
			props: NoReactInternals.deserializeJSONWithCustomFields(
				res.serializedResolvedPropsWithCustomSchema,
			),
			defaultProps: NoReactInternals.deserializeJSONWithCustomFields(
				res.serializedDefaultPropsWithCustomSchema,
			),
			defaultCodec,
			defaultOutName,
		},
		propsSize: size,
	};
};

type InternalReturnType = {
	metadata: VideoConfig;
	propsSize: number;
};

export const internalSelectCompositionRaw = async (
	options: InternalSelectCompositionsConfig,
): Promise<InternalReturnType> => {
	const cleanup: CleanupFn[] = [];
	const {
		puppeteerInstance,
		browserExecutable,
		chromiumOptions,
		serveUrl: serveUrlOrWebpackUrl,
		logLevel,
		indent,
		port,
		envVariables,
		id,
		serializedInputPropsWithCustomSchema,
		onBrowserLog,
		server,
		timeoutInMilliseconds,
		offthreadVideoCacheSizeInBytes,
		binariesDirectory,
		onBrowserDownload,
		onServeUrlVisited,
		chromeMode,
	} = options;

	const [{page, cleanupPage}, serverUsed] = await Promise.all([
		getPageAndCleanupFn({
			passedInInstance: puppeteerInstance,
			browserExecutable,
			chromiumOptions,
			forceDeviceScaleFactor: undefined,
			indent,
			logLevel,
			onBrowserDownload,
			chromeMode,
			pageIndex: 0,
			onBrowserLog,
		}),
		makeOrReuseServer(
			options.server,
			{
				webpackConfigOrServeUrl: serveUrlOrWebpackUrl,
				port,
				remotionRoot: findRemotionRoot(),
				offthreadVideoThreads: 0,
				logLevel,
				indent,
				offthreadVideoCacheSizeInBytes,
				binariesDirectory,
				forceIPv4: false,
			},
			{
				onDownload: () => undefined,
			},
		).then((result) => {
			cleanup.push(() => result.cleanupServer(true));
			return result;
		}),
	]);
	cleanup.push(() => cleanupPage());

	return new Promise<InternalReturnType>((resolve, reject) => {
		const onError = (err: Error) => reject(err);

		cleanup.push(
			handleJavascriptException({
				page,
				frame: null,
				onError,
			}),
		);
		page.setBrowserSourceMapGetter(serverUsed.server.sourceMap);

		innerSelectComposition({
			serveUrl: serverUsed.server.serveUrl,
			page,
			port: serverUsed.server.offthreadPort,
			browserExecutable,
			chromiumOptions,
			envVariables,
			id,
			serializedInputPropsWithCustomSchema,
			timeoutInMilliseconds,
			logLevel,
			indent,
			puppeteerInstance,
			server,
			offthreadVideoCacheSizeInBytes,
			binariesDirectory,
			onBrowserDownload,
			onServeUrlVisited,
			chromeMode,
		})
			.then((data) => {
				return resolve(data);
			})
			.catch((err) => {
				reject(err);
			})
			.finally(() => {
				cleanup.forEach((c) => {
					// Must prevent unhandled exception in cleanup function.
					// Promise has already been resolved, so we can't reject it.
					c().catch((err) => {
						Log.error({indent, logLevel}, 'Cleanup error:', err);
					});
				});
			});
	});
};

export const internalSelectComposition = wrapWithErrorHandling(
	internalSelectCompositionRaw,
);

/*
 * @description Evaluates the list of compositions from a Remotion Bundle by evaluating the Remotion Root and evaluating `calculateMetadata()` on the specified composition.
 * @see [Documentation](https://www.remotion.dev/docs/renderer/select-composition)
 */
export const selectComposition = async (
	options: SelectCompositionOptions,
): Promise<VideoConfig> => {
	const {
		id,
		serveUrl,
		browserExecutable,
		chromiumOptions,
		envVariables,
		inputProps,
		onBrowserLog,
		port,
		puppeteerInstance,
		timeoutInMilliseconds,
		verbose,
		logLevel: passedLogLevel,
		offthreadVideoCacheSizeInBytes,
		binariesDirectory,
		onBrowserDownload,
		chromeMode,
		offthreadVideoThreads,
	} = options;

	const indent = false;
	const logLevel = (passedLogLevel ?? verbose) ? 'verbose' : 'info';

	const data = await internalSelectComposition({
		id,
		serveUrl,
		browserExecutable: browserExecutable ?? null,
		chromiumOptions: chromiumOptions ?? {},
		envVariables: envVariables ?? {},
		serializedInputPropsWithCustomSchema:
			NoReactInternals.serializeJSONWithDate({
				indent: undefined,
				staticBase: null,
				data: inputProps ?? {},
			}).serializedString,
		onBrowserLog: onBrowserLog ?? null,
		port: port ?? null,
		puppeteerInstance,
		timeoutInMilliseconds: timeoutInMilliseconds ?? DEFAULT_TIMEOUT,
		logLevel,
		indent,
		server: undefined,
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes ?? null,
		binariesDirectory: binariesDirectory ?? null,
		onBrowserDownload:
			onBrowserDownload ??
			defaultBrowserDownloadProgress({
				indent,
				logLevel,
				api: 'selectComposition()',
			}),
		onServeUrlVisited: () => undefined,
		chromeMode: chromeMode ?? 'headless-shell',
		offthreadVideoThreads: offthreadVideoThreads ?? null,
	});
	return data.metadata;
};
