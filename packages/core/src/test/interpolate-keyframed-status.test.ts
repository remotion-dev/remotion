import {expect, test} from 'bun:test';
import {interpolateKeyframedStatus} from '../interpolate-keyframed-status';

test('interpolates linear numeric keyframes', () => {
	const result = interpolateKeyframedStatus({
		frame: 30,
		status: {
			canUpdate: false,
			reason: 'keyframed',
			interpolationFunction: 'interpolate',
			keyframes: [
				{frame: 0, value: 0},
				{frame: 60, value: 100},
			],
			easing: ['linear'],
			clamping: {left: 'extend', right: 'extend'},
			posterize: undefined,
		},
	});
	expect(result).toBe(50);
});

test('clamps when extrapolation is clamp', () => {
	const result = interpolateKeyframedStatus({
		frame: 120,
		status: {
			canUpdate: false,
			reason: 'keyframed',
			interpolationFunction: 'interpolate',
			keyframes: [
				{frame: 0, value: 0},
				{frame: 60, value: 100},
			],
			easing: ['linear'],
			clamping: {left: 'clamp', right: 'clamp'},
			posterize: undefined,
		},
	});
	expect(result).toBe(100);
});

test('posterizes the frame before interpolating numeric keyframes', () => {
	const result = interpolateKeyframedStatus({
		frame: 17,
		status: {
			canUpdate: false,
			reason: 'keyframed',
			interpolationFunction: 'interpolate',
			keyframes: [
				{frame: 0, value: 0},
				{frame: 60, value: 100},
			],
			easing: ['linear'],
			clamping: {left: 'extend', right: 'extend'},
			posterize: 3,
		},
	});
	expect(result).toBe(25);
});

test('returns single keyframe value', () => {
	const result = interpolateKeyframedStatus({
		frame: 100,
		status: {
			canUpdate: false,
			reason: 'keyframed',
			interpolationFunction: 'interpolate',
			keyframes: [{frame: 0, value: 7}],
			easing: [],
			clamping: {left: 'extend', right: 'extend'},
			posterize: undefined,
		},
	});
	expect(result).toBe(7);
});

test('interpolates colors', () => {
	const result = interpolateKeyframedStatus({
		frame: 30,
		status: {
			canUpdate: false,
			reason: 'keyframed',
			interpolationFunction: 'interpolateColors',
			keyframes: [
				{frame: 0, value: '#000000'},
				{frame: 60, value: '#ffffff'},
			],
			easing: ['linear'],
			clamping: {left: 'clamp', right: 'clamp'},
			posterize: undefined,
		},
	});
	expect(typeof result).toBe('string');
	expect(result).toMatch(/^rgba?\(/);
});

test('posterizes the frame before interpolating color keyframes', () => {
	const result = interpolateKeyframedStatus({
		frame: 17,
		status: {
			canUpdate: false,
			reason: 'keyframed',
			interpolationFunction: 'interpolateColors',
			keyframes: [
				{frame: 0, value: 'black'},
				{frame: 60, value: 'white'},
			],
			easing: ['linear'],
			clamping: {left: 'clamp', right: 'clamp'},
			posterize: 3,
		},
	});
	expect(result).toBe('rgba(64, 64, 64, 1)');
});

test('uses bezier easing', () => {
	const result = interpolateKeyframedStatus({
		frame: 30,
		status: {
			canUpdate: false,
			reason: 'keyframed',
			interpolationFunction: 'interpolate',
			keyframes: [
				{frame: 0, value: 0},
				{frame: 60, value: 100},
			],
			easing: [[0.42, 0, 0.58, 1]],
			clamping: {left: 'extend', right: 'extend'},
			posterize: undefined,
		},
	});
	expect(result).toBeGreaterThan(0);
	expect(result).toBeLessThan(100);
});
