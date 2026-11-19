import {expect, test} from 'bun:test';
import {PNG} from 'pngjs';
// This Node-only test helper is not exported by the renderer bundle.
// eslint-disable-next-line no-restricted-imports
import {compareNativePngs} from '../src/test/compare-native-png';

const png = (values: readonly number[], width: number) => {
	const image = new PNG({width, height: 1});
	image.data.set(values);
	return PNG.sync.write(image).toString('base64');
};

for (const [name, reference, actual] of [
	['translucent RGB', [100, 50, 25, 1], [101, 50, 25, 1]],
	['RGB behind zero alpha', [8, 16, 32, 0], [9, 16, 32, 0]],
	['alpha', [100, 50, 25, 0], [100, 50, 25, 1]],
] as const) {
	test(`detects a single ${name} channel value before premultiplication`, () => {
		const result = compareNativePngs(png(reference, 1), png(actual, 1), true);
		expect(result.mismatchedPixels).toBe(1);
		expect(result.maxChannelDelta).toBe(1);
		expect([
			...PNG.sync.read(Buffer.from(result.diff!, 'base64')).data,
		]).toEqual([255, 0, 255, 255]);
		const count = compareNativePngs(png(reference, 1), png(actual, 1), false);
		expect(count).toEqual({...result, diff: null});
	});
}

test('identical translucent pixels produce an empty RGBA diff', () => {
	const image = png([100, 50, 25, 1, 8, 16, 32, 0], 2);
	const result = compareNativePngs(image, image, true);
	expect(result.mismatchedPixels).toBe(0);
	expect(result.maxChannelDelta).toBe(0);
	expect([...PNG.sync.read(Buffer.from(result.diff!, 'base64')).data]).toEqual(
		Array(8).fill(0),
	);
});

test('different dimensions cannot compare as equal', () => {
	expect(() =>
		compareNativePngs(png([0, 0, 0, 0], 1), png(Array(8).fill(0), 2), false),
	).toThrow('Dimensions differ: 1x1 vs 2x1');
});
