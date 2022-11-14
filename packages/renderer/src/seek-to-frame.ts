import type {Page} from './browser/BrowserPage';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';

export const waitForReady = (page: Page) => {
	return Promise.race([
		new Promise((_, reject) => {
			page.browser.once(BrowserEmittedEvents.ClosedSilent, () => {
				reject(new Error('Target closed'));
			});
		}),
		page
			.mainFrame()
			._mainWorld.waitForFunction(page.browser, 'window.ready === true'),
	]);
};

export const seekToFrame = async ({
	frame,
	page,
}: {
	frame: number;
	page: Page;
}) => {
	await waitForReady(page);
	await puppeteerEvaluateWithCatch({
		pageFunction: (f: number) => {
			window.remotion_setFrame(f);
		},
		args: [frame],
		frame,
		page,
	});
	await waitForReady(page);
	await page.evaluateHandle('document.fonts.ready');
};
