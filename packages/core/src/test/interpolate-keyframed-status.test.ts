import {expect, test} from 'bun:test';
import {interpolateKeyframedStatus} from '../interpolate-keyframed-status';
import type {CanUpdateSequencePropStatusKeyframed} from '../use-schema';

test('interpolates linear numeric keyframes', () => {
	const result = interpolateKeyframedStatus({
		forceSpringAllowTail: null,
		frame: 30,
		status: {
			status: 'keyframed',
			interpolationFunction: 'interpolate',
			keyframes: [
				{frame: 0, value: 0},
				{frame: 60, value: 100},
			],
			easing: [{type: 'linear'}],
			clamping: {left: 'extend', right: 'extend'},
			posterize: undefined,
		},
	});
	expect(result).toBe(50);
});

test('interpolates linear tuple keyframes', () => {
	const result = interpolateKeyframedStatus({
		forceSpringAllowTail: null,
		frame: 30,
		status: {
			status: 'keyframed',
			interpolationFunction: 'interpolate',
			keyframes: [
				{frame: 0, value: [0, 0.5]},
				{frame: 60, value: [1, 0.5]},
			],
			easing: [{type: 'linear'}],
			clamping: {left: 'extend', right: 'extend'},
			posterize: undefined,
		},
	});
	expect(result).toEqual([0.5, 0.5]);
});

test('sorts keyframes before interpolating numeric values', () => {
	const result = interpolateKeyframedStatus({
		forceSpringAllowTail: null,
		frame: 75,
		status: {
			status: 'keyframed',
			interpolationFunction: 'interpolate',
			keyframes: [
				{frame: 100, value: 100},
				{frame: 50, value: 50},
				{frame: 0, value: 0},
			],
			easing: [{type: 'linear'}, {type: 'linear'}],
			clamping: {left: 'extend', right: 'extend'},
			posterize: undefined,
		},
	});
	expect(result).toBe(75);
});

test('clamps when extrapolation is clamp', () => {
	const result = interpolateKeyframedStatus({
		forceSpringAllowTail: null,
		frame: 120,
		status: {
			status: 'keyframed',
			interpolationFunction: 'interpolate',
			keyframes: [
				{frame: 0, value: 0},
				{frame: 60, value: 100},
			],
			easing: [{type: 'linear'}],
			clamping: {left: 'clamp', right: 'clamp'},
			posterize: undefined,
		},
	});
	expect(result).toBe(100);
});

test('posterizes the frame before interpolating numeric keyframes', () => {
	const result = interpolateKeyframedStatus({
		forceSpringAllowTail: null,
		frame: 17,
		status: {
			status: 'keyframed',
			interpolationFunction: 'interpolate',
			keyframes: [
				{frame: 0, value: 0},
				{frame: 60, value: 100},
			],
			easing: [{type: 'linear'}],
			clamping: {left: 'extend', right: 'extend'},
			posterize: 3,
		},
	});
	expect(result).toBe(25);
});

test('returns single keyframe value', () => {
	const result = interpolateKeyframedStatus({
		forceSpringAllowTail: null,
		frame: 100,
		status: {
			status: 'keyframed',
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
		forceSpringAllowTail: null,
		frame: 30,
		status: {
			status: 'keyframed',
			interpolationFunction: 'interpolateColors',
			keyframes: [
				{frame: 0, value: '#000000'},
				{frame: 60, value: '#ffffff'},
			],
			easing: [{type: 'linear'}],
			clamping: {left: 'clamp', right: 'clamp'},
			posterize: undefined,
		},
	});
	expect(typeof result).toBe('string');
	expect(result).toMatch(/^rgba?\(/);
});

test('interpolates color keyframes with easing', () => {
	const result = interpolateKeyframedStatus({
		forceSpringAllowTail: null,
		frame: 30,
		status: {
			status: 'keyframed',
			interpolationFunction: 'interpolateColors',
			keyframes: [
				{frame: 0, value: 'black'},
				{frame: 60, value: 'white'},
			],
			easing: [{type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1}],
			clamping: {left: 'clamp', right: 'clamp'},
			posterize: undefined,
		},
	});
	expect(result).toBe('rgba(80, 80, 80, 1)');
});

test('posterizes the frame before interpolating color keyframes', () => {
	const result = interpolateKeyframedStatus({
		forceSpringAllowTail: null,
		frame: 17,
		status: {
			status: 'keyframed',
			interpolationFunction: 'interpolateColors',
			keyframes: [
				{frame: 0, value: 'black'},
				{frame: 60, value: 'white'},
			],
			easing: [{type: 'linear'}],
			clamping: {left: 'clamp', right: 'clamp'},
			posterize: 3,
		},
	});
	expect(result).toBe('rgba(64, 64, 64, 1)');
});

test('interpolates translate keyframes', () => {
	const result = interpolateKeyframedStatus({
		forceSpringAllowTail: null,
		frame: 30,
		status: {
			status: 'keyframed',
			interpolationFunction: 'interpolate',
			keyframes: [
				{frame: 0, value: '0px 0px'},
				{frame: 60, value: '120px 60px'},
			],
			easing: [{type: 'linear'}],
			clamping: {left: 'extend', right: 'extend'},
			posterize: undefined,
		},
	});
	expect(result).toBe('60px 30px');
});

test('can force spring allowTail off for timeline value previews', () => {
	const parseTranslate = (value: string): [number, number] => {
		const [x, y] = value.split(' ');
		return [Number(x.replace('px', '')), Number(y.replace('px', ''))];
	};

	const status: CanUpdateSequencePropStatusKeyframed = {
		status: 'keyframed',
		interpolationFunction: 'interpolate',
		keyframes: [
			{frame: 0, value: '0px 1000px'},
			{frame: 30, value: '0px 0px'},
			{frame: 60, value: '1000px 0px'},
		],
		easing: [
			{
				type: 'spring',
				allowTail: true,
				damping: 200,
				durationRestThreshold: 0.03,
				mass: 1,
				overshootClamping: false,
				stiffness: 100,
			},
			{
				type: 'spring',
				allowTail: true,
				damping: 200,
				durationRestThreshold: 0.03,
				mass: 1,
				overshootClamping: false,
				stiffness: 100,
			},
		],
		clamping: {left: 'clamp', right: 'extend'},
		posterize: undefined,
	};

	const preserved = interpolateKeyframedStatus({
		forceSpringAllowTail: null,
		frame: 45,
		status,
	});
	const forcedOff = interpolateKeyframedStatus({
		forceSpringAllowTail: false,
		frame: 45,
		status,
	});

	if (typeof preserved !== 'string' || typeof forcedOff !== 'string') {
		throw new Error('Expected string interpolation result');
	}

	const [preservedX, preservedY] = parseTranslate(preserved);
	const [forcedOffX, forcedOffY] = parseTranslate(forcedOff);

	expect(preservedX).toBeGreaterThan(0);
	expect(forcedOffX).toBeGreaterThan(0);
	expect(preservedY).toBeGreaterThan(0);
	expect(forcedOffY).toBe(0);
});

test('interpolates rotate keyframes', () => {
	const result = interpolateKeyframedStatus({
		forceSpringAllowTail: null,
		frame: 30,
		status: {
			status: 'keyframed',
			interpolationFunction: 'interpolate',
			keyframes: [
				{frame: 0, value: '0deg'},
				{frame: 60, value: '120deg'},
			],
			easing: [{type: 'linear'}],
			clamping: {left: 'extend', right: 'extend'},
			posterize: undefined,
		},
	});
	expect(result).toBe('60deg');
});

test('uses bezier easing', () => {
	const result = interpolateKeyframedStatus({
		forceSpringAllowTail: null,
		frame: 30,
		status: {
			status: 'keyframed',
			interpolationFunction: 'interpolate',
			keyframes: [
				{frame: 0, value: 0},
				{frame: 60, value: 100},
			],
			easing: [{type: 'bezier', x1: 0.42, y1: 0, x2: 0.58, y2: 1}],
			clamping: {left: 'extend', right: 'extend'},
			posterize: undefined,
		},
	});
	expect(result).toBeGreaterThan(0);
	expect(result).toBeLessThan(100);
});

test('interpolates scale strings component-wise', () => {
	const result = interpolateKeyframedStatus({
		forceSpringAllowTail: null,
		frame: 30,
		status: {
			status: 'keyframed',
			interpolationFunction: 'interpolate',
			keyframes: [
				{frame: 0, value: 2},
				{frame: 60, value: '4 8 3'},
			],
			easing: [{type: 'linear'}],
			clamping: {left: 'extend', right: 'extend'},
			posterize: undefined,
		},
	});
	expect(result).toBe('3 5 2');
});
