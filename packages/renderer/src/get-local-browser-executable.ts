import fs from 'node:fs';
import os from 'node:os';
import type {BrowserExecutable} from './browser-executable';
import {downloadBrowser, getRevisionInfo} from './browser/BrowserFetcher';
import type {LogLevel} from './log-level';
import {Log} from './logger';

const getSearchPathsForProduct = () => {
	return [
		process.env.PUPPETEER_EXECUTABLE_PATH ?? null,
		process.platform === 'darwin'
			? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
			: null,
		process.platform === 'linux' ? '/usr/bin/google-chrome' : null,
		process.platform === 'linux' ? '/usr/bin/chromium-browser' : null,
		process.platform === 'linux' ? '/usr/bin/chromium' : null, // Debian
		process.platform === 'linux'
			? '/app/.apt/usr/bin/google-chrome-stable'
			: null,
		process.platform === 'win32'
			? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
			: null,
		process.platform === 'win32'
			? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
			: null,
		process.platform === 'win32'
			? os.homedir() +
				'\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
			: null,
		process.platform === 'win32'
			? 'C:\\Program Files\\Google\\Chrome SxS\\Application\\chrome.exe'
			: null,
		process.platform === 'win32'
			? 'C:\\Program Files (x86)\\Google\\Chrome SxS\\Application\\chrome.exe'
			: null,
		process.platform === 'win32'
			? os.homedir() +
				'\\AppData\\Local\\Google\\Chrome SxS\\Application\\chrome.exe'
			: null,
	].filter(Boolean) as string[];
};

const getLocalBrowser = () => {
	for (const p of getSearchPathsForProduct()) {
		if (fs.existsSync(p)) {
			return p;
		}
	}

	return null;
};

type BrowserStatus =
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

export const ensureLocalBrowser = async ({
	indent,
	logLevel,
	preferredBrowserExecutable,
}: {
	preferredBrowserExecutable: BrowserExecutable;
	logLevel: LogLevel;
	indent: boolean;
}) => {
	const status = getBrowserStatus(preferredBrowserExecutable);
	if (status.type === 'no-browser') {
		Log.info(
			{indent, logLevel},
			'No local browser could be found. Downloading Chrome Headless Shell https://www.remotion.dev/docs/miscellaneous/chrome-headless-shell',
		);
		await downloadBrowser({indent, logLevel});
	}
};

export const getLocalBrowserExecutable = (
	preferredBrowserExecutable: BrowserExecutable,
): string => {
	const status = getBrowserStatus(preferredBrowserExecutable);
	if (status.type === 'no-browser') {
		throw new TypeError(
			'No browser found for rendering frames! Please open a GitHub issue and describe ' +
				'how you reached this error: https://github.com/remotion-dev/remotion/issues',
		);
	}

	return status.path;
};
