import type {AnyCompMetadata} from 'remotion';
import type {DownloadMap} from './assets/download-map';
import {cleanDownloadMap, makeDownloadMap} from './assets/download-map';
import type {BrowserExecutable} from './browser-executable';
import type {BrowserLog} from './browser-log';
import type {HeadlessBrowser} from './browser/Browser';
import type {Page} from './browser/BrowserPage';
import {handleJavascriptException} from './error-handling/handle-javascript-exception';
import {findRemotionRoot} from './find-closest-package-json';
import {getPageAndCleanupFn} from './get-browser-instance';
import {Log} from './logger';
import type {ChromiumOptions} from './open-browser';
import {prepareServer} from './prepare-server';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';
import {waitForReady} from './seek-to-frame';
import {setPropsAndEnv} from './set-props-and-env';
import {validatePuppeteerTimeout} from './validate-puppeteer-timeout';

type SelectCompositionsConfig = {
	inputProps?: Record<string, unknown> | null;
	envVariables?: Record<string, string>;
	puppeteerInstance?: HeadlessBrowser;
	onBrowserLog?: (log: BrowserLog) => void;
	browserExecutable?: BrowserExecutable;
	timeoutInMilliseconds?: number;
	chromiumOptions?: ChromiumOptions;
	port?: number | null;
	/**
	 * @deprecated Only for Remotion internal usage
	 */
	downloadMap?: DownloadMap;
	/**
	 * @deprecated Only for Remotion internal usage
	 */
	indent?: boolean;
	verbose?: boolean;
	serveUrl: string;
	id: string;
};

type InnerSelectCompositionConfig = Omit<SelectCompositionsConfig, 'port'> & {
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
			onBrowserLog?.({
				stackTrace: log.stackTrace(),
				text: log.text,
				type: log.type,
			});
		});
	}

	validatePuppeteerTimeout(timeoutInMilliseconds);

	await setPropsAndEnv({
		inputProps: inputProps ?? {},
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
			indent: indent ?? false,
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
			indent: indent ?? false,
			tag: 'selectComposition()',
			logLevel: verbose ? 'verbose' : 'info',
		},
		`calculateMetadata() took ${Date.now() - time}ms`
	);

	return result as AnyCompMetadata;
};

/**
 * @description Gets a composition defined in a Remotion project based on a Webpack bundle.
 * @see [Documentation](https://www.remotion.dev/docs/renderer/select-composition)
 */
export const selectComposition = async (options: SelectCompositionsConfig) => {
	const {
		puppeteerInstance,
		browserExecutable,
		chromiumOptions,
		downloadMap: passedDownloadMap,
		serveUrl: serveUrlOrWebpackUrl,
		verbose,
		indent,
		port,
	} = options;
	const downloadMap = passedDownloadMap ?? makeDownloadMap();

	const {page, cleanup} = await getPageAndCleanupFn({
		passedInInstance: puppeteerInstance,
		browserExecutable: browserExecutable ?? null,
		chromiumOptions: chromiumOptions ?? {},
		context: null,
	});

	return new Promise<AnyCompMetadata>((resolve, reject) => {
		const onError = (err: Error) => reject(err);
		const cleanupPageError = handleJavascriptException({
			page,
			frame: null,
			onError,
		});

		let close: ((force: boolean) => Promise<unknown>) | null = null;

		prepareServer({
			webpackConfigOrServeUrl: serveUrlOrWebpackUrl,
			onDownload: () => undefined,
			onError,
			port: port ?? null,
			downloadMap,
			remotionRoot: findRemotionRoot(),
			concurrency: 1,
			verbose: verbose ?? false,
			indent: indent ?? false,
		})
			.then(({serveUrl, closeServer, offthreadPort}) => {
				page.setBrowserSourceMapContext({
					serverPort: offthreadPort,
					webpackBundle: serveUrlOrWebpackUrl,
				});
				close = closeServer;
				return innerSelectComposition({
					...options,
					serveUrl,
					page,
					port: offthreadPort,
				});
			})

			.then((comp): Promise<[AnyCompMetadata, unknown]> => {
				if (close) {
					return Promise.all([comp, close(true)]);
				}

				return Promise.resolve([comp, null]);
			})
			.then(([comp]) => {
				return resolve(comp);
			})
			.catch((err) => {
				reject(err);
			})
			.finally(() => {
				cleanup();
				cleanupPageError();
				// Clean download map if it was not passed in
				if (!passedDownloadMap) {
					cleanDownloadMap(downloadMap);
				}
			});
	});
};
