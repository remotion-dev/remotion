import fs from 'node:fs';
import path from 'node:path';
import type {ClipRegion, TRenderAsset} from 'remotion/no-react';
import type {DownloadMap} from './assets/download-map';
import type {Page} from './browser/BrowserPage';
import {compose} from './compositor/compose';
import type {Compositor} from './compositor/compositor';
import type {StillImageFormat, VideoImageFormat} from './image-format';
import {provideScreenshot} from './provide-screenshot';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';
import {truthy} from './truthy';

export const takeFrameAndCompose = async ({
	freePage,
	imageFormat,
	jpegQuality,
	frame,
	width,
	height,
	output,
	scale,
	downloadMap,
	wantsBuffer,
	compositor,
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
	downloadMap: DownloadMap;
	wantsBuffer: boolean;
	compositor: Compositor;
	timeoutInMilliseconds: number;
}): Promise<{buffer: Buffer | null; collectedAssets: TRenderAsset[]}> => {
	const [{value: clipRegion}, {value: collectedAssets}] = await Promise.all([
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
			timeoutInMilliseconds,
		}),
		puppeteerEvaluateWithCatch<TRenderAsset[]>({
			pageFunction: () => {
				return window.remotion_collectAssets();
			},
			args: [],
			frame,
			page: freePage,
			timeoutInMilliseconds,
		}),
	]);

	if (imageFormat === 'none') {
		return {buffer: null, collectedAssets};
	}

	const needsComposing =
		clipRegion === null
			? null
			: {
					tmpFile: path.join(
						downloadMap.compositingDir,
						`${frame}.${imageFormat}`,
					),
					finalOutFile:
						output ??
						path.join(
							downloadMap.compositingDir,
							`${frame}-final.${imageFormat}`,
						),
					clipRegion: clipRegion as ClipRegion,
				};
	if (clipRegion !== 'hide') {
		const shouldMakeBuffer = wantsBuffer && !needsComposing;

		const buf = await provideScreenshot({
			page: freePage,
			imageFormat,
			jpegQuality,
			options: {
				frame,
				output: shouldMakeBuffer ? null : needsComposing?.tmpFile ?? output,
			},
			height,
			width,
			clipRegion,
			timeoutInMilliseconds,
		});

		if (shouldMakeBuffer) {
			return {buffer: buf, collectedAssets};
		}
	}

	if (needsComposing) {
		if (imageFormat === 'pdf') {
			throw new Error(
				"You cannot use Rust APIs (like <Clipper>) if `imageFormat` is 'pdf'.",
			);
		}

		if (imageFormat === 'webp') {
			throw new Error(
				"You cannot use Rust APIs (like <Clipper>) if `imageFormat` is 'webp'.",
			);
		}

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
			compositor,
		});
		if (wantsBuffer) {
			const buffer = await fs.promises.readFile(needsComposing.finalOutFile);
			await fs.promises.unlink(needsComposing.finalOutFile);
			return {buffer, collectedAssets};
		}
	}

	return {buffer: null, collectedAssets};
};
