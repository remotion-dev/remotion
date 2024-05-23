import type {HeadlessBrowser} from './browser/Browser';

const browserInstances: HeadlessBrowser[] = [];

export const killAllBrowsers = async () => {
	for (const browser of browserInstances) {
		try {
			await browser.close(true, 'info', false);
		} catch (err) {}
	}
};

export const addHeadlessBrowser = (browser: HeadlessBrowser) => {
	browserInstances.push(browser);
};

export const removeHeadlessBrowser = (browser: HeadlessBrowser) => {
	browserInstances.splice(browserInstances.indexOf(browser), 1);
};
