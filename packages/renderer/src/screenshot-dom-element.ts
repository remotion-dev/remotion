import type {Page} from './browser/BrowserPage';
import type {StillImageFormat} from './image-format';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';
import {screenshot} from './puppeteer-screenshot';

export const screenshotDOMElement = async ({
	page,
	imageFormat,
	jpegQuality,
	opts,
	height,
	width,
	timeoutInMilliseconds,
	scale,
}: {
	page: Page;
	imageFormat: StillImageFormat;
	jpegQuality: number | undefined;
	opts: {
		path: string | null;
	};
	height: number;
	width: number;
	timeoutInMilliseconds: number;
	scale: number;
}): Promise<Buffer> => {
	const {path} = opts;

	if (
		imageFormat === 'png' ||
		imageFormat === 'pdf' ||
		imageFormat === 'webp'
	) {
		await puppeteerEvaluateWithCatch({
			pageFunction: () => {
				document.body.style.background = 'transparent';
			},
			args: [],
			frame: null,
			page,
			timeoutInMilliseconds,
		});
	} else {
		await puppeteerEvaluateWithCatch({
			pageFunction: () => {
				document.body.style.background = 'black';
			},
			args: [],
			frame: null,
			page,
			timeoutInMilliseconds,
		});
	}

	// @ts-expect-error
	if (imageFormat === 'none') {
		throw new TypeError('Tried to make a screenshot with format "none"');
	}

	const buf = await screenshot({
		page,
		omitBackground: imageFormat === 'png',
		path: path ?? undefined,
		type: imageFormat,
		jpegQuality,
		width,
		height,
		scale,
	});
	if (typeof buf === 'string') {
		throw new TypeError('Expected a buffer');
	}

	return buf;
};
