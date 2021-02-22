import puppeteer from 'puppeteer-core';
import puppeteer_node from 'puppeteer-core/lib/cjs/puppeteer/node';
import {downloadBrowser} from 'puppeteer-core/lib/cjs/puppeteer/node/install';

const getLocalRevision = (): puppeteer.BrowserFetcherRevisionInfo => {
	const productName = 'chrome';
	const browserFetcher = puppeteer_node.createBrowserFetcher({
		product: productName,
		host: 'https://storage.googleapis.com',
	});
	const revisionInfo = browserFetcher.revisionInfo('848005');

	return revisionInfo;
};

export const getLocalChromiumExecutable = async (): Promise<string> => {
	const localRevision = getLocalRevision();
	if (localRevision.local) {
		return localRevision.executablePath;
	} else {
		await downloadBrowser();
		const downloadedLocalRevision = getLocalRevision();
		return downloadedLocalRevision.executablePath;
	}
};
