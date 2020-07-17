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

	return await page.screenshot({
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
	const browser = await puppeteer.launch();
	return browser;
};

export const provideScreenshot = async (
	page: puppeteer.Page,
	options: {
		site: string;
		output: string;
	}
): Promise<void> => {
	page.setViewport({width: 1080, height: 1080, deviceScaleFactor: 2});

	await page.goto(options.site);
	await page.waitForFunction('window.isReady() === true');

	await screenshotDOMElement(page, {
		path: options.output,
		selector: '#canvas',
	});
};

export * from './stitcher';
