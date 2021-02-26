import fs from 'fs';
import {platform} from 'os';
import puppeteer, {PuppeteerNode} from 'puppeteer-core';
import {downloadBrowser} from 'puppeteer-core/lib/cjs/puppeteer/node/install';
import {PUPPETEER_REVISIONS} from 'puppeteer-core/lib/cjs/puppeteer/revisions';
import {Internals} from 'remotion';

const searchPaths = [
	platform() === 'darwin'
		? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
		: null,
].filter(Boolean) as string[];

const getLocalBrowser = () => {
	for (const p of searchPaths) {
		if (fs.existsSync(p)) {
			return p;
		}
	}
	return null;
};

const productName: puppeteer.Product = 'chrome';

const getChromiumRevision = (): puppeteer.BrowserFetcherRevisionInfo => {
	const browserFetcher = ((puppeteer as unknown) as PuppeteerNode).createBrowserFetcher(
		{
			product: productName,
			host: 'https://storage.googleapis.com',
		}
	);
	const revisionInfo = browserFetcher.revisionInfo(
		PUPPETEER_REVISIONS.chromium
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

const getBrowserStatus = (): BrowserStatus => {
	const browserExecutablePath = Internals.getBrowserExecutable();
	if (browserExecutablePath) {
		return {path: browserExecutablePath, type: 'user-defined-path'};
	}
	const localBrowser = getLocalBrowser();
	if (localBrowser !== null) {
		return {path: localBrowser, type: 'local-browser'};
	}
	const revision = getChromiumRevision();
	if (revision.local !== null && fs.existsSync(revision.executablePath)) {
		return {path: revision.executablePath, type: 'local-puppeteer-browser'};
	}
	return {type: 'no-browser'};
};

export const ensureLocalBrowser = async () => {
	const status = getBrowserStatus();
	if (status.type === 'no-browser') {
		console.log(
			'No local browser could be found. Downloading one from the internet...'
		);
		await downloadBrowser();
	}
};

export const getLocalBrowserExecutable = async (): Promise<string> => {
	const status = getBrowserStatus();
	if (status.type === 'no-browser') {
		throw new TypeError(
			'No browser found for rendering frames! Please open a Github issue and describe ' +
				'how you reached this error: https://github.com/JonnyBurger/remotion/issues'
		);
	}
	return status.path;
};
