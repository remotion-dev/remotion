import {Browser, Page} from 'puppeteer-core';
import {BrowserExecutable, FfmpegExecutable, TCompMetadata} from 'remotion';
import {BrowserLog} from './browser-log';
import {handleJavascriptException} from './error-handling/handle-javascript-exception';
import {getPageAndCleanupFn} from './get-browser-instance';
import {makeAssetsDownloadTmpDir} from './make-assets-download-dir';
import {ChromiumOptions} from './open-browser';
import {prepareServer} from './prepare-server';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';
import {setPropsAndEnv} from './set-props-and-env';
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
};

const innerGetCompositions = async (
	serveUrl: string,
	page: Page,
	config: GetCompositionsConfig
): Promise<TCompMetadata[]> => {
	if (config?.onBrowserLog) {
		page.on('console', (log) => {
			config.onBrowserLog?.({
				stackTrace: log.stackTrace(),
				text: log.text(),
				type: log.type(),
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

	await page.waitForFunction('window.ready === true');
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
	const downloadDir = makeAssetsDownloadTmpDir();

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

		// TODO: Make sure ffmpeg executable is passed internally
		prepareServer(
			serveUrlOrWebpackUrl,
			downloadDir,
			() => undefined,
			onError,
			config?.ffmpegExecutable ?? null
		)
			.then(({serveUrl, closeServer}) => {
				close = closeServer;
				return innerGetCompositions(serveUrl, page, config ?? {});
			})

			.then((comp) => resolve(comp))
			.catch((err) => {
				reject(err);
			})
			.finally(() => {
				cleanup();
				close?.();
				cleanupPageError();
			});
	});
};
