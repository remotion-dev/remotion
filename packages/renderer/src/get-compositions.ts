import puppeteer from 'puppeteer-core';
import {TCompMetadata} from 'remotion';
import {getLocalChromiumExecutable} from './get-local-chromium-executable';

export const getCompositions = async (
	webpackBundle: string
): Promise<TCompMetadata[]> => {
	const executablePath = await getLocalChromiumExecutable();
	try {
		const browser = await puppeteer.launch({
			executablePath,
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});
		const page = await browser.newPage();
		await page.goto(`file://${webpackBundle}/index.html?evaluation=true`);
		await page.waitForFunction('window.ready === true');
		const result = await page.evaluate('window.getStaticCompositions()');
		return result as TCompMetadata[];
	} catch (err) {
		throw new Error('Chrome or Chromium executable path is not working.');
	}
};
