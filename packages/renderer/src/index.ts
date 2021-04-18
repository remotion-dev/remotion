import puppeteer from 'puppeteer-core';
import {Browser, ImageFormat, Internals} from 'remotion';
import {
	ensureLocalBrowser,
	getLocalBrowserExecutable,
} from './get-local-browser-executable';
import {screenshot} from './puppeteer-screenshot';

async function screenshotDOMElement({
	page,
	imageFormat,
	quality,
	opts = {},
}: {
	page: puppeteer.Page;
	imageFormat: ImageFormat;
	quality: number | undefined;
	opts?: {
		path?: string;
		selector?: string;
	};
}): Promise<Buffer> {
	const path = 'path' in opts ? opts.path : null;
	const {selector} = opts;

	if (!selector) throw Error('Please provide a selector.');
	if (!path) throw Error('Please provide a path.');

	if (imageFormat === 'png') {
		await page.evaluate(() => (document.body.style.background = 'transparent'));
	}
	if (imageFormat === 'none') {
		throw TypeError('Tried to make a screenshot with format "none"');
	}
	return screenshot(page, {
		omitBackground: imageFormat === 'png',
		path,
		type: imageFormat,
		quality,
	}) as Promise<Buffer>;
}

export const openBrowser = async (
	browser: Browser,
	options?: {
		customExecutable?: string | null;
		shouldDumpIo?: boolean;
	}
): Promise<puppeteer.Browser> => {
	if (browser === 'firefox' && !Internals.FEATURE_FLAG_FIREFOX_SUPPORT) {
		throw new TypeError(
			'Firefox supported is not yet turned on. Stay tuned for the future.'
		);
	}
	await ensureLocalBrowser(browser, options?.customExecutable ?? null);

	const executablePath = await getLocalBrowserExecutable(
		browser,
		options?.customExecutable ?? null
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

export const seekToFrame = async ({
	frame,
	page,
}: {
	frame: number;
	page: puppeteer.Page;
}) => {
	await page.waitForFunction('window.ready === true');
	await page.evaluate((f) => {
		window.remotion_setFrame(f);
	}, frame);
	await page.waitForFunction('window.ready === true');
};

export const provideScreenshot = async ({
	page,
	imageFormat,
	options,
	quality,
}: {
	page: puppeteer.Page;
	imageFormat: ImageFormat;
	quality: number | undefined;
	options: {
		frame: number;
		output: string;
	};
}): Promise<void> => {
	await screenshotDOMElement({
		page,
		opts: {
			path: options.output,
			selector: '#canvas',
		},
		imageFormat,
		quality,
	});
};

export * from './ffmpeg-flags';
export * from './get-compositions';
export * from './get-concurrency';
export {ensureLocalBrowser} from './get-local-browser-executable';
export * from './render';
export * from './stitcher';
export * from './validate-ffmpeg';
