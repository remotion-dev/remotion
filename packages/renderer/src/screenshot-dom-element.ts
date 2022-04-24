import puppeteer from 'puppeteer-core';
import {ImageFormat} from 'remotion';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';
import {screenshot} from './puppeteer-screenshot';

export const screenshotDOMElement = async ({
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
}): Promise<Buffer> => {
	const path = 'path' in opts ? opts.path : undefined;
	const {selector} = opts;

	if (!selector) throw Error('Please provide a selector.');

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
		path,
		type: imageFormat,
		quality,
	}) as Promise<Buffer>;
};
