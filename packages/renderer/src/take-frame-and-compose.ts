import fs from 'fs';
import path from 'path';
import type {ClipRegion, TAsset} from 'remotion';
import type {DownloadMap} from './assets/download-map';
import type {Page} from './browser/BrowserPage';
import {compose} from './compositor/compose';
import type {ImageFormat} from './image-format';
import {provideScreenshot} from './provide-screenshot';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';
import {truthy} from './truthy';

export const takeFrameAndCompose = async ({
	freePage,
	imageFormat,
	quality,
	frame,
	width,
	height,
	output,
	scale,
	downloadMap,
	wantsBuffer,
}: {
	freePage: Page;
	imageFormat: ImageFormat;
	quality: number | undefined;
	frame: number;
	height: number;
	width: number;
	output: string | null;
	scale: number;
	downloadMap: DownloadMap;
	wantsBuffer: boolean;
}): Promise<{buffer: Buffer | null; collectedAssets: TAsset[]}> => {
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

	if (imageFormat === 'none') {
		return {buffer: null, collectedAssets};
	}

	if (imageFormat === 'pdf' && clipRegion !== null) {
		throw new Error(
			"You can only pass a `clip region` if `imageFormat` is 'jpeg' or 'png'."
		);
	}

	const needsComposing =
		clipRegion === null
			? null
			: {
					tmpFile: path.join(
						downloadMap.compositingDir,
						`${frame}.${imageFormat}`
					),
					finalOutFile:
						output ??
						path.join(
							downloadMap.compositingDir,
							`${frame}-final.${imageFormat}`
						),
					clipRegion: clipRegion as ClipRegion,
			  };
	if (clipRegion !== 'hide') {
		const shouldMakeBuffer = wantsBuffer && !needsComposing;

		const buf = await provideScreenshot({
			page: freePage,
			imageFormat,
			quality,
			options: {
				frame,
				output: shouldMakeBuffer ? null : needsComposing?.tmpFile ?? output,
			},
			height,
			width,
			clipRegion,
		});

		if (shouldMakeBuffer) {
			return {buffer: buf, collectedAssets};
		}
	}

	if (needsComposing) {
		await compose({
			height: height * scale,
			width: width * scale,
			layers: [
				needsComposing.clipRegion === 'hide'
					? null
					: {
							type:
								imageFormat === 'jpeg'
									? ('JpgImage' as const)
									: ('PngImage' as const),
							params: {
								height: needsComposing.clipRegion.height * scale,
								width: needsComposing.clipRegion.width * scale,
								src: needsComposing.tmpFile,
								x: needsComposing.clipRegion.x * scale,
								y: needsComposing.clipRegion.y * scale,
							},
					  },
			].filter(truthy),
			output: needsComposing.finalOutFile,
			downloadMap,
			imageFormat: imageFormat === 'jpeg' ? 'Jpeg' : 'Png',
		});
		if (wantsBuffer) {
			const buffer = await fs.promises.readFile(needsComposing.finalOutFile);
			await fs.promises.unlink(needsComposing.finalOutFile);
			return {buffer, collectedAssets};
		}
	}

	return {buffer: null, collectedAssets};
};
