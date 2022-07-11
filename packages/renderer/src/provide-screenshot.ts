import type {ImageFormat} from 'remotion';
import type {Page} from './browser/BrowserPage';
import {screenshotDOMElement} from './screenshot-dom-element';

export const provideScreenshot = ({
	page,
	imageFormat,
	options,
	quality,
}: {
	page: Page;
	imageFormat: ImageFormat;
	quality: number | undefined;
	options: {
		frame: number;
		output: string | null;
	};
}): Promise<Buffer> => {
	return screenshotDOMElement({
		page,
		opts: {
			path: options.output,
		},
		imageFormat,
		quality,
	});
};
