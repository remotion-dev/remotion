import {Browser, Internals, TCompMetadata} from 'remotion';
import {openBrowser} from '.';
import {serveStatic} from './serve-static';

export const getCompositions = async (
	webpackBundle: string,
	browser: Browser = Internals.DEFAULT_BROWSER,
	userProps: unknown
): Promise<TCompMetadata[]> => {
	const browserInstance = await openBrowser(browser);
	const page = await browserInstance.newPage();

	const {port, close} = await serveStatic(webpackBundle);

	await page.goto(
		`http://localhost:${port}/index.html?evaluation=true&props=${encodeURIComponent(
			JSON.stringify(userProps)
		)}`
	);
	await page.waitForFunction('window.ready === true');
	const result = await page.evaluate('window.getStaticCompositions()');
	await close();
	return result as TCompMetadata[];
};
