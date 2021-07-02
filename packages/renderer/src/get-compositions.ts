import {Browser as PuppeteerBrowser, Page} from 'puppeteer-core';
import {Browser, Internals, TCompMetadata} from 'remotion';
import {openBrowser} from './open-browser';
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
	serveUrl: string,
	config?: GetCompositionsConfig
): Promise<TCompMetadata[]> => {
	const {page, cleanup} = await getPageAndCleanupFn({
		passedInInstance: config?.browserInstance,
		browser: config?.browser ?? Internals.DEFAULT_BROWSER,
	});

	page.on('error', console.error);
	page.on('pageerror', console.error);

	await setPropsAndEnv({
		inputProps: config?.inputProps,
		envVariables: config?.envVariables,
		page,
		serveUrl,
	});

	await page.goto(`${serveUrl}/index.html?evaluation=true`);
	await page.waitForFunction('window.ready === true');
	const result = await page.evaluate('window.getStaticCompositions()');

	cleanup();

	return result as TCompMetadata[];
};
