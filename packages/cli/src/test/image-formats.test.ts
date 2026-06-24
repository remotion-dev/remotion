import {expect, test} from 'bun:test';
import {getVideoImageFormat} from '../image-formats';

test('returns jpeg for av1 codec', () => {
	expect(
		getVideoImageFormat({
			codec: 'av1',
			uiImageFormat: null,
			compositionDefaultVideoImageFormat: null,
		}),
	).toBe('jpeg');
});

test('returns png if codec is undefined', () => {
	expect(
		getVideoImageFormat({
			codec: undefined,
			uiImageFormat: null,
			compositionDefaultVideoImageFormat: null,
		}),
	).toBe('png');
});

test('uses composition default image format before built-in codec default', () => {
	expect(
		getVideoImageFormat({
			codec: 'prores',
			uiImageFormat: null,
			compositionDefaultVideoImageFormat: 'png',
		}),
	).toBe('png');
});
