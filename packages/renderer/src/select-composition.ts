import type {AnyCompMetadata} from 'remotion';
import type {BrowserExecutable} from './browser-executable';
import type {BrowserLog} from './browser-log';
import type {HeadlessBrowser} from './browser/Browser';
import type {Page} from './browser/BrowserPage';
import {DEFAULT_TIMEOUT} from './browser/TimeoutSettings';
import {handleJavascriptException} from './error-handling/handle-javascript-exception';
import {findRemotionRoot} from './find-closest-package-json';
import {getPageAndCleanupFn} from './get-browser-instance';
import {Log} from './logger';
import type {ChromiumOptions} from './open-browser';
import type {RemotionServer} from './prepare-server';
import {makeOrReuseServer} from './prepare-server';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';
import {waitForReady} from './seek-to-frame';
import {setPropsAndEnv} from './set-props-and-env';
import {validatePuppeteerTimeout} from './validate-puppeteer-timeout';

type InternalSelectCompositionsConfig = {
	inputProps: Record<string, unknown>;
	envVariables: Record<string, string>;
	puppeteerInstance: HeadlessBrowser | undefined;
	onBrowserLog: null | ((log: BrowserLog) => void);
	browserExecutable: BrowserExecutable | null;
	timeoutInMilliseconds: number;
	chromiumOptions: ChromiumOptions;
	port: number | null;
	indent: boolean;
	server: RemotionServer | undefined;
	verbose: boolean;
	serveUrl: string;
	id: string;
};

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
	inputProps,
	envVariables,
	serveUrl,
	timeoutInMilliseconds,
	port,
	id,
	indent,
	verbose,
}: InnerSelectCompositionConfig): Promise<AnyCompMetadata> => {
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
		inputProps,
		envVariables,
		page,
		serveUrl,
		initialFrame: 0,
		timeoutInMilliseconds,
		proxyPort: port,
		retriesRemaining: 2,
		audioEnabled: false,
		videoEnabled: false,
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

	await waitForReady(page);

	Log.verboseAdvanced(
		{
			indent,
			tag: 'selectComposition()',
			logLevel: verbose ? 'verbose' : 'info',
		},
		'Running calculateMetadata()...'
	);
	const time = Date.now();
	const result = await puppeteerEvaluateWithCatch({
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
			logLevel: verbose ? 'verbose' : 'info',
		},
		`calculateMetadata() took ${Date.now() - time}ms`
	);

	return result as AnyCompMetadata;
};

export const internalSelectComposition = async (
	options: InternalSelectCompositionsConfig
): Promise<AnyCompMetadata> => {
	const cleanup: CleanupFn[] = [];
	const {
		puppeteerInstance,
		browserExecutable,
		chromiumOptions,
		serveUrl: serveUrlOrWebpackUrl,
		verbose,
		indent,
		port,
		envVariables,
		id,
		inputProps,
		onBrowserLog,
		server,
		timeoutInMilliseconds,
	} = options;

	const {page, cleanup: cleanupPage} = await getPageAndCleanupFn({
		passedInInstance: puppeteerInstance,
		browserExecutable,
		chromiumOptions,
		context: null,
		forceDeviceScaleFactor: undefined,
		indent,
		shouldDumpIo: verbose,
	});
	cleanup.push(() => cleanupPage());

	return new Promise<AnyCompMetadata>((resolve, reject) => {
		const onError = (err: Error) => reject(err);

		cleanup.push(
			handleJavascriptException({
				page,
				frame: null,
				onError,
			})
		);

		makeOrReuseServer(
			options.server,
			{
				webpackConfigOrServeUrl: serveUrlOrWebpackUrl,
				port,
				remotionRoot: findRemotionRoot(),
				concurrency: 1,
				verbose,
				indent,
			},
			{
				onDownload: () => undefined,
				onError,
			}
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
					inputProps,
					onBrowserLog,
					timeoutInMilliseconds,
					verbose,
					indent,
					puppeteerInstance,
					server,
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

/**
 * @description Gets a composition defined in a Remotion project based on a Webpack bundle.
 * @see [Documentation](https://www.remotion.dev/docs/renderer/select-composition)
 */
export const selectComposition = (
	options: SelectCompositionOptions
): Promise<AnyCompMetadata> => {
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
	return internalSelectComposition({
		id,
		serveUrl,
		browserExecutable: browserExecutable ?? null,
		chromiumOptions: chromiumOptions ?? {},
		envVariables: envVariables ?? {},
		inputProps: inputProps ?? {},
		onBrowserLog: onBrowserLog ?? null,
		port: port ?? null,
		puppeteerInstance,
		timeoutInMilliseconds: timeoutInMilliseconds ?? DEFAULT_TIMEOUT,
		verbose: verbose ?? false,
		indent: false,
		server: undefined,
	});
};
