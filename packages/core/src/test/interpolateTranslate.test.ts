import {describe, expect, test} from 'bun:test';
import {Easing} from '../easing.js';
import {interpolateTranslate} from '../interpolate-translate.js';
import {expectToThrow} from './expect-to-throw.js';

describe('interpolateTranslate()', () => {
	test('interpolates one-dimensional pixel values', () => {
		expect(interpolateTranslate(15, [0, 30], ['0px', '100px'])).toBe('50px');
	});

	test('interpolates two-dimensional pixel values', () => {
		expect(interpolateTranslate(15, [0, 30], ['0px 59px', '100px 0px'])).toBe(
			'50px 29.5px',
		);
	});

	test('interpolates three-dimensional pixel values', () => {
		expect(
			interpolateTranslate(15, [0, 30], ['0px 59px 10px', '100px 0px 20px']),
		).toBe('50px 29.5px 15px');
	});

	test('supports multiple keyframes', () => {
		expect(
			interpolateTranslate(
				45,
				[0, 30, 60],
				['0px 0px', '60px 30px', '0px 60px'],
			),
		).toBe('30px 45px');
	});

	test('supports easing', () => {
		expect(
			interpolateTranslate(15, [0, 30], ['0px', '100px'], {
				easing: Easing.quad,
			}),
		).toBe('25px');
	});

	test('supports extrapolation', () => {
		expect(
			interpolateTranslate(45, [0, 30], ['0px 0px', '100px 50px'], {
				extrapolateRight: 'clamp',
			}),
		).toBe('100px 50px');
	});

	test('supports posterization', () => {
		expect(
			interpolateTranslate(19, [0, 30], ['0px 0px', '90px 30px'], {
				posterize: 10,
			}),
		).toBe('30px 10px');
	});

	test('rounds floating point noise', () => {
		expect(
			interpolateTranslate(0.1, [0, 1], ['0px 0px', '100.2px 302.4px']),
		).toBe('10.02px 30.24px');
	});

	test('returns the only output value for a single keyframe', () => {
		expect(interpolateTranslate(15, [0], ['10px 20px'])).toBe('10px 20px');
	});

	test('throws if output range contains non-pixel units', () => {
		expectToThrow(
			() => interpolateTranslate(15, [0, 30], ['0px', '100%']),
			/only supports px values/,
		);
		expectToThrow(
			() => interpolateTranslate(15, [0, 30], ['0px', '10rem']),
			/only supports px values/,
		);
		expectToThrow(
			() => interpolateTranslate(15, [0, 30], ['0px', '10']),
			/only supports px values/,
		);
	});

	test('throws if translate values have different lengths', () => {
		expectToThrow(
			() => interpolateTranslate(15, [0, 30], ['0px', '100px 0px']),
			/same number of pixel values/,
		);
	});

	test('throws if more than three values are provided', () => {
		expectToThrow(
			() => interpolateTranslate(15, [0, 30], ['0px', '1px 2px 3px 4px']),
			/1 to 3 pixel values/,
		);
	});
});
