import fs from 'fs';
import type {Browser} from './browser';
import type {BrowserExecutable} from './browser-executable';
import {downloadBrowser} from './browser/create-browser-fetcher';
import {puppeteer} from './browser/node';
import type {Product} from './browser/Product';
import {PUPPETEER_REVISIONS} from './browser/revisions';

const getSearchPathsForProduct = (product: Product) => {
	console.log({product});
	if (product === 'chrome') {
		return [
			process.env.PUPPETEER_EXECUTABLE_PATH ?? null,
			process.platform === 'darwin'
				? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
				: null,
			process.platform === 'linux' ? '/usr/bin/google-chrome' : null,
			process.platform === 'linux' ? '/usr/bin/chromium-browser' : null,
			process.platform === 'linux'
				? '/app/.apt/usr/bin/google-chrome-stable'
				: null,
			process.platform === 'win32'
				? 'C:\\Program Files\\Google\\Chrome\\Application\\testchrome.exe'
				: null,
			process.platform === 'win32'
				? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\testchrome.exe'
				: null,
		].filter(Boolean) as string[];
	}

	if (product === 'firefox') {
		return [].filter(Boolean) as string[];
	}

	throw new TypeError(`Unknown browser product: ${product}`);
};

const mapBrowserToProduct = (browser: Browser): Product => browser;

const getLocalBrowser = (product: Product) => {
	for (const p of getSearchPathsForProduct(product)) {
		if (fs.existsSync(p)) {
			return p;
		}
	}

	return null;
};

const getBrowserRevision = (product: Product) => {
	const browserFetcher = puppeteer.createBrowserFetcher({
		product,
		path: null,
		platform: null,
	});
	const revisionInfo = browserFetcher.revisionInfo(
		product === 'firefox'
			? PUPPETEER_REVISIONS.firefox
			: PUPPETEER_REVISIONS.chromium
	);

	return revisionInfo;
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
	product: Product,
	browserExecutablePath: BrowserExecutable
): BrowserStatus => {
	if (browserExecutablePath) {
		if (!fs.existsSync(browserExecutablePath)) {
			console.warn(
				`Browser executable was specified as '${browserExecutablePath}' but the path doesn't exist.`
			);
		}

		return {path: browserExecutablePath, type: 'user-defined-path'};
	}

	const localBrowser = getLocalBrowser(product);
	if (localBrowser !== null) {
		return {path: localBrowser, type: 'local-browser'};
	}

	const revision = getBrowserRevision(product);
	if (revision.local !== null && fs.existsSync(revision.executablePath)) {
		return {path: revision.executablePath, type: 'local-puppeteer-browser'};
	}

	return {type: 'no-browser'};
};

export const ensureLocalBrowser = async (
	browser: Browser,
	preferredBrowserExecutable: BrowserExecutable
) => {
	const status = getBrowserStatus(
		mapBrowserToProduct(browser),
		preferredBrowserExecutable
	);
	if (status.type === 'no-browser') {
		console.log(
			'No local browser could be found. Downloading one from the internet...'
		);
		await downloadBrowser(browser);
	}
};

export const getLocalBrowserExecutable = (
	browser: Browser,
	preferredBrowserExecutable: BrowserExecutable
): string => {
	const status = getBrowserStatus(
		mapBrowserToProduct(browser),
		preferredBrowserExecutable
	);
	if (status.type === 'no-browser') {
		throw new TypeError(
			'No browser found for rendering frames! Please open a GitHub issue and describe ' +
				'how you reached this error: https://github.com/remotion-dev/remotion/issues'
		);
	}

	return status.path;
};
