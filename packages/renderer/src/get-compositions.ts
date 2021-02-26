import puppeteer from 'puppeteer-core';
import {Browser, Internals, TCompMetadata} from 'remotion';
import {
	ensureLocalBrowser,
	getLocalBrowserExecutable,
} from './get-local-chromium-executable';

export const getCompositions = async (
	webpackBundle: string,
	browser: Browser = Internals.DEFAULT_BROWSER
): Promise<TCompMetadata[]> => {
	await ensureLocalBrowser(browser);
	const executablePath = await getLocalBrowserExecutable(browser);
	const browserInstance = await puppeteer.launch({
		executablePath,
		product: browser,
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
		],
	});
	const page = await browserInstance.newPage();
	await page.goto(`file://${webpackBundle}/index.html?evaluation=true`);
	await page.waitForFunction('window.ready === true');
	const result = await page.evaluate('window.getStaticCompositions()');
	return result as TCompMetadata[];
};
