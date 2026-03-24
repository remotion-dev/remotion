import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {BrowserReplacer} from './replace-browser';

const TARGET_FULL_CYCLE_MS = 600;
const MIN_CYCLE_INTERVAL_MS = 20;

export const getTabCycleIntervalMs = (concurrency: number) => {
	if (concurrency <= 1) {
		return 0;
	}

	return Math.max(
		MIN_CYCLE_INTERVAL_MS,
		Math.floor(TARGET_FULL_CYCLE_MS / concurrency),
	);
};

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
	const cycleInterval = getTabCycleIntervalMs(concurrency);
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
						return currentPage.bringToFront();
					}
				})

				.catch((err) => Log.error({indent, logLevel}, err))
				.finally(() => {
					if (!stopped) {
						set();
					}
				});
		}, cycleInterval);
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
