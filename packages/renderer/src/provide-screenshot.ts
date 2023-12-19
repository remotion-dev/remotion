import type {ClipRegion} from 'remotion/no-react';
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
	clipRegion,
	timeoutInMilliseconds,
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
	clipRegion: ClipRegion | null;
	timeoutInMilliseconds: number;
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
		clipRegion,
		timeoutInMilliseconds,
	});
};
