export type Browser = 'chrome' | 'firefox';

export const DEFAULT_BROWSER: Browser = 'chrome';

// There is no Firefox support yet, the waitForFunction method
// does not yet work and downloading has a bug.
// Disabling this for now!
export const FEATURE_FLAG_FIREFOX_SUPPORT = false;

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
