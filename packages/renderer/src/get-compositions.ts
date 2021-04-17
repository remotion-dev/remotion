import {Browser as PuppeteerBrowser} from 'puppeteer-core';
import {Browser, Internals, TCompMetadata} from 'remotion';
import {openBrowser} from '.';
import {serveStatic} from './serve-static';

export const getCompositions = async (
	webpackBundle: string,
	config?: {
		browser?: Browser;
		inputProps?: object | null;
		browserInstance?: PuppeteerBrowser;
	}
): Promise<TCompMetadata[]> => {
	const browserInstance =
		config?.browserInstance ??
		(await openBrowser(config?.browser || Internals.DEFAULT_BROWSER));
	const page = await browserInstance.newPage();

	const {port, close} = await serveStatic(webpackBundle);

	if (config?.inputProps) {
		await page.goto(`http://localhost:${port}/index.html`);
		await page.evaluate(
			(key, input) => {
				window.localStorage.setItem(key, input);
			},
			Internals.INPUT_PROPS_KEY,
			JSON.stringify(config.inputProps)
		);
	}

	await page.goto(
		`http://localhost:${port}/index.html?evaluation=true&props=${encodeURIComponent(
			JSON.stringify(config?.inputProps ?? null)
		)}`
	);
	await page.waitForFunction('window.ready === true');
	const result = await page.evaluate('window.getStaticCompositions()');
	await Promise.all([close(), page.close()]);
	return result as TCompMetadata[];
};
