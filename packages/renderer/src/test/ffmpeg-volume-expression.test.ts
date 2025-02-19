import {expect, test} from 'bun:test';
import {interpolate} from 'remotion';
import {ffmpegVolumeExpression} from '../assets/ffmpeg-volume-expression';

test('Simple expression', () => {
	expect(
		ffmpegVolumeExpression({
			volume: 0.5,
			fps: 30,
			trimLeft: 0,
			allowAmplificationDuringRender: false,
		}),
	).toEqual({
		eval: 'once',
		value: '0.5',
	});
});

test('Simple expression with volume multiplier', () => {
	expect(
		ffmpegVolumeExpression({
			volume: 0.5,
			fps: 30,
			trimLeft: 0,
			allowAmplificationDuringRender: false,
		}),
	).toEqual({
		eval: 'once',
		value: '0.5',
	});
});

test('Complex expression with volume multiplier', () => {
	expect(
		ffmpegVolumeExpression({
			volume: [0, 1],
			fps: 30,
			trimLeft: 0,
			allowAmplificationDuringRender: false,
		}),
	).toEqual({
		eval: 'frame',
		value: "'if(between(t,-0.0167,0.0167),0,1)'",
	});
});

test('Should respect trimLeft multiplier', () => {
	expect(
		ffmpegVolumeExpression({
			volume: [0, 1],
			fps: 30,
			trimLeft: 0.5,
			allowAmplificationDuringRender: false,
		}),
	).toEqual({
		eval: 'frame',
		value: "'if(between(t,0.4833,0.5167),0,1)'",
	});
});

test('Really complex volume expression', () => {
	const expectedExpression =
		"'if(between(t,-0.0167,0.0167),0,if(between(t,0.0167,0.0500),0.247,if(between(t,0.0500,0.0833),0.505,if(between(t,0.0833,0.2167),0.99,1))))'";

	expect(
		ffmpegVolumeExpression({
			volume: [0, 0.25, 0.5, 0.99, 0.99, 0.99, 0.99, 1, 1, 1, 1, 1],
			fps: 30,
			trimLeft: 0,
			allowAmplificationDuringRender: false,
		}),
	).toEqual({
		eval: 'frame',
		value: expectedExpression,
	});
});

test('Should use 0 as else statement', () => {
	expect(
		ffmpegVolumeExpression({
			volume: [0, 0, 0, 1, 1],
			fps: 30,
			allowAmplificationDuringRender: false,
			trimLeft: 0,
		}),
	).toEqual({
		eval: 'frame',
		value: "'if(between(t,-0.0167,0.0833),0,1)'",
	});
});

test('Simple expression - should not be higher than 1', () => {
	expect(
		ffmpegVolumeExpression({
			volume: 2,
			fps: 30,
			trimLeft: 0,
			allowAmplificationDuringRender: false,
		}),
	).toEqual({
		eval: 'once',
		value: '1',
	});
});

test('Complex expression - should  be higher than 1 if allowed', () => {
	expect(
		ffmpegVolumeExpression({
			volume: [0.5, 2],
			fps: 30,
			trimLeft: 0,
			allowAmplificationDuringRender: true,
		}),
	).toEqual({
		eval: 'frame',
		value: "'if(between(t,-0.0167,0.0167),0.505,2)'",
	});
});

test('Should simplify an expression', () => {
	expect(
		ffmpegVolumeExpression({
			volume: [0, 1, 1, 1, 0, 1],
			fps: 30,
			trimLeft: 0,
			allowAmplificationDuringRender: false,
		}),
	).toEqual({
		eval: 'frame',
		value: "'if(between(t,-0.0167,0.0167)+between(t,0.1167,0.1500),0,1)'",
	});
});

test('Should stay under half 8000 windows character limit', () => {
	const expression = ffmpegVolumeExpression({
		volume: new Array(600).fill(1).map((_, i) => {
			if (i < 500) {
				return 0;
			}

			return (i - 500) / 100;
		}),
		fps: 30,
		trimLeft: 0,
		allowAmplificationDuringRender: false,
	});

	expect(expression.value.length).toBeLessThan(4000);
});

test('Last volume should be default case', () => {
	const expression = ffmpegVolumeExpression({
		volume: new Array(20).fill(1).map((_, i) => {
			return interpolate(i, [0, 200, 400, 600], [0, 1, 1, 0], {
				extrapolateLeft: 'clamp',
			});
		}),
		fps: 30,
		trimLeft: 0,
		allowAmplificationDuringRender: false,
	});
	expect(expression).toEqual({
		eval: 'frame',
		value:
			"'if(between(t,-0.0167,0.0500),0,if(between(t,0.0500,0.1167),0.01,if(between(t,0.1167,0.1833),0.021,if(between(t,0.1833,0.2500),0.031,if(between(t,0.2500,0.3167),0.041,if(between(t,0.3167,0.3833),0.052,if(between(t,0.3833,0.4500),0.062,if(between(t,0.4500,0.5167),0.072,if(between(t,0.5167,0.5833),0.082,0.093)))))))))'",
	});
});
