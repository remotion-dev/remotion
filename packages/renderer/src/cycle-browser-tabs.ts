import type {openBrowser} from './open-browser';

type Await<T> = T extends PromiseLike<infer U> ? U : T;
type Browser = Await<ReturnType<typeof openBrowser>>;

export const cycleBrowserTabs = (
	puppeteerInstance: Browser,
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
				.pages()
				.then((pages) => {
					if (pages.length === 0) {
						return;
					}

					const currentPage = pages[i % pages.length];
					i++;
					if (
						!currentPage?.isClosed?.() &&
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
