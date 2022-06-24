import type puppeteer from 'puppeteer-core';
import type {ImageFormat} from 'remotion';
import {screenshotDOMElement} from './screenshot-dom-element';

export const provideScreenshot = ({
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
		output?: string;
	};
}): Promise<Buffer> => {
	return screenshotDOMElement({
		page,
		opts: {
			path: options.output,
			selector: '#remotion-canvas',
		},
		imageFormat,
		quality,
	});
};
