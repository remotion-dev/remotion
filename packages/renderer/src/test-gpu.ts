import type {BrowserExecutable} from './browser-executable';
import {getPageAndCleanupFn} from './get-browser-instance';
import type {LogLevel} from './log-level';
import type {ChromiumOptions} from './open-browser';
import type {ChromeMode} from './options/chrome-mode';
import type {OnBrowserDownload} from './options/on-browser-download';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';

type Item = {
	feature: string;
	status: string;
};

export const getChromiumGpuInformation = async ({
	browserExecutable,
	indent,
	logLevel,
	chromiumOptions,
	timeoutInMilliseconds,
	onBrowserDownload,
	chromeMode,
}: {
	browserExecutable: BrowserExecutable;
	indent: boolean;
	logLevel: LogLevel;
	chromiumOptions: ChromiumOptions;
	timeoutInMilliseconds: number;
	onBrowserDownload: OnBrowserDownload;
	chromeMode: ChromeMode;
}) => {
	const {page, cleanupPage: cleanup} = await getPageAndCleanupFn({
		passedInInstance: undefined,
		browserExecutable,
		chromiumOptions,
		forceDeviceScaleFactor: undefined,
		indent,
		logLevel,
		onBrowserDownload,
		chromeMode,
		pageIndex: 0,
		onBrowserLog: null,
	});

	await page.goto({url: 'chrome://gpu', timeout: 12000});

	const {value} = await puppeteerEvaluateWithCatch<Item[]>({
		pageFunction: (): Item[] => {
			const statuses: Item[] = [];

			const items = document
				.querySelector('info-view')
				?.shadowRoot?.querySelector('ul')
				?.querySelectorAll('li');

			[].forEach.call(items, (item: HTMLLIElement) => {
				// do whatever
				const [feature, status] = item.innerText.split(': ');
				statuses.push({
					feature,
					status,
				});
			});

			return statuses;
		},
		frame: null,
		args: [],
		page,
		timeoutInMilliseconds,
	});

	cleanup();

	return value;
};
