import {DEFAULT_BROWSER} from './browser';
import type {BrowserExecutable} from './browser-executable';
import type {HeadlessBrowser} from './browser/Browser';
import type {Page} from './browser/BrowserPage';
import type {ChromiumOptions} from './open-browser';
import {internalOpenBrowser} from './open-browser';
import type {AnySourceMapConsumer} from './symbolicate-stacktrace';

export const getPageAndCleanupFn = async ({
	passedInInstance,
	browserExecutable,
	chromiumOptions,
	context,
	forceDeviceScaleFactor,
	indent,
	shouldDumpIo,
}: {
	passedInInstance: HeadlessBrowser | undefined;
	browserExecutable: BrowserExecutable | null;
	chromiumOptions: ChromiumOptions;
	context: AnySourceMapConsumer | null;
	indent: boolean;
	forceDeviceScaleFactor: number | undefined;
	shouldDumpIo: boolean;
}): Promise<{
	cleanup: () => void;
	page: Page;
}> => {
	if (passedInInstance) {
		const page = await passedInInstance.newPage(context);
		return {
			page,
			cleanup: () => {
				// Close puppeteer page and don't wait for it to finish.
				// Keep browser open.
				page.close().catch((err) => {
					console.error('Was not able to close puppeteer page', err);
				});
			},
		};
	}

	const browserInstance = await internalOpenBrowser({
		browser: DEFAULT_BROWSER,
		browserExecutable,
		chromiumOptions,
		forceDeviceScaleFactor,
		indent,
		shouldDumpIo,
		viewport: null,
	});
	const browserPage = await browserInstance.newPage(context);

	return {
		page: browserPage,
		cleanup: () => {
			// Close whole browser that was just created and don't wait for it to finish.
			browserInstance.close(true).catch((err) => {
				console.error('Was not able to close puppeteer page', err);
			});
		},
	};
};
