import fs from 'fs';
import path from 'path';
import type {ClipRegion} from 'remotion';
import type {DownloadMap} from './assets/download-map';
import type {Page} from './browser/BrowserPage';
import {compose} from './compositor/compose';
import type {ImageFormat} from './image-format';
import {provideScreenshot} from './provide-screenshot';
import {truthy} from './truthy';

export const takeFrameAndCompose = async ({
	clipRegion,
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
	clipRegion: ClipRegion | null;
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
}): Promise<Buffer | null> => {
	const needsComposing =
		clipRegion === null
			? null
			: {
					tmpFile: path.join(
						downloadMap.compositingDir,
						`${frame}.${imageFormat}`
					),
					finalOutfie:
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
			return buf;
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
			output: needsComposing.finalOutfie,
			downloadMap,
			imageFormat: imageFormat === 'jpeg' ? 'Jpeg' : 'Png',
		});
		if (wantsBuffer) {
			const buffer = await fs.promises.readFile(needsComposing.finalOutfie);
			await fs.promises.unlink(needsComposing.finalOutfie);
			return buffer;
		}
	}

	return null;
};
