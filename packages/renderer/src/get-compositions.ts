import {Browser as PuppeteerBrowser} from 'puppeteer-core';
import {Browser, Internals, TCompMetadata} from 'remotion';
import {openBrowser} from './open-browser';
import {setPropsAndEnv} from './set-props-and-env';

export const getCompositions = async (
	serveUrl: string,
	config?: {
		browser?: Browser;
		inputProps?: object | null;
		envVariables?: Record<string, string>;
		browserInstance?: PuppeteerBrowser;
	}
): Promise<TCompMetadata[]> => {
	const browserInstance =
		config?.browserInstance ??
		(await openBrowser(config?.browser || Internals.DEFAULT_BROWSER));
	const page = await browserInstance.newPage();

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

	// Close puppeteer page and don't wait for it to finish.
	page.close().catch((err) => {
		console.error('Was not able to close puppeteer page', err);
	});
	return result as TCompMetadata[];
};
