import puppeteer from 'puppeteer';

async function screenshotDOMElement(
	page: puppeteer.Page,
	opts: {
		path?: string;
		selector?: string;
	} = {}
): Promise<Buffer> {
	const path = 'path' in opts ? opts.path : null;
	const {selector} = opts;

	if (!selector) throw Error('Please provide a selector.');
	if (!path) throw Error('Please provide a path.');

	const rect = await page.evaluate((sel) => {
		const element = document.querySelector(sel);
		if (!element) return null;
		const {x, y, width, height} = element.getBoundingClientRect();
		return {left: x, top: y, width, height, id: element.id};
	}, selector);

	if (!rect)
		throw Error(`Could not find element that matches selector: ${selector}.`);

	await page.evaluate(() => (document.body.style.background = 'transparent'));
	return await page.screenshot({
		omitBackground: true,
		path,
		clip: {
			x: rect.left,
			y: rect.top,
			width: rect.width,
			height: rect.height,
		},
	});
}

export const openBrowser = async (): Promise<puppeteer.Browser> => {
	const browser = await puppeteer.launch({
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
		],
	});
	return browser;
};

export const provideScreenshot = async (
	page: puppeteer.Page,
	options: {
		site: string;
		output: string;
		width: number;
		height: number;
	}
): Promise<void> => {
	page.setViewport({
		width: options.width,
		height: options.height,
		deviceScaleFactor: 1,
	});
	page.on('error', console.error);
	page.on('pageerror', console.error);

	await page.goto(options.site);
	await page.waitForFunction('window.ready === true');

	await screenshotDOMElement(page, {
		path: options.output,
		selector: '#canvas',
	});
};

export * from './get-concurrency';
export * from './render';
export * from './stitcher';
export * from './validate-ffmpeg';
