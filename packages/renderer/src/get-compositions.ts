import {Browser, CDPSession, Page} from 'puppeteer-core';
import {BrowserExecutable, TCompMetadata} from 'remotion';
import {BrowserLog} from './browser-log';
import {getPageAndCleanupFn} from './get-browser-instance';
import {handleJavascriptException} from './error-handling/handle-javascript-exception';
import {ChromiumOptions} from './open-browser';
import {prepareServer} from './prepare-server';
import {_evaluateInternal} from './puppeteer-evaluate';
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

	const contextId = (await page.mainFrame().executionContext())._contextId;
	const client = (page as unknown as {_client: CDPSession})._client;

	await _evaluateInternal({
		client,
		contextId,
		pageFunction: () => {
			window.setBundleMode({
				type: 'evaluation',
			});
		},
	});

	await page.waitForFunction('window.ready === true');
	const result = await page.evaluate(() => {
		return window.getStaticCompositions();
	});

	return result as TCompMetadata[];
};

export const getCompositions = async (
	serveUrlOrWebpackUrl: string,
	config?: GetCompositionsConfig
) => {
	const {serveUrl, closeServer} = await prepareServer(serveUrlOrWebpackUrl);
	const {page, cleanup} = await getPageAndCleanupFn({
		passedInInstance: config?.puppeteerInstance,
		browserExecutable: config?.browserExecutable ?? null,
		chromiumOptions: config?.chromiumOptions ?? {},
	});

	return new Promise<TCompMetadata[]>((resolve, reject) => {
		const cleanupPageError = handleJavascriptException({
			page,
			onError: (err) => {
				return reject(err);
			},
			frame: null,
		});

		// eslint-disable-next-line promise/catch-or-return
		innerGetCompositions(serveUrl, page, config ?? {})
			.then((comp) => resolve(comp))
			.catch((err) => {
				reject(err);
			})
			.finally(() => {
				cleanup();
				closeServer();
				cleanupPageError();
			});
	});
};
