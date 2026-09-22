import {expect, test} from 'bun:test';
import {parseCubeLut} from '../lut/parse-cube-lut.js';

const IDENTITY_LUT = `\uFEFF# Identity LUT
TITLE "Identity #1"
LUT_3D_SIZE 2
DOMAIN_MIN -1 -0.5 0
DOMAIN_MAX 1 1.5 2

0 0 0 # black
1 0 0
0 1 0
1 1 0
0 0 1
1 0 1
0 1 1
1 1 1`;

test('parses a 3D Cube LUT', () => {
	const parsed = parseCubeLut(IDENTITY_LUT);

	expect(parsed.size).toBe(2);
	expect(parsed.domainMin).toEqual([-1, -0.5, 0]);
	expect(parsed.domainMax).toEqual([1, 1.5, 2]);
	expect(Array.from(parsed.data.slice(0, 8))).toEqual([0, 0, 0, 1, 1, 0, 0, 1]);
	expect(Array.from(parsed.data.slice(-8))).toEqual([0, 1, 1, 1, 1, 1, 1, 1]);
});

test('rejects unsupported 1D LUTs', () => {
	expect(() =>
		parseCubeLut(`LUT_1D_SIZE 2
0 0 0
1 1 1`),
	).toThrow('1D LUTs are not supported');
});

test('rejects malformed LUT sizes', () => {
	expect(() => parseCubeLut('LUT_3D_SIZE 1')).toThrow(
		'LUT_3D_SIZE must be an integer from 2 to 256',
	);
	expect(() => parseCubeLut('LUT_3D_SIZE 2.5')).toThrow(
		'LUT_3D_SIZE must be an integer from 2 to 256',
	);
});

test('rejects non-finite color values', () => {
	expect(() =>
		parseCubeLut(`LUT_3D_SIZE 2
0 0 NaN`),
	).toThrow('color row must contain only finite numbers');
});

test('rejects invalid domains', () => {
	expect(() =>
		parseCubeLut(`LUT_3D_SIZE 2
DOMAIN_MIN 0 0 0
DOMAIN_MAX 0 1 1`),
	).toThrow('DOMAIN_MIN must be smaller than DOMAIN_MAX for every channel');
});

test('rejects directives after color data', () => {
	expect(() =>
		parseCubeLut(`LUT_3D_SIZE 2
0 0 0
DOMAIN_MIN 0 0 0`),
	).toThrow('DOMAIN_MIN must appear before the color data');
});

test('rejects unknown directives', () => {
	expect(() => parseCubeLut('LUT_3D_SIZE 2\nFOO 1 2 3')).toThrow(
		'unsupported directive "FOO"',
	);
});
