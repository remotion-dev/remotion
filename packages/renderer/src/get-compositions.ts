import puppeteer from 'puppeteer-core';
import {TCompMetadata} from 'remotion';

export const getCompositions = async (
	webpackBundle: string
): Promise<TCompMetadata[]> => {
	const browser = await puppeteer.launch({
		executablePath: '/usr/bin/google-chrome-stable',
	});
	const page = await browser.newPage();

	await page.goto(`file://${webpackBundle}/index.html?evaluation=true`);
	await page.waitForFunction('window.ready === true');
	const result = await page.evaluate('window.getStaticCompositions()');
	return result as TCompMetadata[];
};
