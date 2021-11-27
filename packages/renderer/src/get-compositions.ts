import {Browser, Page} from 'puppeteer-core';
import {BrowserExecutable, TCompMetadata} from 'remotion';
import {BrowserLog} from './browser-log';
import {getPageAndCleanupFn} from './get-browser-instance';
import {normalizeServeUrl} from './normalize-serve-url';
import {prepareServer} from './prepare-server';
import {setPropsAndEnv} from './set-props-and-env';

type GetCompositionsConfig = {
	inputProps?: object | null;
	envVariables?: Record<string, string>;
	puppeteerInstance?: Browser;
	onBrowserLog?: (log: BrowserLog) => void;
	browserExecutable?: BrowserExecutable;
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

	await setPropsAndEnv({
		inputProps: config?.inputProps,
		envVariables: config?.envVariables,
		page,
		serveUrl,
		initialFrame: 0,
	});

	const urlToVisit = `${normalizeServeUrl(serveUrl)}?evaluation=true`;
	const pageRes = await page.goto(urlToVisit);
	if (pageRes.status() !== 200) {
		throw new Error(
			`Error while getting compositions: Tried to go to ${urlToVisit} but the status code was not 200 as expected, but ${pageRes.status()}. Does the site you specified exist?`
		);
	}

	const isRemotionFn = await page.evaluate('window.getStaticCompositions');
	if (isRemotionFn === undefined) {
		throw new Error(
			`Error while getting compositions: Tried to go to ${urlToVisit} and verify that it is a Remotion project by checking if window.getStaticCompositions is defined. However, the function was undefined, which indicates that this is not a valid Remotion project. Please check the URL you passed.`
		);
	}

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
