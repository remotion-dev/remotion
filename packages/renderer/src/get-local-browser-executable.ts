import fs from 'node:fs';
import type {BrowserExecutable} from './browser-executable';
import {getRevisionInfo} from './browser/BrowserFetcher';
import type {BrowserStatus} from './ensure-browser';
import {getLocalBrowser} from './get-local-browser';
import type {LogLevel} from './log-level';
import {Log} from './logger';

const getBrowserStatus = ({
	browserExecutablePath,
	indent,
	logLevel,
}: {
	browserExecutablePath: BrowserExecutable;
	indent: boolean;
	logLevel: LogLevel;
}): BrowserStatus => {
	if (browserExecutablePath) {
		if (!fs.existsSync(browserExecutablePath)) {
			Log.warn(
				{indent, logLevel},
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

export const getLocalBrowserExecutable = ({
	preferredBrowserExecutable,
	logLevel,
	indent,
}: {
	preferredBrowserExecutable: BrowserExecutable;
	logLevel: LogLevel;
	indent: boolean;
}): string => {
	const status = getBrowserStatus({
		browserExecutablePath: preferredBrowserExecutable,
		indent,
		logLevel,
	});
	if (status.type === 'no-browser') {
		throw new TypeError(
			'No browser found for rendering frames! Please open a GitHub issue and describe ' +
				'how you reached this error: https://remotion.dev/issue',
		);
	}

	return status.path;
};
