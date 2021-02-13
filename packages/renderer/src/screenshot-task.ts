import fs from 'fs';
import {Page, ScreenshotClip, ScreenshotOptions} from 'puppeteer';
import {startPerf, stopPer} from './benchmarking';

function processClip(clip: ScreenshotClip): ScreenshotClip & {scale: number} {
	const x = Math.round(clip.x);
	const y = Math.round(clip.y);
	const width = Math.round(clip.width + clip.x - x);
	const height = Math.round(clip.height + clip.y - y);
	return {x, y, width, height, scale: 1};
}

export interface Viewport {
	/**
	 * The page width in pixels.
	 */
	width: number;
	/**
	 * The page height in pixels.
	 */
	height: number;
	/**
	 * Specify device scale factor.
	 * See {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio | devicePixelRatio} for more info.
	 * @defaultValue 1
	 */
	deviceScaleFactor?: number;
	/**
	 * Whether the `meta viewport` tag is taken into account.
	 * @defaultValue false
	 */
	isMobile?: boolean;
	/**
	 * Specifies if the viewport is in landscape mode.
	 * @defaultValue false
	 */
	isLandscape?: boolean;
	/**
	 * Specify if the viewport supports touch events.
	 * @defaultValue false
	 */
	hasTouch?: boolean;
}

export const _screenshotTask = async (
	page: Page,
	format: 'png' | 'jpeg',
	options: ScreenshotOptions
): Promise<Buffer | string> => {
	const client = (page as any)._client;
	const target = (page as any)._target;

	const perfTarget = startPerf('activate-target');

	await client.send('Target.activateTarget', {
		targetId: target._targetId,
	});
	stopPer(perfTarget);
	const clip = options.clip ? processClip(options.clip) : undefined;

	const shouldSetDefaultBackground = options.omitBackground && format === 'png';
	if (shouldSetDefaultBackground)
		await client.send('Emulation.setDefaultBackgroundColorOverride', {
			color: {r: 0, g: 0, b: 0, a: 0},
		});

	const cap = startPerf('capture');
	const result = await client.send('Page.captureScreenshot', {
		format,
		quality: options.quality,
		clip,
		captureBeyondViewport: true,
	});
	stopPer(cap);
	if (shouldSetDefaultBackground)
		await client.send('Emulation.setDefaultBackgroundColorOverride');

	const saveMarker = startPerf('save');
	const buffer =
		options.encoding === 'base64'
			? result.data
			: Buffer.from(result.data, 'base64');

	if (options.path) await fs.promises.writeFile(options.path, buffer);
	stopPer(saveMarker);
	return buffer;
};
