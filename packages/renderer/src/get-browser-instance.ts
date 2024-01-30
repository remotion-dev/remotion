import {DEFAULT_BROWSER} from './browser';
import type {BrowserExecutable} from './browser-executable';
import type {HeadlessBrowser} from './browser/Browser';
import type {Page} from './browser/BrowserPage';
import type {LogLevel} from './log-level';
import type {ChromiumOptions} from './open-browser';
import {internalOpenBrowser} from './open-browser';

export const getPageAndCleanupFn = async ({
	passedInInstance,
	browserExecutable,
	chromiumOptions,
	forceDeviceScaleFactor,
	indent,
	logLevel,
}: {
	passedInInstance: HeadlessBrowser | undefined;
	browserExecutable: BrowserExecutable | null;
	chromiumOptions: ChromiumOptions;
	indent: boolean;
	forceDeviceScaleFactor: number | undefined;
	logLevel: LogLevel;
}): Promise<{
	cleanup: () => Promise<void>;
	page: Page;
}> => {
	if (passedInInstance) {
		const page = await passedInInstance.newPage(() => null, logLevel, indent);
		return {
			page,
			cleanup: () => {
				// Close puppeteer page and don't wait for it to finish.
				// Keep browser open.
				page.close().catch((err) => {
					console.error('Was not able to close puppeteer page', err);
				});
				return Promise.resolve();
			},
		};
	}

	const browserInstance = await internalOpenBrowser({
		browser: DEFAULT_BROWSER,
		browserExecutable,
		chromiumOptions,
		forceDeviceScaleFactor,
		indent,
		viewport: null,
		logLevel,
	});
	const browserPage = await browserInstance.newPage(
		() => null,
		logLevel,
		indent,
	);

	return {
		page: browserPage,
		cleanup: () => {
			// Close whole browser that was just created and don't wait for it to finish.
			browserInstance.close(true, logLevel, indent).catch((err) => {
				console.error('Was not able to close puppeteer page', err);
			});
			return Promise.resolve();
		},
	};
};
