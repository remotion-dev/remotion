import {Browser as PuppeteerBrowser} from 'puppeteer-core';
import {Browser, Internals, TCompMetadata} from 'remotion';

export const getCompositions = async (config: {
	serveUrl: string;
	browser?: Browser;
	inputProps?: object | null;
	browserInstance: PuppeteerBrowser;
}): Promise<TCompMetadata[]> => {
	const browserInstance = config?.browserInstance;
	const page = await browserInstance.newPage();

	if (config?.inputProps) {
		await page.goto(`${config.serveUrl}/index.html`);
		await page.evaluate(
			(key, input) => {
				window.localStorage.setItem(key, input);
			},
			Internals.INPUT_PROPS_KEY,
			JSON.stringify(config.inputProps)
		);
	}

	await page.goto(`${config.serveUrl}/index.html?evaluation=true`);
	await page.waitForFunction('window.ready === true');
	const result = await page.evaluate('window.getStaticCompositions()');

	// Close puppeteer page and don't wait for it to finish.
	page.close().catch((err) => {
		console.error('Was not able to close puppeteer page', err);
	});
	return result as TCompMetadata[];
};
