import fs from 'fs';
import type {BrowserExecutable} from './browser-executable';
import {downloadBrowser, getRevisionInfo} from './browser/BrowserFetcher';
import {getLocalBrowser} from './get-local-browser';
import type {LogLevel} from './log-level';
import type {OnBrowserDownload} from './options/on-browser-download';

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

export const ensureLocalBrowser = async ({
	indent,
	logLevel,
	browserExecutable,
	onBrowserDownload,
}: {
	browserExecutable: BrowserExecutable;
	logLevel: LogLevel;
	indent: boolean;
	onBrowserDownload: OnBrowserDownload;
}) => {
	const status = getBrowserStatus(browserExecutable);
	if (status.type === 'no-browser') {
		const onProgress = onBrowserDownload();

		await downloadBrowser({indent, logLevel, onProgress});
	}
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
