import {isTargetClosedErr} from './browser/flaky-errors';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {BrowserReplacer} from './replace-browser';

export const cycleBrowserTabs = ({
	puppeteerInstance,
	concurrency,
	logLevel,
	indent,
}: {
	puppeteerInstance: BrowserReplacer;
	concurrency: number;
	logLevel: LogLevel;
	indent: boolean;
}): {
	stopCycling: () => void;
} => {
	if (concurrency <= 1) {
		return {
			stopCycling: () => undefined,
		};
	}

	let interval: Timer | null = null;
	let i = 0;
	let stopped = false;
	const set = () => {
		interval = setTimeout(() => {
			puppeteerInstance
				.getBrowser()
				.pages()
				.then((pages) => {
					if (pages.length === 0) {
						return;
					}

					const currentPage = pages[i % pages.length];
					i++;
					if (
						!currentPage?.closed &&
						!stopped &&
						currentPage?.url() !== 'about:blank'
					) {
						return currentPage.bringToFront().catch((err) => {
							// The tabs are closed at the end of a render while a
							// bringToFront() may still be in flight. Only that case is ignored.
							if (stopped && isTargetClosedErr(err)) {
								return;
							}

							throw err;
						});
					}
				})

				.catch((err) => Log.error({indent, logLevel}, err))
				.finally(() => {
					if (!stopped) {
						set();
					}
				});
		}, 200);
	};

	set();

	return {
		stopCycling: () => {
			if (!interval) {
				return;
			}

			stopped = true;

			return clearTimeout(interval);
		},
	};
};
