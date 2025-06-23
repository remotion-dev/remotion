import type {TRenderAsset} from 'remotion/no-react';
import type {Page} from './browser/BrowserPage';
import {collectAssets} from './collect-assets';
import type {StillImageFormat, VideoImageFormat} from './image-format';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';
import {screenshot} from './puppeteer-screenshot';

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
			page: freePage,
			timeoutInMilliseconds,
		});
	} else {
		await puppeteerEvaluateWithCatch({
			pageFunction: () => {
				document.body.style.background = 'black';
			},
			args: [],
			frame: null,
			page: freePage,
			timeoutInMilliseconds,
		});
	}

	const buf = await screenshot({
		page: freePage,
		omitBackground: imageFormat === 'png',
		path: (wantsBuffer ? undefined : output) ?? undefined,
		type: imageFormat,
		jpegQuality,
		width,
		height,
		scale,
	});

	return {buffer: buf, collectedAssets};
};
