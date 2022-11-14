import type {BrowserReplacer} from './replace-browser';

export const cycleBrowserTabs = (
	puppeteerInstance: BrowserReplacer,
	concurrency: number
): {
	stopCycling: () => void;
} => {
	if (concurrency <= 1) {
		return {
			stopCycling: () => undefined,
		};
	}

	let interval: NodeJS.Timeout | null = null;
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
						return currentPage.bringToFront();
					}
				})
				.then(() => {
					set();
				})
				.catch((err) => console.log(err));
		}, 200);
	};

	set();

	return {
		stopCycling: () => {
			if (!interval) {
				return;
			}

			stopped = true;

			return clearInterval(interval);
		},
	};
};
