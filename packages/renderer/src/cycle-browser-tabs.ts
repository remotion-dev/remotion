import {openBrowser} from './open-browser';

type Await<T> = T extends PromiseLike<infer U> ? U : T;

export const cycleBrowserTabs = (
	puppeteerInstance: Await<ReturnType<typeof openBrowser>>,
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
	const set = () => {
		interval = setTimeout(() => {
			puppeteerInstance
				.pages()
				.then((pages) => {
					const currentPage = pages[i % pages.length];
					i++;
					if (!(currentPage?.isClosed?.() ?? true)) {
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

			return clearInterval(interval);
		},
	};
};
