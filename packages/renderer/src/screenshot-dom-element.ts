import type {Page} from './browser/BrowserPage';
import type {ImageFormat} from './image-format';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';
import {screenshot} from './puppeteer-screenshot';

export const screenshotDOMElement = async ({
	page,
	imageFormat,
	quality,
	opts,
	scale,
	height,
	width,
}: {
	page: Page;
	imageFormat: ImageFormat;
	quality: number | undefined;
	opts: {
		path: string | null;
	};
	scale: number;
	height: number;
	width: number;
}): Promise<Buffer> => {
	const {path} = opts;

	if (imageFormat === 'png') {
		await puppeteerEvaluateWithCatch({
			pageFunction: () => {
				document.body.style.background = 'transparent';
			},
			args: [],
			frame: null,
			page,
		});
	} else {
		await puppeteerEvaluateWithCatch({
			pageFunction: () => {
				document.body.style.background = 'black';
			},
			args: [],
			frame: null,
			page,
		});
	}

	if (imageFormat === 'none') {
		throw new TypeError('Tried to make a screenshot with format "none"');
	}

	return screenshot(page, {
		omitBackground: imageFormat === 'png',
		path: path ?? undefined,
		type: imageFormat,
		quality,
		scale,
		width,
		height,
	}) as Promise<Buffer>;
};
