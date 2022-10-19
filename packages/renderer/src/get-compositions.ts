import type {TCompMetadata} from 'remotion';
import type {DownloadMap} from './assets/download-map';
import {cleanDownloadMap, makeDownloadMap} from './assets/download-map';
import type {BrowserExecutable} from './browser-executable';
import type {BrowserLog} from './browser-log';
import type {Browser} from './browser/Browser';
import type {Page} from './browser/BrowserPage';
import {handleJavascriptException} from './error-handling/handle-javascript-exception';
import type {FfmpegExecutable} from './ffmpeg-executable';
import {findRemotionRoot} from './find-closest-package-json';
import {getPageAndCleanupFn} from './get-browser-instance';
import type {ChromiumOptions} from './open-browser';
import {prepareServer} from './prepare-server';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';
import {setPropsAndEnv} from './set-props-and-env';
import {validateFfmpeg} from './validate-ffmpeg';
import {validatePuppeteerTimeout} from './validate-puppeteer-timeout';

type GetCompositionsConfig = {
	inputProps?: object | null;
	envVariables?: Record<string, string>;
	puppeteerInstance?: Browser;
	onBrowserLog?: (log: BrowserLog) => void;
	browserExecutable?: BrowserExecutable;
	timeoutInMilliseconds?: number;
	chromiumOptions?: ChromiumOptions;
	ffmpegExecutable?: FfmpegExecutable;
	ffprobeExecutable?: FfmpegExecutable;
	port?: number | null;
	/**
	 * @deprecated Only for Remotion internal usage
	 */
	downloadMap?: DownloadMap;
};

const innerGetCompositions = async (
	serveUrl: string,
	page: Page,
	config: GetCompositionsConfig,
	proxyPort: number
): Promise<TCompMetadata[]> => {
	if (config?.onBrowserLog) {
		page.on('console', (log) => {
			config.onBrowserLog?.({
				stackTrace: log.stackTrace(),
				text: log.text,
				type: log.type,
			});
		});
	}

	validatePuppeteerTimeout(config?.timeoutInMilliseconds);

	await setPropsAndEnv({
		inputProps: config?.inputProps,
		envVariables: config?.envVariables,
		page,
		serveUrl,
		initialFrame: 0,
		timeoutInMilliseconds: config?.timeoutInMilliseconds,
		proxyPort,
		retriesRemaining: 2,
		audioEnabled: false,
		videoEnabled: false,
	});

	await puppeteerEvaluateWithCatch({
		page,
		pageFunction: () => {
			window.setBundleMode({
				type: 'evaluation',
			});
		},
		frame: null,
		args: [],
	});

	await page.waitForFunction(page.browser, 'window.ready === true');
	const result = await puppeteerEvaluateWithCatch({
		pageFunction: () => {
			return window.getStaticCompositions();
		},
		frame: null,
		page,
		args: [],
	});

	return result as TCompMetadata[];
};

export const getCompositions = async (
	serveUrlOrWebpackUrl: string,
	config?: GetCompositionsConfig
) => {
	await validateFfmpeg(config?.ffmpegExecutable ?? null, findRemotionRoot());

	const downloadMap = config?.downloadMap ?? makeDownloadMap();

	const {page, cleanup} = await getPageAndCleanupFn({
		passedInInstance: config?.puppeteerInstance,
		browserExecutable: config?.browserExecutable ?? null,
		chromiumOptions: config?.chromiumOptions ?? {},
	});

	return new Promise<TCompMetadata[]>((resolve, reject) => {
		const onError = (err: Error) => reject(err);
		const cleanupPageError = handleJavascriptException({
			page,
			frame: null,
			onError,
		});

		let close: (() => void) | null = null;

		prepareServer({
			webpackConfigOrServeUrl: serveUrlOrWebpackUrl,
			onDownload: () => undefined,
			onError,
			ffmpegExecutable: config?.ffmpegExecutable ?? null,
			ffprobeExecutable: config?.ffprobeExecutable ?? null,
			port: config?.port ?? null,
			downloadMap,
			remotionRoot: findRemotionRoot(),
		})
			.then(({serveUrl, closeServer, offthreadPort}) => {
				close = closeServer;
				return innerGetCompositions(
					serveUrl,
					page,
					config ?? {},
					offthreadPort
				);
			})

			.then((comp) => resolve(comp))
			.catch((err) => {
				reject(err);
			})
			.finally(() => {
				cleanup();
				close?.();
				cleanupPageError();
				// Clean download map if it was not passed in
				if (!config?.downloadMap) {
					cleanDownloadMap(downloadMap);
				}
			});
	});
};
