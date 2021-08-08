import fs from 'fs';
import path from 'path';
import puppeteer, {Product, PuppeteerNode} from 'puppeteer-core';
import {downloadBrowser} from 'puppeteer-core/lib/cjs/puppeteer/node/install';
import {PUPPETEER_REVISIONS} from 'puppeteer-core/lib/cjs/puppeteer/revisions';
import {Browser, Internals} from 'remotion';

const getSearchPathsForProduct = (product: puppeteer.Product) => {
	if (product === 'chrome') {
		return [
			process.env.PUPPETEER_EXECUTABLE_PATH ?? null,
			process.platform === 'darwin'
				? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
				: null,
			process.platform === 'linux' ? '/usr/bin/google-chrome' : null,
			process.platform === 'linux' ? '/usr/bin/chromium-browser' : null,
			path.resolve(
				process.cwd(),
				'node_modules/puppeteer-core/.local-chromium'
			),
			path.resolve(process.cwd(), 'node_modules/puppeteer/.local-chromium'),
			process.platform === 'win32'
				? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
				: null,
			process.platform === 'win32'
				? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
				: null,
		].filter(Boolean) as string[];
	}

	if (product === 'firefox') {
		return [].filter(Boolean) as string[];
	}

	throw new TypeError(`Unknown browser product: ${product}`);
};

const mapBrowserToProduct = (browser: Browser): puppeteer.Product => browser;

const getLocalBrowser = (product: puppeteer.Product) => {
	for (const p of getSearchPathsForProduct(product)) {
		if (fs.existsSync(p)) {
			return p;
		}
	}

	return null;
};

const getBrowserRevision = (
	product: Product
): puppeteer.BrowserFetcherRevisionInfo => {
	const browserFetcher = ((puppeteer as unknown) as PuppeteerNode).createBrowserFetcher(
		{
			product,
		}
	);
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

const getBrowserStatus = (product: puppeteer.Product): BrowserStatus => {
	const browserExecutablePath = Internals.getBrowserExecutable();
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

export const ensureLocalBrowser = async (browser: Browser) => {
	const status = getBrowserStatus(mapBrowserToProduct(browser));
	if (status.type === 'no-browser') {
		console.log(
			'No local browser could be found. Downloading one from the internet...'
		);
		await downloadBrowser();
	}
};

export const getLocalBrowserExecutable = async (
	browser: Browser
): Promise<string> => {
	const status = getBrowserStatus(mapBrowserToProduct(browser));
	if (status.type === 'no-browser') {
		throw new TypeError(
			'No browser found for rendering frames! Please open a GitHub issue and describe ' +
				'how you reached this error: https://github.com/remotion-dev/remotion/issues'
		);
	}

	return status.path;
};
