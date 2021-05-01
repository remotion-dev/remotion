import {ffmpegVolumeExpression} from '../assets/ffmpeg-volume-expression';

test('Simple expression', () => {
	expect(
		ffmpegVolumeExpression({
			volume: 0.5,
			multiplier: 1,
			startInVideo: 0,
			fps: 30,
		})
	).toEqual({
		eval: 'once',
		value: '0.5',
	});
});

test('Simple expression with volume multiplier', () => {
	expect(
		ffmpegVolumeExpression({
			volume: 0.5,
			multiplier: 2,
			startInVideo: 0,
			fps: 30,
		})
	).toEqual({
		eval: 'once',
		value: '1',
	});
});

test('Complex expression with volume multiplier', () => {
	expect(
		ffmpegVolumeExpression({
			volume: [0, 1],
			multiplier: 2,
			startInVideo: 0,
			fps: 30,
		})
	).toEqual({
		eval: 'frame',
		value: "'if(between(t,-0.0167,0.0167),0,if(between(t,0.0167,0.0500),2,0))'",
	});
});

test('Really complex volume expression', () => {
	const expectedExpression =
		"'if(between(t,-0.0167,0.0167),0,if(between(t,0.0167,0.0500),0.247,if(between(t,0.0500,0.0833),0.505,if(between(t,0.0833,0.2167),0.99,if(between(t,0.2167,0.3833),1,0)))))'";

	expect(
		ffmpegVolumeExpression({
			volume: [0, 0.25, 0.5, 0.99, 0.99, 0.99, 0.99, 1, 1, 1, 1, 1],
			multiplier: 1,
			startInVideo: 0,
			fps: 30,
		})
	).toEqual({
		eval: 'frame',
		value: expectedExpression,
	});
});

test('Should use 0 as else statement', () => {
	expect(
		ffmpegVolumeExpression({
			volume: [0, 0, 0, 1, 1],
			multiplier: 1,
			startInVideo: 0,
			fps: 30,
		})
	).toEqual({
		eval: 'frame',
		value:
			"'if(between(t,0.0833,0.1500),1,if(between(t,-0.0167,0.0167)+between(t,0.0167,0.0833),0,0))'",
	});
});

test('Simple expression - should not be higher than 1', () => {
	expect(
		ffmpegVolumeExpression({volume: 2, multiplier: 1, startInVideo: 0, fps: 30})
	).toEqual({
		eval: 'once',
		value: '1',
	});
});

test('Complex expression - should not be higher than 1', () => {
	expect(
		ffmpegVolumeExpression({
			volume: [0.5, 2],
			multiplier: 1,
			startInVideo: 0,
			fps: 30,
		})
	).toEqual({
		eval: 'frame',
		value:
			"'if(between(t,0.0167,0.0500),1,if(between(t,-0.0167,0.0167),0.505,0))'",
	});
});

test('Should simplify an expression', () => {
	expect(
		ffmpegVolumeExpression({
			volume: [0, 1, 1, 1, 0, 1],
			multiplier: 1,
			startInVideo: 0,
			fps: 30,
		})
	).toEqual({
		eval: 'frame',
		value:
			"'if(between(t,-0.0167,0.0167)+between(t,0.1167,0.1500),0,if(between(t,0.0167,0.1167)+between(t,0.1500,0.1833),1,0))'",
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
		multiplier: 1,
		startInVideo: 0,
		fps: 30,
	});

	expect(expression.value.length).toBeLessThan(4000);
});
