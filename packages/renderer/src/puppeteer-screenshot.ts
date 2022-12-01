import * as assert from 'assert';
import type {Page} from './browser/BrowserPage';
import type {StillImageFormat} from './image-format';
import {screenshotTask} from './screenshot-task';

export const screenshot = (options: {
	page: Page;
	type: 'png' | 'jpeg';
	path?: string;
	quality?: number;
	omitBackground: boolean;
	width: number;
	height: number;
}): Promise<Buffer | string | void> => {
	let screenshotType: 'png' | 'jpeg' | null = null;
	// options.type takes precedence over inferring the type from options.path
	// because it may be a 0-length file with no extension created beforehand
	// (i.e. as a temp file).
	if (options.type) {
		assert.ok(
			options.type === 'png' || options.type === 'jpeg',
			'Unknown options.type value: ' + options.type
		);
		screenshotType = options.type;
	} else if (options.path) {
		const filePath = options.path;
		const extension = filePath
			.slice(filePath.lastIndexOf('.') + 1)
			.toLowerCase();
		if (extension === 'png') screenshotType = 'png';
		else if (extension === 'jpg' || extension === 'jpeg')
			screenshotType = 'jpeg';
		assert.ok(
			screenshotType,
			`Unsupported screenshot type for extension \`.${extension}\``
		);
	}

	if (!screenshotType) screenshotType = 'png';

	if (options.quality) {
		assert.ok(
			screenshotType === 'jpeg',
			'options.quality is unsupported for the ' +
				screenshotType +
				' screenshots'
		);
		assert.ok(
			typeof options.quality === 'number',
			'Expected options.quality to be a number but found ' +
				typeof options.quality
		);
		assert.ok(
			Number.isInteger(options.quality),
			'Expected options.quality to be an integer'
		);
		assert.ok(
			options.quality >= 0 && options.quality <= 100,
			'Expected options.quality to be between 0 and 100 (inclusive), got ' +
				options.quality
		);
	}

	return options.page.screenshotTaskQueue.postTask(() =>
		screenshotTask({
			page: options.page,
			format: screenshotType as StillImageFormat,
			height: options.height,
			width: options.width,
			omitBackground: options.omitBackground,
		})
	);
};
