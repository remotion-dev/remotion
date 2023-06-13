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

type InternalGetCompositionsOptions = {
	inputProps: Record<string, unknown>;
	envVariables: Record<string, string>;
	puppeteerInstance: HeadlessBrowser | undefined;
	onBrowserLog: null | ((log: BrowserLog) => void);
	browserExecutable: BrowserExecutable | null;
	timeoutInMilliseconds: number;
	chromiumOptions: ChromiumOptions;
	port: number | null;
	server: RemotionServer | undefined;
	indent: boolean;
	verbose: boolean;
	serveUrlOrWebpackUrl: string;
};

export type GetCompositionsOptions = {
	inputProps?: Record<string, unknown> | null;
	envVariables?: Record<string, string>;
	puppeteerInstance?: HeadlessBrowser;
	onBrowserLog?: (log: BrowserLog) => void;
	browserExecutable?: BrowserExecutable;
	timeoutInMilliseconds?: number;
	chromiumOptions?: ChromiumOptions;
	port?: number | null;
	verbose?: boolean;
};

type InnerGetCompositionsParams = {
	inputProps: Record<string, unknown>;
	envVariables: Record<string, string>;
	onBrowserLog: null | ((log: BrowserLog) => void);
	timeoutInMilliseconds: number;
	serveUrl: string;
	page: Page;
	proxyPort: number;
};

const innerGetCompositions = async ({
	envVariables,
	inputProps,
	onBrowserLog,
	page,
	proxyPort,
	serveUrl,
	timeoutInMilliseconds,
}: InnerGetCompositionsParams): Promise<AnyCompMetadata[]> => {
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

	Log.verbose('Setting props and env');
	await setPropsAndEnv({
		inputProps,
		envVariables,
		page,
		serveUrl,
		initialFrame: 0,
		timeoutInMilliseconds,
		proxyPort,
		retriesRemaining: 2,
		audioEnabled: false,
		videoEnabled: false,
	});
	Log.verbose('Set props and env successfully!');

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
	Log.verbose('Page is ready!');

	const result = await puppeteerEvaluateWithCatch({
		pageFunction: () => {
			return window.getStaticCompositions();
		},
		frame: null,
		page,
		args: [],
	});

	Log.verbose('Got compositions', (result as AnyCompMetadata[]).length);

	return result as AnyCompMetadata[];
};

type CleanupFn = () => void;

export const internalGetCompositions = async ({
	browserExecutable,
	chromiumOptions,
	envVariables,
	indent,
	inputProps,
	onBrowserLog,
	port,
	puppeteerInstance,
	serveUrlOrWebpackUrl,
	server,
	timeoutInMilliseconds,
	verbose,
}: InternalGetCompositionsOptions) => {
	const {page, cleanup: cleanupPage} = await getPageAndCleanupFn({
		passedInInstance: puppeteerInstance,
		browserExecutable,
		chromiumOptions,
		context: null,
		forceDeviceScaleFactor: undefined,
		indent,
		shouldDumpIo: verbose,
	});

	const cleanup: CleanupFn[] = [cleanupPage];

	return new Promise<AnyCompMetadata[]>((resolve, reject) => {
		const onError = (err: Error) => reject(err);

		cleanup.push(
			handleJavascriptException({
				page,
				frame: null,
				onError,
			})
		);

		makeOrReuseServer(
			server,
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

				return innerGetCompositions({
					envVariables,
					inputProps,
					onBrowserLog,
					page,
					proxyPort: offthreadPort,
					serveUrl,
					timeoutInMilliseconds,
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
 * @description Gets the compositions defined in a Remotion project based on a Webpack bundle.
 * @see [Documentation](https://www.remotion.dev/docs/renderer/get-compositions)
 */
export const getCompositions = (
	serveUrlOrWebpackUrl: string,
	config?: GetCompositionsOptions
): Promise<AnyCompMetadata[]> => {
	const {
		browserExecutable,
		chromiumOptions,
		envVariables,
		inputProps,
		onBrowserLog,
		port,
		puppeteerInstance,
		timeoutInMilliseconds,
		verbose,
	} = config ?? {};
	return internalGetCompositions({
		browserExecutable: browserExecutable ?? null,
		chromiumOptions: chromiumOptions ?? {},
		envVariables: envVariables ?? {},
		inputProps: inputProps ?? {},
		indent: false,
		onBrowserLog: onBrowserLog ?? null,
		port: port ?? null,
		puppeteerInstance: puppeteerInstance ?? undefined,
		serveUrlOrWebpackUrl,
		server: undefined,
		timeoutInMilliseconds: timeoutInMilliseconds ?? DEFAULT_TIMEOUT,
		verbose: verbose ?? false,
	});
};
