import {Browser, Internals, TCompMetadata} from 'remotion';
import {openBrowser} from '.';

export const getCompositions = async (
	webpackBundle: string,
	browser: Browser = Internals.DEFAULT_BROWSER
): Promise<TCompMetadata[]> => {
	const browserInstance = await openBrowser(browser);
	const page = await browserInstance.newPage();
	await page.goto(`file://${webpackBundle}/index.html?evaluation=true`);
	await page.waitForFunction('window.ready === true');
	const result = await page.evaluate('window.getStaticCompositions()');
	return result as TCompMetadata[];
};
