import type {VideoConfig} from 'remotion/no-react';
import {NoReactInternals} from 'remotion/no-react';
import type {BrowserExecutable} from './browser-executable';
import type {BrowserLog} from './browser-log';
import type {HeadlessBrowser} from './browser/Browser';
import {defaultBrowserDownloadProgress} from './browser/browser-download-progress-bar';
import type {Page} from './browser/BrowserPage';
import {DEFAULT_TIMEOUT} from './browser/TimeoutSettings';
import {handleJavascriptException} from './error-handling/handle-javascript-exception';
import {findRemotionRoot} from './find-closest-package-json';
import {getPageAndCleanupFn} from './get-browser-instance';
import type {ChromiumOptions} from './open-browser';
import type {ToOptions} from './options/option';
import type {optionsMap} from './options/options-map';
import type {RemotionServer} from './prepare-server';
import {makeOrReuseServer} from './prepare-server';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';
import {waitForReady} from './seek-to-frame';
import {setPropsAndEnv} from './set-props-and-env';
import {validatePuppeteerTimeout} from './validate-puppeteer-timeout';
import {wrapWithErrorHandling} from './wrap-with-error-handling';

type InternalGetCompositionsOptions = {
	serializedInputPropsWithCustomSchema: string;
	envVariables: Record<string, string>;
	puppeteerInstance: HeadlessBrowser | undefined;
	onBrowserLog: null | ((log: BrowserLog) => void);
	browserExecutable: BrowserExecutable | null;
	chromiumOptions: ChromiumOptions;
	port: number | null;
	server: RemotionServer | undefined;
	indent: boolean;
	serveUrlOrWebpackUrl: string;
} & ToOptions<typeof optionsMap.getCompositions>;

export type GetCompositionsOptions = {
	inputProps?: Record<string, unknown> | null;
	envVariables?: Record<string, string>;
	puppeteerInstance?: HeadlessBrowser;
	onBrowserLog?: (log: BrowserLog) => void;
	browserExecutable?: BrowserExecutable;
	chromiumOptions?: ChromiumOptions;
	port?: number | null;
} & Partial<ToOptions<typeof optionsMap.getCompositions>>;

type InnerGetCompositionsParams = {
	serializedInputPropsWithCustomSchema: string;
	envVariables: Record<string, string>;
	onBrowserLog: null | ((log: BrowserLog) => void);
	serveUrl: string;
	page: Page;
	proxyPort: number;
	indent: boolean;
} & ToOptions<typeof optionsMap.getCompositions>;

const innerGetCompositions = async ({
	envVariables,
	serializedInputPropsWithCustomSchema,
	onBrowserLog,
	page,
	proxyPort,
	serveUrl,
	timeoutInMilliseconds,
	indent,
	logLevel,
}: InnerGetCompositionsParams): Promise<VideoConfig[]> => {
	if (onBrowserLog) {
		page.on('console', (log) => {
			onBrowserLog({
				stackTrace: log.stackTrace(),
				text: log.text,
				type: log.type,
			});
		});
	}

	validatePuppeteerTimeout(timeoutInMilliseconds);

	await setPropsAndEnv({
		serializedInputPropsWithCustomSchema,
		envVariables,
		page,
		serveUrl,
		initialFrame: 0,
		timeoutInMilliseconds,
		proxyPort,
		retriesRemaining: 2,
		audioEnabled: false,
		videoEnabled: false,
		indent,
		logLevel,
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
		indent,
		logLevel,
	});
	const {value: result} = await puppeteerEvaluateWithCatch({
		pageFunction: () => {
			return window.getStaticCompositions();
		},
		frame: null,
		page,
		args: [],
		timeoutInMilliseconds,
	});

	const res = result as Awaited<
		ReturnType<typeof window.getStaticCompositions>
	>;

	return res.map((r) => {
		const {width, durationInFrames, fps, height, id, defaultCodec} = r;

		return {
			id,
			width,
			height,
			fps,
			durationInFrames,
			props: NoReactInternals.deserializeJSONWithCustomFields(
				r.serializedResolvedPropsWithCustomSchema,
			),
			defaultProps: NoReactInternals.deserializeJSONWithCustomFields(
				r.serializedDefaultPropsWithCustomSchema,
			),
			defaultCodec,
		};
	});
};

type CleanupFn = () => Promise<unknown>;

const internalGetCompositionsRaw = async ({
	browserExecutable,
	chromiumOptions,
	envVariables,
	indent,
	serializedInputPropsWithCustomSchema,
	onBrowserLog,
	port,
	puppeteerInstance,
	serveUrlOrWebpackUrl,
	server,
	timeoutInMilliseconds,
	logLevel,
	offthreadVideoCacheSizeInBytes,
	binariesDirectory,
	onBrowserDownload,
}: InternalGetCompositionsOptions) => {
	const {page, cleanup: cleanupPage} = await getPageAndCleanupFn({
		passedInInstance: puppeteerInstance,
		browserExecutable,
		chromiumOptions,
		forceDeviceScaleFactor: undefined,
		indent,
		logLevel,
		onBrowserDownload,
	});

	const cleanup: CleanupFn[] = [cleanupPage];

	return new Promise<VideoConfig[]>((resolve, reject) => {
		const onError = (err: Error) => reject(err);

		cleanup.push(
			handleJavascriptException({
				page,
				frame: null,
				onError,
			}),
		);

		makeOrReuseServer(
			server,
			{
				webpackConfigOrServeUrl: serveUrlOrWebpackUrl,
				port,
				remotionRoot: findRemotionRoot(),
				concurrency: 1,
				logLevel,
				indent,
				offthreadVideoCacheSizeInBytes,
				binariesDirectory,
				forceIPv4: false,
			},
			{
				onDownload: () => undefined,
				onError,
			},
		)
			.then(({server: {serveUrl, offthreadPort, sourceMap}, cleanupServer}) => {
				page.setBrowserSourceMapGetter(sourceMap);

				cleanup.push(() => {
					return cleanupServer(true);
				});

				return innerGetCompositions({
					envVariables,
					serializedInputPropsWithCustomSchema,
					onBrowserLog,
					page,
					proxyPort: offthreadPort,
					serveUrl,
					timeoutInMilliseconds,
					indent,
					logLevel,
					offthreadVideoCacheSizeInBytes,
					binariesDirectory,
					onBrowserDownload,
				});
			})

			.then((comp) => {
				return resolve(comp);
			})
			.catch((err) => {
				reject(err);
			})
			.finally(() => {
				cleanup.forEach((c) => {
					c();
				});
			});
	});
};

export const internalGetCompositions = wrapWithErrorHandling(
	internalGetCompositionsRaw,
);

/**
 * @description Gets the compositions defined in a Remotion project based on a Webpack bundle.
 * @see [Documentation](https://www.remotion.dev/docs/renderer/get-compositions)
 */
export const getCompositions = (
	serveUrlOrWebpackUrl: string,
	config?: GetCompositionsOptions,
): Promise<VideoConfig[]> => {
	if (!serveUrlOrWebpackUrl) {
		throw new Error(
			'No serve URL or webpack bundle directory was passed to getCompositions().',
		);
	}

	const {
		browserExecutable,
		chromiumOptions,
		envVariables,
		inputProps,
		onBrowserLog,
		port,
		puppeteerInstance,
		timeoutInMilliseconds,
		logLevel: passedLogLevel,
		onBrowserDownload,
		binariesDirectory,
		offthreadVideoCacheSizeInBytes,
	} = config ?? {};

	const indent = false;
	const logLevel = passedLogLevel ?? 'info';

	return internalGetCompositions({
		browserExecutable: browserExecutable ?? null,
		chromiumOptions: chromiumOptions ?? {},
		envVariables: envVariables ?? {},
		serializedInputPropsWithCustomSchema:
			NoReactInternals.serializeJSONWithDate({
				data: inputProps ?? {},
				indent: undefined,
				staticBase: null,
			}).serializedString,
		indent,
		onBrowserLog: onBrowserLog ?? null,
		port: port ?? null,
		puppeteerInstance: puppeteerInstance ?? undefined,
		serveUrlOrWebpackUrl,
		server: undefined,
		timeoutInMilliseconds: timeoutInMilliseconds ?? DEFAULT_TIMEOUT,
		logLevel,
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes ?? null,
		binariesDirectory: binariesDirectory ?? null,
		onBrowserDownload:
			onBrowserDownload ?? defaultBrowserDownloadProgress(indent, logLevel),
	});
};
