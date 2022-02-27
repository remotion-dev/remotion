import {Browser, Page} from 'puppeteer-core';
import {BrowserExecutable, TCompMetadata} from 'remotion';
import {BrowserLog} from './browser-log';
import {getPageAndCleanupFn} from './get-browser-instance';
import {ChromiumOptions} from './open-browser';
import {prepareServer} from './prepare-server';
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
	config: GetCompositionsConfig & {
		onError: (err: Error) => void;
	}
): Promise<TCompMetadata[]> => {
	page.on('error', (err) => {
		console.log(err);
		config.onError(err);
	});
	page.on('pageerror', (err) => {
		console.log(err);
		config.onError(err);
	});
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

	await page.evaluate(() => {
		window.setBundleMode({
			type: 'evaluation',
		});
	});

	await page.waitForFunction('window.ready === true');
	const result = await page.evaluate('window.getStaticCompositions()');

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
		// eslint-disable-next-line promise/catch-or-return
		innerGetCompositions(serveUrl, page, {
			...(config ?? {}),
			onError: (err) => {
				reject(err);
			},
		})
			.then((comp) => resolve(comp))
			.catch((err) => {
				reject(err);
			})
			.finally(() => {
				cleanup();
				closeServer();
			});
	});
};
