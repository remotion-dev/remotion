import {describe, expect, test} from 'bun:test';
import {Easing} from '../easing.js';
import {interpolateRotate} from '../interpolate-rotate.js';
import {expectToThrow} from './expect-to-throw.js';

describe('interpolateRotate()', () => {
	test('interpolates degree values', () => {
		expect(interpolateRotate(15, [0, 30], ['0deg', '100deg'])).toBe('50deg');
	});

	test('interpolates negative and decimal degree values', () => {
		expect(interpolateRotate(15, [0, 30], ['-10.5deg', '20.5deg'])).toBe(
			'5deg',
		);
	});

	test('supports multiple keyframes', () => {
		expect(interpolateRotate(45, [0, 30, 60], ['0deg', '60deg', '0deg'])).toBe(
			'30deg',
		);
	});

	test('supports easing', () => {
		expect(
			interpolateRotate(15, [0, 30], ['0deg', '100deg'], {
				easing: Easing.quad,
			}),
		).toBe('25deg');
	});

	test('supports extrapolation', () => {
		expect(
			interpolateRotate(45, [0, 30], ['0deg', '100deg'], {
				extrapolateRight: 'clamp',
			}),
		).toBe('100deg');
	});

	test('supports posterization', () => {
		expect(
			interpolateRotate(19, [0, 30], ['0deg', '90deg'], {
				posterize: 10,
			}),
		).toBe('30deg');
	});

	test('rounds floating point noise', () => {
		expect(interpolateRotate(0.1, [0, 1], ['0deg', '100.2deg'])).toBe(
			'10.02deg',
		);
	});

	test('returns the only output value for a single keyframe', () => {
		expect(interpolateRotate(15, [0], ['10deg'])).toBe('10deg');
	});

	test('throws if output range contains non-degree units', () => {
		expectToThrow(
			() => interpolateRotate(15, [0, 30], ['0deg', '1turn']),
			/only supports deg values/,
		);
		expectToThrow(
			() => interpolateRotate(15, [0, 30], ['0deg', '1rad']),
			/only supports deg values/,
		);
		expectToThrow(
			() => interpolateRotate(15, [0, 30], ['0deg', '10']),
			/only supports deg values/,
		);
	});
});
