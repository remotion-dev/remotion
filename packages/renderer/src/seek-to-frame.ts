import {BrowserEmittedEvents} from './browser/Browser';
import type {Page} from './browser/BrowserPage';
import {PageEmittedEvents} from './browser/BrowserPage';
import {SymbolicateableError} from './error-handling/symbolicateable-error';
import {parseStack} from './parse-browser-error-stack';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';

export const waitForReady = ({
	page,
	timeoutInMilliseconds,
	frame,
}: {
	page: Page;
	timeoutInMilliseconds: number;
	frame: number | null;
}) =>
	Promise.race([
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
		page.mainFrame()._mainWorld.waitForFunction({
			browser: page.browser,
			timeout: timeoutInMilliseconds,
			pageFunction: 'window.remotion_renderReady === true',
			title:
				frame === null
					? 'the page to render the React component'
					: `the page to render the React component at frame ${frame}`,
		}),
		page
			.mainFrame()
			._mainWorld.waitForFunction({
				browser: page.browser,
				timeout: timeoutInMilliseconds,
				pageFunction: 'window.remotion_cancelledError !== undefined',
				title: 'remotion_cancelledError variable to appear on the page',
			})
			.then(() => {
				return puppeteerEvaluateWithCatch({
					pageFunction: () => window.remotion_cancelledError,
					args: [],
					frame: null,
					page,
				});
			})
			.then(({value: val}) => {
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

export const seekToFrame = async ({
	frame,
	page,
	composition,
	timeoutInMilliseconds,
}: {
	frame: number;
	composition: string;
	page: Page;
	timeoutInMilliseconds: number;
}) => {
	await waitForReady({page, timeoutInMilliseconds, frame: null});
	await puppeteerEvaluateWithCatch({
		pageFunction: (f: number, c: string) => {
			window.remotion_setFrame(f, c);
		},
		args: [frame, composition],
		frame,
		page,
	});
	await waitForReady({page, timeoutInMilliseconds, frame});
	await page.evaluateHandle('document.fonts.ready');
};
