import {expect, test} from 'bun:test';
import {getVideoImageFormat} from '../image-formats';

test('returns jpeg for av1 codec', () => {
	expect(getVideoImageFormat({codec: 'av1', uiImageFormat: null})).toBe('jpeg');
});

test('returns png if codec is undefined', () => {
	expect(getVideoImageFormat({codec: undefined, uiImageFormat: null})).toBe(
		'png',
	);
});
