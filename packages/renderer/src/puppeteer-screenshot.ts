import * as assert from 'node:assert';
import type {Page} from './browser/BrowserPage';
import type {StillImageFormat} from './image-format';
import {screenshotTask} from './screenshot-task';

export const screenshot = (options: {
	page: Page;
	type: StillImageFormat;
	path?: string;
	jpegQuality?: number;
	omitBackground: boolean;
	width: number;
	height: number;
	scale: number;
}): Promise<Buffer | string> => {
	if (options.jpegQuality) {
		assert.ok(
			typeof options.jpegQuality === 'number',
			'Expected options.quality to be a number but found ' +
				typeof options.jpegQuality,
		);
		assert.ok(
			Number.isInteger(options.jpegQuality),
			'Expected options.quality to be an integer',
		);
		assert.ok(
			options.jpegQuality >= 0 && options.jpegQuality <= 100,
			'Expected options.quality to be between 0 and 100 (inclusive), got ' +
				options.jpegQuality,
		);
	}

	return options.page.screenshotTaskQueue.postTask(() =>
		screenshotTask({
			page: options.page,
			format: options.type,
			height: options.height,
			width: options.width,
			omitBackground: options.omitBackground,
			path: options.path,
			jpegQuality: options.type === 'jpeg' ? options.jpegQuality : undefined,
			scale: options.scale,
		}),
	);
};
