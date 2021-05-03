export type Browser = 'chrome' | 'firefox';

export const DEFAULT_BROWSER: Browser = 'chrome';

let currentBrowser: Browser | null = null;

export const setBrowser = (browser: Browser) => {
	if (browser === 'chrome') {
		process.env.PUPPETEER_PRODUCT = 'chrome';
	}

	if (browser === 'firefox') {
		process.env.PUPPETEER_PRODUCT = 'firefox';
	}

	currentBrowser = browser;
};

export const getBrowser = () => {
	return currentBrowser;
};
