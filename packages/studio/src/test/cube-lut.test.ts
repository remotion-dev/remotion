import {expect, test} from 'bun:test';
import {applyCubeLut, parseCubeLut} from '../helpers/cube-lut';

const identity3d = `LUT_3D_SIZE 2
0 0 0
1 0 0
0 1 0
1 1 0
0 0 1
1 0 1
0 1 1
1 1 1`;

test('parses cube headers, comments and scientific notation, and preserves identity pixels', () => {
	const lut = parseCubeLut(
		`\uFEFF# Test LUT\r\nTITLE "Identity #1" # comment\r\n${identity3d.replaceAll('\n', '\r\n').replace('1 1 1', '1e0 1.0 1 # white')}`,
	);
	const pixels = new Uint8ClampedArray([
		0, 0, 0, 0, 255, 255, 255, 255, 17, 128, 209, 127,
	]);
	const original = pixels.slice();
	applyCubeLut(pixels, lut);
	expect(lut.title).toBe('Identity #1');
	expect(pixels).toEqual(original);
});

test('interpolates all three axes in red-fastest order', () => {
	const lut = parseCubeLut(`LUT_3D_SIZE 2
0 0 0
0 0 0
0 0 0
1 0 0
0 0 0
0 0 1
0 1 0
1 1 1`);
	const pixels = new Uint8ClampedArray([64, 128, 192, 127]);
	applyCubeLut(pixels, lut);
	expect([...pixels]).toEqual([32, 96, 48, 127]);
});

test('normalizes input domains per channel and clamps to the LUT edges', () => {
	const lut = parseCubeLut(`DOMAIN_MIN 0 0.25 -0.5
DOMAIN_MAX 1 0.75 0.5
${identity3d}`);
	const pixels = new Uint8ClampedArray([128, 128, 128, 200, 0, 0, 0, 255]);
	applyCubeLut(pixels, lut);
	expect([...pixels]).toEqual([128, 128, 255, 200, 0, 0, 128, 255]);
});

test('interpolates 1D channels independently, including input ranges and out-of-range outputs', () => {
	const lut = parseCubeLut(`LUT_1D_SIZE 3
LUT_1D_INPUT_RANGE 0.25 0.75
1 -1 0
0.5 0.5 1
0 2 2`);
	const pixels = new Uint8ClampedArray([64, 128, 192, 80, 255, 0, 0, 255]);
	applyCubeLut(pixels, lut);
	expect([...pixels]).toEqual([254, 130, 255, 80, 0, 0, 0, 255]);
});

test('normalizes very small input ranges without overflowing', () => {
	const lut = parseCubeLut(
		'LUT_1D_SIZE 2\nLUT_1D_INPUT_RANGE 0 1e-320\n1 1 1\n0 0 0',
	);
	const pixels = new Uint8ClampedArray([0, 128, 255, 255]);
	applyCubeLut(pixels, lut);
	expect([...pixels]).toEqual([255, 0, 0, 255]);
});

test.each([
	['', 'Expected LUT_1D_SIZE or LUT_3D_SIZE'],
	['0 0 0', 'before color data'],
	['LUT_3D_SIZE 1', 'integer from 2 to 256'],
	['LUT_3D_SIZE 2.5', 'integer from 2 to 256'],
	['LUT_3D_SIZE 257', 'integer from 2 to 256'],
	['LUT_1D_SIZE Infinity', 'integer from 2 to 65536'],
	['LUT_3D_SIZE 2\n0 0 0', 'Expected 8 LUT colors, got 1'],
	[identity3d + '\n1 1 1', 'Expected 8 LUT colors, got more'],
	[identity3d.replace('0 0 0', 'NaN 0 0'), 'Invalid LUT color'],
	[identity3d.replace('0 0 0', '1e40 0 0'), 'Invalid LUT color'],
	[identity3d.replace('0 0 0', '0 0'), 'Invalid LUT color'],
	['LUT_1D_SIZE 2\n' + identity3d, 'Combined 1D and 3D'],
	['LUT_3D_SIZE 2\n' + identity3d, 'Duplicate LUT_3D_SIZE'],
	['DOMAIN_MIN 1 1 1\n' + identity3d, 'DOMAIN_MAX must be greater'],
	['DOMAIN_MIN NaN 0 0\n' + identity3d, 'three finite numbers'],
	['DOMAIN_MIN 0 0\n' + identity3d, 'three finite numbers'],
	[
		'LUT_3D_INPUT_RANGE -1e308 1e308\n' + identity3d,
		'LUT input ranges must be finite',
	],
	['LUT_3D_INPUT_RANGE 1 0\n' + identity3d, 'increasing input range'],
	['LUT_1D_INPUT_RANGE 0 1\n' + identity3d, 'Conflicting LUT input range'],
	[
		'DOMAIN_MIN 0 0 0\nLUT_3D_INPUT_RANGE 0 1\n' + identity3d,
		'Conflicting LUT input range',
	],
	[identity3d + '\nDOMAIN_MIN 0 0 0', 'header after color data'],
	['UNKNOWN_HEADER 1\n' + identity3d, 'Unsupported LUT header'],
])('rejects malformed or unsupported cube data: %s', (text, error) => {
	expect(() => parseCubeLut(text)).toThrow(error);
});
