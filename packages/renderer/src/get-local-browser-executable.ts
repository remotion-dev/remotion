import fs from 'node:fs';
import type {BrowserExecutable} from './browser-executable';
import {getRevisionInfo} from './browser/BrowserFetcher';
import type {BrowserStatus} from './ensure-browser';
import {getLocalBrowser} from './get-local-browser';

const getBrowserStatus = (
	browserExecutablePath: BrowserExecutable,
): BrowserStatus => {
	if (browserExecutablePath) {
		if (!fs.existsSync(browserExecutablePath)) {
			console.warn(
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

export const getLocalBrowserExecutable = (
	preferredBrowserExecutable: BrowserExecutable,
): string => {
	const status = getBrowserStatus(preferredBrowserExecutable);
	if (status.type === 'no-browser') {
		throw new TypeError(
			'No browser found for rendering frames! Please open a GitHub issue and describe ' +
				'how you reached this error: https://remotion.dev/issue',
		);
	}

	return status.path;
};
