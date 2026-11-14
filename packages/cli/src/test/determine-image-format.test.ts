import {expect, test} from 'bun:test';
import {determineFinalStillImageFormat} from '../determine-image-format';

test('derives the image format from an uppercase file extension', () => {
	for (const [outName, format] of [
		['out.JPG', 'jpeg'],
		['out.JPEG', 'jpeg'],
		['out.WebP', 'webp'],
		['out.PDF', 'pdf'],
		['out.PNG', 'png'],
	] as const) {
		expect(
			determineFinalStillImageFormat({
				downloadName: null,
				outName,
				configuredImageFormat: null,
				isLambda: false,
				fromUi: null,
			}),
		).toEqual({format, source: 'Out name extension'});
	}
});

test('rejects an uppercase file extension that does not match the configured image format', () => {
	expect(() =>
		determineFinalStillImageFormat({
			downloadName: null,
			outName: 'out.JPG',
			configuredImageFormat: 'png',
			isLambda: false,
			fromUi: null,
		}),
	).toThrow(/Image format mismatch/);
});
