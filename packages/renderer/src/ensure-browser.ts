import fs from 'fs';
import type {BrowserExecutable} from './browser-executable';
import {defaultBrowserDownloadProgress} from './browser/browser-download-progress-bar';
import {downloadBrowser, getRevisionInfo} from './browser/BrowserFetcher';
import type {BrowserSafeApis} from './client';
import {getLocalBrowser} from './get-local-browser';
import type {ToOptions} from './options/option';

export type BrowserStatus =
	| {
			type: 'user-defined-path';
			path: string;
	  }
	| {
			type: 'local-browser';
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
} & ToOptions<typeof BrowserSafeApis.optionsMap.ensureBrowser>;

export type EnsureBrowserOptions = Partial<
	{
		browserExecutable: BrowserExecutable;
	} & ToOptions<typeof BrowserSafeApis.optionsMap.ensureBrowser>
>;

export const internalEnsureBrowser = async ({
	indent,
	logLevel,
	browserExecutable,
	onBrowserDownload,
}: InternalEnsureBrowserOptions): Promise<BrowserStatus> => {
	const status = getBrowserStatus(browserExecutable);
	if (status.type === 'no-browser') {
		const {onProgress, version} = onBrowserDownload();

		await downloadBrowser({indent, logLevel, onProgress, version});
	}

	const newStatus = getBrowserStatus(browserExecutable);
	return newStatus;
};

const getBrowserStatus = (
	browserExecutable: BrowserExecutable,
): BrowserStatus => {
	if (browserExecutable) {
		if (!fs.existsSync(browserExecutable)) {
			throw new Error(
				`"browserExecutable" was specified as '${browserExecutable}' but the path doesn't exist. Pass "null" for "browserExecutable" to download a browser automatically.`,
			);
		}

		return {path: browserExecutable, type: 'user-defined-path'};
	}

	const localBrowser = getLocalBrowser();
	if (localBrowser !== null) {
		return {path: localBrowser, type: 'local-browser'};
	}

	const revision = getRevisionInfo();
	if (revision.local && fs.existsSync(revision.executablePath)) {
		return {path: revision.executablePath, type: 'local-puppeteer-browser'};
	}

	return {type: 'no-browser'};
};

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
	});
};
