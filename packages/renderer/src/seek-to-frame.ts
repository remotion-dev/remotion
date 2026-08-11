import {BrowserEmittedEvents} from './browser/Browser';
import type {Page} from './browser/BrowserPage';
import {PageEmittedEvents} from './browser/BrowserPage';
import type {JSHandle} from './browser/JSHandle';
import {SymbolicateableError} from './error-handling/symbolicateable-error';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import {parseStack} from './parse-browser-error-stack';
import {
	puppeteerEvaluateWithCatch,
	puppeteerEvaluateWithCatchAndTimeout,
} from './puppeteer-evaluate';

type Fn = () => void;

const cancelledToken = 'cancelled';
const readyToken = 'ready';

export const waitForReady = ({
	page,
	timeoutInMilliseconds,
	frame,
	indent,
	logLevel,
}: {
	page: Page;
	timeoutInMilliseconds: number;
	frame: number | null;
	indent: boolean;
	logLevel: LogLevel;
}) => {
	const cleanups: Fn[] = [];

	const retrieveCancelledErrorAndReject = () => {
		return new Promise((_, reject) => {
			puppeteerEvaluateWithCatch({
				pageFunction: () => window.remotion_cancelledError,
				args: [],
				frame: null,
				page,
				timeoutInMilliseconds,
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
							chunk: null,
						}),
					);
				})
				.catch((err) => {
					Log.verbose({indent, logLevel}, 'Could not get cancelled error', err);
					reject(new Error('Render was cancelled using cancelRender()'));
				});
		});
	};

	const waitForReadyProm = new Promise<JSHandle>((resolve, reject) => {
		const waitTask = page.mainFrame()._mainWorld.waitForFunction({
			browser: page.browser,
			// Increase timeout so the delayRender() timeout fires earlier
			timeout: timeoutInMilliseconds + 3000,
			pageFunction: `window.remotion_renderReady === true ? "${readyToken}" : window.remotion_cancelledError !== undefined ? "${cancelledToken}" : false`,
			title:
				frame === null
					? 'the page to render the React component'
					: `the page to render the React component at frame ${frame}`,
		});

		cleanups.push(() => {
			waitTask.terminate(new Error('cleanup'));
		});

		waitTask.promise
			.then((a) => {
				const token = a.toString() as typeof cancelledToken | typeof readyToken;
				if (token === cancelledToken) {
					return retrieveCancelledErrorAndReject();
				}

				if (token === readyToken) {
					return resolve(a);
				}

				reject(new Error('Unexpected token ' + token));
			})
			.catch((err) => {
				if (
					(err as Error).message.includes('timeout') &&
					(err as Error).message.includes('exceeded')
				) {
					puppeteerEvaluateWithCatchAndTimeout({
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
						timeoutInMilliseconds: 5000,
					})
						.then((res) => {
							reject(
								new Error(
									`Timeout (${timeoutInMilliseconds}ms) exceeded rendering the component${
										frame ? ' at frame ' + frame : ' initially'
									}. ${
										res.value ? `Open delayRender() handles: ${res.value}` : ''
									}. You can increase the timeout using the "timeoutInMilliseconds" / "--timeout" option of the function or command you used to trigger this render.`,
								),
							);
						})
						.catch((newErr) => {
							Log.warn(
								{indent, logLevel},
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

	const onDisposedPromise = new Promise((_, reject) => {
		const onDispose = () => {
			reject(new Error('Target closed (page disposed)'));
		};

		page.on(PageEmittedEvents.Disposed, onDispose);

		cleanups.push(() => {
			page.off(PageEmittedEvents.Disposed, onDispose);
		});
	});

	const onClosedSilentPromise = new Promise((_, reject) => {
		const onClosedSilent = () => {
			reject(new Error('Target closed'));
		};

		page.browser.on(BrowserEmittedEvents.ClosedSilent, onClosedSilent);

		cleanups.push(() => {
			page.browser.off(BrowserEmittedEvents.ClosedSilent, onClosedSilent);
		});
	});

	return Promise.race([
		onDisposedPromise,
		onClosedSilentPromise,
		waitForReadyProm,
	]).finally(() => {
		cleanups.forEach((cleanup) => {
			cleanup();
		});
	});
};

export const seekToFrame = async ({
	frame,
	page,
	composition,
	timeoutInMilliseconds,
	logLevel,
	indent,
	attempt,
}: {
	frame: number;
	composition: string;
	page: Page;
	timeoutInMilliseconds: number;
	logLevel: LogLevel;
	indent: boolean;
	attempt: number;
}) => {
	await waitForReady({
		page,
		timeoutInMilliseconds,
		frame: null,
		indent,
		logLevel,
	});
	await puppeteerEvaluateWithCatchAndTimeout({
		pageFunction: (f: number, c: string, a: number) => {
			window.remotion_setFrame(f, c, a);
		},
		args: [frame, composition, attempt],
		frame,
		page,
		timeoutInMilliseconds,
	});
	await waitForReady({page, timeoutInMilliseconds, frame, indent, logLevel});
	await page.evaluateHandle('document.fonts.ready');
};
