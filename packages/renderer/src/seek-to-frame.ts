import puppeteer from 'puppeteer-core';

export const seekToFrame = async ({
	frame,
	page,
}: {
	frame: number;
	page: puppeteer.Page;
}) => {
	await page.waitForFunction('window.ready === true');
	await page.evaluate((f) => {
		window.remotion_setFrame(f);
	}, frame);
	await page.waitForFunction('window.ready === true');
};
