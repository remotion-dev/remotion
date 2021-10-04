import puppeteer from 'puppeteer-core';
import {Browser, Internals} from 'remotion';
import {
	ensureLocalBrowser,
	getLocalBrowserExecutable,
} from './get-local-browser-executable';

export const openBrowser = async (
	browser: Browser,
	options?: {
		shouldDumpIo?: boolean;
		browserExecutable?: string | null;
	}
): Promise<puppeteer.Browser> => {
	if (browser === 'firefox' && !Internals.FEATURE_FLAG_FIREFOX_SUPPORT) {
		throw new TypeError(
			'Firefox supported is not yet turned on. Stay tuned for the future.'
		);
	}

	await ensureLocalBrowser(browser, options?.browserExecutable ?? null);

	const executablePath = await getLocalBrowserExecutable(
		browser,
		options?.browserExecutable ?? null
	);
	const browserInstance = await puppeteer.launch({
		executablePath,
		product: browser,
		dumpio: options?.shouldDumpIo ?? false,
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			'--use-gl=angle',
			'--disable-background-media-suspend',
			process.platform === 'linux' ? '--single-process' : null,
			'--allow-running-insecure-content', // https://source.chromium.org/search?q=lang:cpp+symbol:kAllowRunningInsecureContent&ss=chromium
			'--disable-component-update', // https://source.chromium.org/search?q=lang:cpp+symbol:kDisableComponentUpdate&ss=chromium
			'--disable-domain-reliability', // https://source.chromium.org/search?q=lang:cpp+symbol:kDisableDomainReliability&ss=chromium
			'--disable-features=AudioServiceOutOfProcess,IsolateOrigins,site-per-process', // https://source.chromium.org/search?q=file:content_features.cc&ss=chromium
			'--disable-print-preview', // https://source.chromium.org/search?q=lang:cpp+symbol:kDisablePrintPreview&ss=chromium
			'--disable-site-isolation-trials', // https://source.chromium.org/search?q=lang:cpp+symbol:kDisableSiteIsolation&ss=chromium
			'--disk-cache-size=33554432', // https://source.chromium.org/search?q=lang:cpp+symbol:kDiskCacheSize&ss=chromium
			'--hide-scrollbars', // https://source.chromium.org/search?q=lang:cpp+symbol:kHideScrollbars&ss=chromium
			'--no-default-browser-check', // https://source.chromium.org/search?q=lang:cpp+symbol:kNoDefaultBrowserCheck&ss=chromium
			'--no-pings', // https://source.chromium.org/search?q=lang:cpp+symbol:kNoPings&ss=chromium
			'--no-zygote', // https://source.chromium.org/search?q=lang:cpp+symbol:kNoZygote&ss=chromium
		].filter(Boolean) as string[],
	});
	return browserInstance;
};
