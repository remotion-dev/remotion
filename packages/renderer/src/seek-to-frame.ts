import {RenderInternals} from '.';
import {BrowserEmittedEvents} from './browser/Browser';
import type {Page} from './browser/BrowserPage';
import {PageEmittedEvents} from './browser/BrowserPage';
import type {JSHandle} from './browser/JSHandle';
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
}) => {
	const waitForReadyProm = new Promise<JSHandle>((resolve, reject) => {
		page
			.mainFrame()
			._mainWorld.waitForFunction({
				browser: page.browser,
				// Increase timeout so the delayRender() timeout fires earlier
				timeout: timeoutInMilliseconds + 3000,
				pageFunction: 'window.remotion_renderReady === true',
				title:
					frame === null
						? 'the page to render the React component'
						: `the page to render the React component at frame ${frame}`,
				shouldClosePage: false,
			})
			.then((a) => resolve(a))
			.catch((err) => {
				if (
					(err as Error).message.includes('timeout') &&
					(err as Error).message.includes('exceeded')
				) {
					puppeteerEvaluateWithCatch({
						pageFunction: () => {
							return Object.keys(window.remotion_delayRenderTimeouts)
								.map((id, i) => {
									const {label} = window.remotion_delayRenderTimeouts[id];
									if (label === null) {
										return `${i + 1}. (no label)`;
									}

									return `"${i + 1}. ${label}"`;
								})
								.join(', ');
						},
						args: [],
						frame,
						page,
					})
						.then((res) => {
							reject(
								new Error(
									`Timeout exceeded rendering the component${
										frame ? ' at frame ' + frame : ''
									}. ${
										res.value ? `Open delayRender() handles: ${res.value}` : ''
									}`,
								),
							);
						})
						.catch((newErr) => {
							RenderInternals.Log.warn(
								'Tried to get delayRender() handles for timeout, but could not do so because of',
								newErr,
							);
							// Ignore, use prev error
							reject(err);
						});
				} else {
					reject(err);
				}
			});
	});

	const waitForErrorProm = new Promise((_shouldNeverResolve, reject) => {
		page
			.mainFrame()
			._mainWorld.waitForFunction({
				browser: page.browser,
				timeout: null,
				pageFunction: 'window.remotion_cancelledError !== undefined',
				title: 'remotion_cancelledError variable to appear on the page',
				shouldClosePage: false,
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
					reject(val);
					return;
				}

				reject(
					new SymbolicateableError({
						frame: null,
						stack: val,
						name: 'CancelledError',
						message: val.split('\n')[0],
						stackFrame: parseStack(val.split('\n')),
					}),
				);
			})
			.catch((err) => {
				if (
					(err as Error).message.includes('timeout') &&
					(err as Error).message.includes('exceeded')
				) {
					// Don't care if a error never appeared
				} else {
					reject(err);
				}
			});
	});

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
		waitForReadyProm,
		waitForErrorProm,
	]);
};

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
