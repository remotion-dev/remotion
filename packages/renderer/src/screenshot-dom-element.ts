import type {ClipRegion} from 'remotion';
import type {Page} from './browser/BrowserPage';
import type {ImageFormat} from './image-format';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';
import {screenshot} from './puppeteer-screenshot';

export const screenshotDOMElement = async ({
	page,
	imageFormat,
	quality,
	opts,
	height,
	width,
	clipRegion,
}: {
	page: Page;
	imageFormat: ImageFormat;
	quality: number | undefined;
	opts: {
		path: string | null;
	};
	height: number;
	width: number;
	clipRegion: ClipRegion | null;
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

	const buf = await screenshot({
		page,
		omitBackground: imageFormat === 'png',
		path: path ?? undefined,
		type: imageFormat,
		quality,
		width,
		height,
		clipRegion,
	});
	if (typeof buf === 'string') {
		throw new TypeError('Expected a buffer');
	}

	return buf;
};
