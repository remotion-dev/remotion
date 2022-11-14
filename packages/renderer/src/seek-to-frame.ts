import {BrowserEmittedEvents} from './browser/Browser';
import type {Page} from './browser/BrowserPage';
import {PageEmittedEvents} from './browser/BrowserPage';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';

export const waitForReady = (page: Page) => {
	return Promise.race([
		new Promise((_, reject) => {
			page.on(PageEmittedEvents.Disposed, () => {
				reject(new Error('Target closed (page disposed)'));
			});
		}),
		new Promise((_, reject) => {
			page.browser.on(BrowserEmittedEvents.ClosedSilent, () => {
				reject(new Error('Target closed'));
			});
		}),
		page
			.mainFrame()
			._mainWorld.waitForFunction(page.browser, 'window.ready === true')
			.catch((err) => {
				throw err;
			}),
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
