import fs from 'fs';
import {platform} from 'os';
import puppeteer from 'puppeteer-core';
import puppeteer_node from 'puppeteer-core/lib/cjs/puppeteer/node';
import {downloadBrowser} from 'puppeteer-core/lib/cjs/puppeteer/node/install';
import {PUPPETEER_REVISIONS} from 'puppeteer-core/lib/cjs/puppeteer/revisions';
import {Internals} from 'remotion';

const searchPaths = [
	platform() === 'darwin'
		? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
		: null,
].filter(Boolean) as string[];

const getLocalBrowser = () => {
	for (const path of searchPaths) {
		if (fs.existsSync(path)) {
			return path;
		}
	}
	return null;
};

const getChromiumRevision = (): puppeteer.BrowserFetcherRevisionInfo => {
	const productName = 'chrome';
	const browserFetcher = puppeteer_node.createBrowserFetcher({
		product: productName,
		host: 'https://storage.googleapis.com',
	});
	const revisionInfo = browserFetcher.revisionInfo(
		PUPPETEER_REVISIONS.chromium
	);

	return revisionInfo;
};

export const getLocalChromiumExecutable = async (): Promise<string> => {
	const chromiumExecutablePath = Internals.getChromiumExecutable();
	if (chromiumExecutablePath) {
		return chromiumExecutablePath;
	}
	const localBrowser = getLocalBrowser();
	if (localBrowser) {
		return localBrowser;
	}
	const revision = getChromiumRevision();
	if (revision.local) {
		return revision.executablePath;
	}
	await downloadBrowser();
	const downloaded = getChromiumRevision();
	return downloaded.executablePath;
};
