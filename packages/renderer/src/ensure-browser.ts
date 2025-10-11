import fs from 'fs';
import type {BrowserExecutable} from './browser-executable';
import {downloadBrowser, getRevisionInfo} from './browser/BrowserFetcher';
import {defaultBrowserDownloadProgress} from './browser/browser-download-progress-bar';
import type {BrowserSafeApis} from './client';
import type {ChromeMode} from './options/chrome-mode';
import type {ToOptions} from './options/option';

export type BrowserStatus =
	| {
			type: 'user-defined-path';
			path: string;
	  }
	| {
			type: 'local-puppeteer-browser';
			path: string;
	  }
	| {
			type: 'no-browser';
	  };

type InternalEnsureBrowserOptions = {
	browserExecutable: BrowserExecutable;
	indent: boolean;
	chromeMode: ChromeMode;
} & ToOptions<typeof BrowserSafeApis.optionsMap.ensureBrowser>;

export type EnsureBrowserOptions = Partial<
	{
		browserExecutable: BrowserExecutable;
	} & ToOptions<typeof BrowserSafeApis.optionsMap.ensureBrowser>
>;

let currentEnsureBrowserOperation: Promise<unknown> = Promise.resolve();

const internalEnsureBrowserUncapped = async ({
	indent,
	logLevel,
	browserExecutable,
	onBrowserDownload,
	chromeMode,
}: InternalEnsureBrowserOptions): Promise<BrowserStatus> => {
	const status = getBrowserStatus({browserExecutable, chromeMode});
	if (status.type === 'no-browser') {
		const {onProgress, version} = onBrowserDownload({chromeMode});

		await downloadBrowser({indent, logLevel, onProgress, version, chromeMode});
	}

	const newStatus = getBrowserStatus({browserExecutable, chromeMode});
	return newStatus;
};

export const internalEnsureBrowser = (
	options: InternalEnsureBrowserOptions,
): Promise<BrowserStatus> => {
	currentEnsureBrowserOperation = currentEnsureBrowserOperation.then(() =>
		internalEnsureBrowserUncapped(options),
	);
	return currentEnsureBrowserOperation as Promise<BrowserStatus>;
};

const getBrowserStatus = ({
	browserExecutable,
	chromeMode,
}: {
	browserExecutable: BrowserExecutable;
	chromeMode: ChromeMode;
}): BrowserStatus => {
	if (browserExecutable) {
		if (!fs.existsSync(browserExecutable)) {
			throw new Error(
				`"browserExecutable" was specified as '${browserExecutable}' but the path doesn't exist. Pass "null" for "browserExecutable" to download a browser automatically.`,
			);
		}

		return {path: browserExecutable, type: 'user-defined-path'};
	}

	const revision = getRevisionInfo(chromeMode);
	if (revision.local && fs.existsSync(revision.executablePath)) {
		return {path: revision.executablePath, type: 'local-puppeteer-browser'};
	}

	return {type: 'no-browser'};
};

/*
 * @description Ensures a browser is locally installed so a Remotion render can be executed.
 * @see [Documentation](https://www.remotion.dev/docs/renderer/ensure-browser)
 */
export const ensureBrowser = (options?: EnsureBrowserOptions) => {
	const indent = false;
	const logLevel = options?.logLevel ?? 'info';

	return internalEnsureBrowser({
		browserExecutable: options?.browserExecutable ?? null,
		indent,
		logLevel: options?.logLevel ?? 'info',
		onBrowserDownload:
			options?.onBrowserDownload ??
			defaultBrowserDownloadProgress({
				api: 'ensureBrowser()',
				indent: false,
				logLevel,
			}),
		chromeMode: options?.chromeMode ?? 'headless-shell',
	});
};
