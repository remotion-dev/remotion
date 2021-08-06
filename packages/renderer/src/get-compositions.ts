import {Browser as PuppeteerBrowser, Page} from 'puppeteer-core';
import {Browser, Internals, TCompMetadata} from 'remotion';
import {openBrowser} from './open-browser';
import {serveStatic} from './serve-static';
import {setPropsAndEnv} from './set-props-and-env';

type GetCompositionsConfig = {
	browser?: Browser;
	inputProps?: object | null;
	envVariables?: Record<string, string>;
	browserInstance?: PuppeteerBrowser;
};

const getPageAndCleanupFn = async ({
	passedInInstance,
	browser,
}: {
	passedInInstance: PuppeteerBrowser | undefined;
	browser: Browser;
}): Promise<{
	cleanup: () => void;
	page: Page;
}> => {
	if (passedInInstance) {
		const page = await passedInInstance.newPage();
		return {
			page,
			cleanup: () => {
				// Close puppeteer page and don't wait for it to finish.
				// Keep browser open.
				page.close().catch((err) => {
					console.error('Was not able to close puppeteer page', err);
				});
			},
		};
	}

	const browserInstance = await openBrowser(
		browser || Internals.DEFAULT_BROWSER
	);
	const browserPage = await browserInstance.newPage();

	return {
		page: browserPage,
		cleanup: () => {
			// Close whole browser that was just created and don't wait for it to finish.
			browserInstance.close().catch((err) => {
				console.error('Was not able to close puppeteer page', err);
			});
		},
	};
};

export const getCompositions = async (
	webpackBundle: string,
	config?: GetCompositionsConfig
): Promise<TCompMetadata[]> => {
	const {page, cleanup} = await getPageAndCleanupFn({
		passedInInstance: config?.browserInstance,
		browser: config?.browser ?? Internals.DEFAULT_BROWSER,
	});

	const {port, close} = await serveStatic(webpackBundle);
	page.on('error', console.error);
	page.on('pageerror', console.error);

	await setPropsAndEnv({
		inputProps: config?.inputProps,
		envVariables: config?.envVariables,
		page,
		port,
		initialFrame: 0,
	});

	await page.goto(`http://localhost:${port}/index.html?evaluation=true`);
	await page.waitForFunction('window.ready === true');
	const result = await page.evaluate('window.getStaticCompositions()');

	// Close web server and don't wait for it to finish,
	// it is slow.
	close().catch((err) => {
		console.error('Was not able to close web server', err);
	});
	cleanup();

	return result as TCompMetadata[];
};
