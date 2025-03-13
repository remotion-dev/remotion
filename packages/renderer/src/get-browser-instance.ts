import {DEFAULT_BROWSER} from './browser';
import type {BrowserExecutable} from './browser-executable';
import type {BrowserLog} from './browser-log';
import type {HeadlessBrowser} from './browser/Browser';
import type {Page} from './browser/BrowserPage';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {ChromiumOptions} from './open-browser';
import {internalOpenBrowser} from './open-browser';
import type {ChromeMode} from './options/chrome-mode';
import type {OnBrowserDownload} from './options/on-browser-download';

export const getPageAndCleanupFn = async ({
	passedInInstance,
	browserExecutable,
	chromiumOptions,
	forceDeviceScaleFactor,
	indent,
	logLevel,
	onBrowserDownload,
	chromeMode,
	pageIndex,
	onBrowserLog,
}: {
	passedInInstance: HeadlessBrowser | undefined;
	browserExecutable: BrowserExecutable | null;
	chromiumOptions: ChromiumOptions;
	indent: boolean;
	forceDeviceScaleFactor: number | undefined;
	logLevel: LogLevel;
	onBrowserDownload: OnBrowserDownload;
	chromeMode: ChromeMode;
	pageIndex: number;
	onBrowserLog: null | ((log: BrowserLog) => void);
}): Promise<{
	cleanupPage: () => Promise<void>;
	page: Page;
}> => {
	if (passedInInstance) {
		const page = await passedInInstance.newPage({
			context: () => null,
			logLevel,
			indent,
			pageIndex,
			onBrowserLog,
		});
		return {
			page,
			cleanupPage: () => {
				// Close puppeteer page and don't wait for it to finish.
				// Keep browser open.
				page.close().catch((err) => {
					if (!(err as Error).message.includes('Target closed')) {
						Log.error(
							{indent, logLevel},
							'Was not able to close puppeteer page',
							err,
						);
					}
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
		onBrowserDownload,
		chromeMode,
	});
	const browserPage = await browserInstance.newPage({
		context: () => null,
		logLevel,
		indent,
		pageIndex,
		onBrowserLog,
	});

	return {
		page: browserPage,
		cleanupPage: () => {
			// Close whole browser that was just created and don't wait for it to finish.
			browserInstance.close({silent: true}).catch((err) => {
				if (!(err as Error).message.includes('Target closed')) {
					Log.error(
						{indent, logLevel},
						'Was not able to close puppeteer page',
						err,
					);
				}
			});
			return Promise.resolve();
		},
	};
};
