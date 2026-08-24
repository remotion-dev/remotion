import {expect, test} from 'vitest';
import {resolveEffectsOutputSize} from '../video/resolve-effects-output-size';

test('uses source dimensions by default', () => {
	expect(
		resolveEffectsOutputSize({
			sourceWidth: 1920,
			sourceHeight: 1080,
			effectsOutputSize: null,
		}),
	).toEqual({width: 1920, height: 1080});
});

test('rounds the requested effect output size', () => {
	expect(
		resolveEffectsOutputSize({
			sourceWidth: 512,
			sourceHeight: 512,
			effectsOutputSize: {width: 1024.4, height: 1023.6},
		}),
	).toEqual({width: 1024, height: 1024});
});

test.each([
	{width: 0, height: 100},
	{width: 100, height: -1},
	{width: Number.NaN, height: 100},
	{width: 100, height: Number.POSITIVE_INFINITY},
])('rejects invalid dimensions: %o', (effectsOutputSize) => {
	expect(() =>
		resolveEffectsOutputSize({
			sourceWidth: 512,
			sourceHeight: 512,
			effectsOutputSize,
		}),
	).toThrow('width and height must be positive finite numbers');
});
