import type {Page} from './browser/BrowserPage';
import type {ImageFormat} from './image-format';
import {screenshotDOMElement} from './screenshot-dom-element';

export const provideScreenshot = ({
	page,
	imageFormat,
	options,
	quality,
	height,
	width,
	scale,
}: {
	page: Page;
	imageFormat: ImageFormat;
	quality: number | undefined;
	options: {
		frame: number;
		output: string | null;
	};
	height: number;
	width: number;
	scale: number;
}): Promise<Buffer> => {
	return screenshotDOMElement({
		page,
		opts: {
			path: options.output,
		},
		imageFormat,
		quality,
		height,
		scale,
		width,
	});
};
