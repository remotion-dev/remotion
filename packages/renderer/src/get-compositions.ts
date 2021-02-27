import puppeteer from 'puppeteer';
import {TCompMetadata} from 'remotion';
import {serveStatic} from './serve-static';

export const getCompositions = async (
	webpackBundle: string
): Promise<TCompMetadata[]> => {
	const browser = await puppeteer.launch({
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
		],
	});
	const page = await browser.newPage();
	const {port, server} = await serveStatic(webpackBundle);

	await page.goto(`http://localhost:${port}/index.html?evaluation=true`);
	await page.waitForFunction('window.ready === true');
	const result = await page.evaluate('window.getStaticCompositions()');
	server.close();
	return result as TCompMetadata[];
};
