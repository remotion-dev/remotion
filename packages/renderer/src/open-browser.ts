import puppeteer from 'puppeteer-core';
import {Browser, Internals} from 'remotion';
import {
	ensureLocalBrowser,
	getLocalBrowserExecutable,
} from './get-local-browser-executable';

export const openBrowser = async (
	browser: Browser,
	options?: {
		customExecutable?: string | null;
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
			process.platform === 'linux' ? '--single-process' : null,
		].filter(Boolean) as string[],
	});
	return browserInstance;
};
