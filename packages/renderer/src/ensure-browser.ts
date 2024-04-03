import fs from 'fs';
import type {BrowserExecutable} from './browser-executable';
import {downloadBrowser, getRevisionInfo} from './browser/BrowserFetcher';
import {getLocalBrowser} from './get-local-browser';
import type {LogLevel} from './log-level';
import {Log} from './logger';

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
	preferredBrowserExecutable,
}: {
	preferredBrowserExecutable: BrowserExecutable;
	logLevel: LogLevel;
	indent: boolean;
}) => {
	const status = getBrowserStatus(preferredBrowserExecutable, logLevel, indent);
	if (status.type === 'no-browser') {
		Log.info(
			{indent, logLevel},
			'No local browser could be found. Downloading Chrome Headless Shell https://www.remotion.dev/docs/miscellaneous/chrome-headless-shell',
		);
		await downloadBrowser({indent, logLevel});
	}
};

const getBrowserStatus = (
	browserExecutablePath: BrowserExecutable,
	logLevel: LogLevel,
	indent: boolean,
): BrowserStatus => {
	if (browserExecutablePath) {
		if (!fs.existsSync(browserExecutablePath)) {
			Log.warn(
				{
					indent,
					logLevel,
				},
				`Browser executable was specified as '${browserExecutablePath}' but the path doesn't exist.`,
			);
		}

		return {path: browserExecutablePath, type: 'user-defined-path'};
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
