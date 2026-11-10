import type {HeadlessBrowser} from './browser/Browser';
import type {Page} from './browser/BrowserPage';
import {isTargetClosedErr} from './browser/flaky-errors';
import type {LogLevel} from './log-level';
import {Log} from './logger';

/**
 * Browser slot state machine for a render.
 *
 * States:
 * - running:   `browser` is in use. `owned` is false if it was passed in by
 *              the user (we only close our pages), true if we launched it.
 * - replacing: the browser crashed. `previous` is being closed, then a new
 *              browser is launched (`launched`), then new pages are made.
 *              Concurrent replace requests share `promise`.
 * - closed:    terminal. The render finished and the browser was cleaned up.
 *
 * Transitions:
 * - running   + replace-started  -> replacing (launched: null)
 * - replacing + browser-launched -> replacing (launched: browser)
 * - replacing + pages-ready      -> running (launched, owned: true)
 * - replacing + replace-failed   -> running (launched ?? previous)
 * - running | replacing + closed -> closed
 * - closed    + any              -> closed
 * Any other combination leaves the state unchanged.
 */
export type BrowserSlot =
	| {type: 'running'; browser: HeadlessBrowser; owned: boolean}
	| {
			type: 'replacing';
			previous: HeadlessBrowser;
			previousOwned: boolean;
			launched: HeadlessBrowser | null;
			promise: Promise<HeadlessBrowser>;
	  }
	| {type: 'closed'; browser: HeadlessBrowser};

export type BrowserSlotEvent =
	| {type: 'replace-started'; promise: Promise<HeadlessBrowser>}
	| {type: 'browser-launched'; browser: HeadlessBrowser}
	| {type: 'pages-ready'}
	| {type: 'replace-failed'}
	| {type: 'closed'};

export const browserSlotReducer = (
	state: BrowserSlot,
	event: BrowserSlotEvent,
): BrowserSlot => {
	if (state.type === 'closed') {
		return state;
	}

	switch (event.type) {
		case 'replace-started':
			if (state.type !== 'running') {
				return state;
			}

			return {
				type: 'replacing',
				previous: state.browser,
				previousOwned: state.owned,
				launched: null,
				promise: event.promise,
			};
		case 'browser-launched':
			if (state.type !== 'replacing') {
				return state;
			}

			return {...state, launched: event.browser};
		case 'pages-ready':
			if (state.type !== 'replacing' || state.launched === null) {
				return state;
			}

			return {type: 'running', browser: state.launched, owned: true};
		case 'replace-failed':
			if (state.type !== 'replacing') {
				return state;
			}

			return {
				type: 'running',
				browser: state.launched ?? state.previous,
				owned: state.launched !== null ? true : state.previousOwned,
			};
		case 'closed':
			return {
				type: 'closed',
				browser:
					state.type === 'running'
						? state.browser
						: (state.launched ?? state.previous),
			};
		default:
			throw new Error('Unknown event ' + (event satisfies never));
	}
};

export type BrowserReplacer = {
	getBrowser: () => HeadlessBrowser;
	replaceBrowser: (
		make: () => Promise<HeadlessBrowser>,
		makeNewPages: () => Promise<void>,
	) => Promise<HeadlessBrowser>;
	close: (pagesToCloseIfBorrowed: Page[]) => void;
};

export const handleBrowserCrash = (
	instance: HeadlessBrowser,
	owned: boolean,
	logLevel: LogLevel,
	indent: boolean,
): BrowserReplacer => {
	let state: BrowserSlot = {type: 'running', browser: instance, owned};

	return {
		getBrowser: () => {
			if (state.type === 'replacing') {
				return state.launched ?? state.previous;
			}

			return state.browser;
		},
		replaceBrowser: (make, makeNewPages): Promise<HeadlessBrowser> => {
			if (state.type === 'replacing') {
				return state.promise;
			}

			if (state.type === 'closed') {
				return Promise.reject(
					new Error('Cannot replace the browser after the render has ended'),
				);
			}

			const previous = state.browser;
			const promise = (async () => {
				try {
					await previous
						.close({silent: true})
						.then(() => {
							Log.info(
								{indent, logLevel},
								'Killed previous browser and making new one',
							);
						})
						.catch(() => {
							// Ignore as browser crashed
						});
					const browser = await make();
					state = browserSlotReducer(state, {
						type: 'browser-launched',
						browser,
					});
					if (state.type === 'closed') {
						// Render ended while the new browser was launching
						browser.close({silent: true}).catch(() => undefined);
						throw new Error(
							'Cannot replace the browser after the render has ended',
						);
					}

					await makeNewPages();
					state = browserSlotReducer(state, {type: 'pages-ready'});
					Log.info({indent, logLevel}, 'Made new browser');
					return browser;
				} catch (err) {
					state = browserSlotReducer(state, {type: 'replace-failed'});
					throw err;
				}
			})();
			state = browserSlotReducer(state, {type: 'replace-started', promise});
			return promise;
		},
		close: (pagesToCloseIfBorrowed) => {
			if (state.type === 'closed') {
				return;
			}

			const isOwned =
				state.type === 'running'
					? state.owned
					: state.launched !== null || state.previousOwned;
			const browser =
				state.type === 'running'
					? state.browser
					: (state.launched ?? state.previous);
			state = browserSlotReducer(state, {type: 'closed'});

			// If browser instance was passed in, we close all the pages
			// we opened.
			// If we opened the browser (or replaced it after a crash),
			// we close it.
			if (isOwned) {
				browser.close({silent: true}).catch((err) => {
					if (!(err as Error | undefined)?.message.includes('Target closed')) {
						Log.error({indent, logLevel}, 'Unable to close browser', err);
					}
				});
				return;
			}

			Promise.all(pagesToCloseIfBorrowed.map((p) => p.close())).catch((err) => {
				if (isTargetClosedErr(err)) {
					return;
				}

				Log.error({indent, logLevel}, 'Unable to close browser tab', err);
			});
		},
	};
};
