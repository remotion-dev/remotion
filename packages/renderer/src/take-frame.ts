import type {TRenderAsset} from 'remotion/no-react';
import type {Page} from './browser/BrowserPage';
import {collectAssets} from './collect-assets';
import type {StillImageFormat, VideoImageFormat} from './image-format';
import {provideScreenshot} from './provide-screenshot';

export const takeFrame = async ({
	freePage,
	imageFormat,
	jpegQuality,
	frame,
	width,
	height,
	output,
	scale,
	wantsBuffer,
	timeoutInMilliseconds,
}: {
	freePage: Page;
	imageFormat: VideoImageFormat | StillImageFormat;
	jpegQuality: number | undefined;
	frame: number;
	height: number;
	width: number;
	output: string | null;
	scale: number;
	wantsBuffer: boolean;
	timeoutInMilliseconds: number;
}): Promise<{buffer: Buffer | null; collectedAssets: TRenderAsset[]}> => {
	const collectedAssets = await collectAssets({
		frame,
		freePage,
		timeoutInMilliseconds,
	});

	if (imageFormat === 'none') {
		return {buffer: null, collectedAssets};
	}

	const shouldMakeBuffer = wantsBuffer;

	const buf = await provideScreenshot({
		page: freePage,
		imageFormat,
		jpegQuality,
		options: {
			frame,
			output: wantsBuffer ? null : output,
		},
		height,
		width,
		timeoutInMilliseconds,
		scale,
	});

	if (shouldMakeBuffer) {
		return {buffer: buf, collectedAssets};
	}

	return {buffer: null, collectedAssets};
};
