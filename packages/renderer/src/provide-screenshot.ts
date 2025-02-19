import type {Page} from './browser/BrowserPage';
import type {StillImageFormat} from './image-format';
import {screenshotDOMElement} from './screenshot-dom-element';

export const provideScreenshot = ({
	page,
	imageFormat,
	options,
	jpegQuality,
	height,
	width,
	timeoutInMilliseconds,
	scale,
}: {
	page: Page;
	imageFormat: StillImageFormat;
	jpegQuality: number | undefined;
	options: {
		frame: number;
		output: string | null;
	};
	height: number;
	width: number;
	timeoutInMilliseconds: number;
	scale: number;
}): Promise<Buffer> => {
	return screenshotDOMElement({
		page,
		opts: {
			path: options.output,
		},
		imageFormat,
		jpegQuality,
		height,
		width,
		timeoutInMilliseconds,
		scale,
	});
};
