import fs from 'fs';
import {Internals} from 'remotion';
import type {Page} from './browser/BrowserPage';
import type {ScreenshotOptions} from './browser/ScreenshotOptions';
import type {StillImageFormat} from './image-format';

export const _screenshotTask = async (
	page: Page,
	format: StillImageFormat,
	options: ScreenshotOptions
): Promise<Buffer | string> => {
	const client = page._client();
	const target = page.target();

	const perfTarget = Internals.perf.startPerfMeasure('activate-target');

	await client.send('Target.activateTarget', {
		targetId: target._targetId,
	});
	Internals.perf.stopPerfMeasure(perfTarget);

	const shouldSetDefaultBackground = options.omitBackground && format === 'png';
	if (shouldSetDefaultBackground)
		await client.send('Emulation.setDefaultBackgroundColorOverride', {
			color: {r: 0, g: 0, b: 0, a: 0},
		});

	const cap = Internals.perf.startPerfMeasure('capture');
	const result = await client.send('Page.captureScreenshot', {
		format,
		quality: options.quality,
		clip: undefined,
		captureBeyondViewport: true,
	});
	Internals.perf.stopPerfMeasure(cap);
	if (shouldSetDefaultBackground)
		await client.send('Emulation.setDefaultBackgroundColorOverride');

	const saveMarker = Internals.perf.startPerfMeasure('save');

	const buffer = Buffer.from(result.data, 'base64');
	if (options.path) await fs.promises.writeFile(options.path, buffer);
	Internals.perf.stopPerfMeasure(saveMarker);
	return buffer;
};
