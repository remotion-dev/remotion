import fs from 'fs';
import {Internals, StillImageFormat} from 'remotion';
import {Page} from './browser/Page';
import {ScreenshotOptions} from './browser/ScreenshotOptions';

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

	if (options.path) await fs.promises.writeFile(options.path, result.data);
	Internals.perf.stopPerfMeasure(saveMarker);
	return result.data;
};
