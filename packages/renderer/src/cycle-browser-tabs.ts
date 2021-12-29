import {openBrowser} from './open-browser';

type Await<T> = T extends PromiseLike<infer U> ? U : T;

export const cycleBrowserTabs = (
	openedBrowser: Await<ReturnType<typeof openBrowser>>
) => {
	let i = 0;
	const interval = setInterval(() => {
		openedBrowser
			.pages()
			.then((pages) => {
				const currentPage = pages[i % pages.length];
				i++;
				if (!currentPage.isClosed()) {
					currentPage.bringToFront();
				}
			})
			.catch((err) => console.log(err));
	}, 100);

	return {
		stopCycling: () => clearInterval(interval),
	};
};
