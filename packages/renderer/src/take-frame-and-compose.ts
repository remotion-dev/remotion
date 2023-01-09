import type {ClipRegion, TAsset} from 'remotion';
import type {Page} from './browser/BrowserPage';
import type {ImageFormat} from './image-format';
import {provideScreenshot} from './provide-screenshot';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';

export const takeFrame = async ({
	freePage,
	imageFormat,
	quality,
	frame,
	width,
	height,
}: {
	freePage: Page;
	imageFormat: ImageFormat;
	quality: number | undefined;
	frame: number;
	height: number;
	width: number;
}): Promise<{
	buffer: Buffer | null;
	collectedAssets: TAsset[];
	clipRegion: ClipRegion | null;
}> => {
	const [clipRegion, collectedAssets] = await Promise.all([
		puppeteerEvaluateWithCatch<ClipRegion | null>({
			pageFunction: () => {
				if (typeof window.remotion_getClipRegion === 'undefined') {
					return null;
				}

				return window.remotion_getClipRegion();
			},
			args: [],
			frame,
			page: freePage,
		}),
		puppeteerEvaluateWithCatch<TAsset[]>({
			pageFunction: () => {
				return window.remotion_collectAssets();
			},
			args: [],
			frame,
			page: freePage,
		}),
	]);

	if (imageFormat === 'none' || clipRegion === 'hide') {
		return {buffer: null, collectedAssets, clipRegion};
	}

	const buf = await provideScreenshot({
		page: freePage,
		imageFormat,
		quality,
		options: {
			frame,
			output: null,
		},
		height,
		width,
		clipRegion,
	});

	return {buffer: buf, collectedAssets, clipRegion};
};
