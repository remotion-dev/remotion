import {Internals, type VideoConfig} from 'remotion';
import type {BrowserExecutable} from './browser-executable';
import type {BrowserLog} from './browser-log';
import type {HeadlessBrowser} from './browser/Browser';
import type {Page} from './browser/BrowserPage';
import {DEFAULT_TIMEOUT} from './browser/TimeoutSettings';
import {handleJavascriptException} from './error-handling/handle-javascript-exception';
import {findRemotionRoot} from './find-closest-package-json';
import {getPageAndCleanupFn} from './get-browser-instance';
import {type LogLevel} from './log-level';
import {Log} from './logger';
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

type InternalSelectCompositionsConfig = {
	serializedInputPropsWithCustomSchema: string;
	envVariables: Record<string, string>;
	puppeteerInstance: HeadlessBrowser | undefined;
	onBrowserLog: null | ((log: BrowserLog) => void);
	browserExecutable: BrowserExecutable | null;
	timeoutInMilliseconds: number;
	chromiumOptions: ChromiumOptions;
	port: number | null;
	indent: boolean;
	server: RemotionServer | undefined;
	logLevel: LogLevel;
	serveUrl: string;
	id: string;
} & ToOptions<typeof optionsMap.renderStill>;

export type SelectCompositionOptions = {
	inputProps?: Record<string, unknown> | null;
	envVariables?: Record<string, string>;
	puppeteerInstance?: HeadlessBrowser;
	onBrowserLog?: (log: BrowserLog) => void;
	browserExecutable?: BrowserExecutable;
	timeoutInMilliseconds?: number;
	chromiumOptions?: ChromiumOptions;
	port?: number | null;
	verbose?: boolean;
	offthreadVideoCacheSizeInBytes?: number | null;
	serveUrl: string;
	id: string;
};

type CleanupFn = () => void;

type InnerSelectCompositionConfig = Omit<
	InternalSelectCompositionsConfig,
	'port'
> & {
	page: Page;
	port: number;
};

const innerSelectComposition = async ({
	page,
	onBrowserLog,
	serializedInputPropsWithCustomSchema,
	envVariables,
	serveUrl,
	timeoutInMilliseconds,
	port,
	id,
	indent,
	logLevel,
}: InnerSelectCompositionConfig): Promise<InternalReturnType> => {
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
		proxyPort: port,
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
	});

	await waitForReady({page, timeoutInMilliseconds, frame: null});

	Log.verboseAdvanced(
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
	});
	Log.verboseAdvanced(
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

	const {width, durationInFrames, fps, height} = res;
	return {
		metadata: {
			id,
			width,
			height,
			fps,
			durationInFrames,
			props: Internals.deserializeJSONWithCustomFields(
				res.serializedResolvedPropsWithCustomSchema,
			),
			defaultProps: Internals.deserializeJSONWithCustomFields(
				res.serializedDefaultPropsWithCustomSchema,
			),
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
	} = options;

	const {page, cleanup: cleanupPage} = await getPageAndCleanupFn({
		passedInInstance: puppeteerInstance,
		browserExecutable,
		chromiumOptions,
		context: null,
		forceDeviceScaleFactor: undefined,
		indent,
		logLevel,
	});
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

		makeOrReuseServer(
			options.server,
			{
				webpackConfigOrServeUrl: serveUrlOrWebpackUrl,
				port,
				remotionRoot: findRemotionRoot(),
				concurrency: 1,
				logLevel,
				indent,
				offthreadVideoCacheSizeInBytes,
			},
			{
				onDownload: () => undefined,
				onError,
			},
		)
			.then(({server: {serveUrl, offthreadPort, sourceMap}, cleanupServer}) => {
				page.setBrowserSourceMapContext(sourceMap);
				cleanup.push(() => cleanupServer(true));

				return innerSelectComposition({
					serveUrl,
					page,
					port: offthreadPort,
					browserExecutable,
					chromiumOptions,
					envVariables,
					id,
					serializedInputPropsWithCustomSchema,
					onBrowserLog,
					timeoutInMilliseconds,
					logLevel,
					indent,
					puppeteerInstance,
					server,
					offthreadVideoCacheSizeInBytes,
				});
			})

			.then((data) => {
				return resolve(data);
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

export const internalSelectComposition = wrapWithErrorHandling(
	internalSelectCompositionRaw,
);

/**
 * @description Gets a composition defined in a Remotion project based on a Webpack bundle.
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
	} = options;

	const data = await internalSelectComposition({
		id,
		serveUrl,
		browserExecutable: browserExecutable ?? null,
		chromiumOptions: chromiumOptions ?? {},
		envVariables: envVariables ?? {},
		serializedInputPropsWithCustomSchema: Internals.serializeJSONWithDate({
			indent: undefined,
			staticBase: null,
			data: inputProps ?? {},
		}).serializedString,
		onBrowserLog: onBrowserLog ?? null,
		port: port ?? null,
		puppeteerInstance,
		timeoutInMilliseconds: timeoutInMilliseconds ?? DEFAULT_TIMEOUT,
		logLevel: verbose ? 'verbose' : 'info',
		indent: false,
		server: undefined,
		offthreadVideoCacheSizeInBytes:
			options.offthreadVideoCacheSizeInBytes ?? null,
	});
	return data.metadata;
};
