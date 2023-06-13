import {BrowserEmittedEvents} from './browser/Browser';
import type {Page} from './browser/BrowserPage';
import {PageEmittedEvents} from './browser/BrowserPage';
import {SymbolicateableError} from './error-handling/symbolicateable-error';
import {parseStack} from './parse-browser-error-stack';
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
			._mainWorld.waitForFunction(
				page.browser,
				'window.remotion_renderReady === true'
			)
			.catch((err) => {
				throw err;
			}),
		page
			.mainFrame()
			._mainWorld.waitForFunction(
				page.browser,
				'window.remotion_cancelledError !== undefined'
			)
			.then(() => {
				return puppeteerEvaluateWithCatch({
					pageFunction: () => window.remotion_cancelledError,
					args: [],
					frame: null,
					page,
				});
			})
			.then((val) => {
				if (typeof val !== 'string') {
					throw val;
				}

				throw new SymbolicateableError({
					frame: null,
					stack: val,
					name: 'CancelledError',
					message: val.split('\n')[0],
					stackFrame: parseStack(val.split('\n')),
				});
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
