import fs from 'fs';
import type {Page} from './browser/BrowserPage';
import type {ScreenshotOptions} from './browser/ScreenshotOptions';
import type {StillImageFormat} from './image-format';
import {startPerfMeasure, stopPerfMeasure} from './perf';

export const _screenshotTask = async (
	page: Page,
	format: StillImageFormat,
	options: ScreenshotOptions
): Promise<Buffer | string> => {
	const client = page._client();
	const target = page.target();

	const perfTarget = startPerfMeasure('activate-target');

	await client.send('Target.activateTarget', {
		targetId: target._targetId,
	});
	stopPerfMeasure(perfTarget);

	const shouldSetDefaultBackground = options.omitBackground && format === 'png';
	if (shouldSetDefaultBackground)
		await client.send('Emulation.setDefaultBackgroundColorOverride', {
			color: {r: 0, g: 0, b: 0, a: 0},
		});

	const cap = startPerfMeasure('capture');
	const result = await client.send('Page.captureScreenshot', {
		format,
		quality: options.quality,
		clip: undefined,
		captureBeyondViewport: true,
	});
	stopPerfMeasure(cap);
	if (shouldSetDefaultBackground)
		await client.send('Emulation.setDefaultBackgroundColorOverride');

	const saveMarker = startPerfMeasure('save');

	const buffer = Buffer.from(result.data, 'base64');
	if (options.path) await fs.promises.writeFile(options.path, buffer);
	stopPerfMeasure(saveMarker);
	return buffer;
};
