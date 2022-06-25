import fs from 'fs';
import type {CDPSession, Page, ScreenshotOptions} from 'puppeteer-core';
import type {StillImageFormat} from 'remotion';
import {Internals} from 'remotion';

export const _screenshotTask = async (
	page: Page,
	format: StillImageFormat,
	options: ScreenshotOptions
): Promise<Buffer | string> => {
	const client = (page as unknown as {_client: CDPSession})._client;

	const shouldSetDefaultBackground = options.omitBackground && format === 'png';
	if (shouldSetDefaultBackground)
		await client.send('Emulation.setDefaultBackgroundColorOverride', {
			color: {r: 0, g: 0, b: 0, a: 0},
		});

	const cap = Internals.perf.startPerfMeasure('capture');
	const result = await client.send('Page.captureScreenshot', {
		format,
		quality: options.quality,
		clip: options.clip,
		captureBeyondViewport: true,
	});
	Internals.perf.stopPerfMeasure(cap);
	if (shouldSetDefaultBackground)
		await client.send('Emulation.setDefaultBackgroundColorOverride');

	const saveMarker = Internals.perf.startPerfMeasure('save');
	const buffer =
		options.encoding === 'base64'
			? result.data
			: Buffer.from(result.data, 'base64');

	if (options.path) await fs.promises.writeFile(options.path, buffer);
	Internals.perf.stopPerfMeasure(saveMarker);
	return buffer;
};
