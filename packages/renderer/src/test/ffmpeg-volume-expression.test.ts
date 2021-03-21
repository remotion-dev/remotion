import {ffmpegVolumeExpression} from '../assets/ffmpeg-volume-expression';

test('Simple expression', () => {
	expect(ffmpegVolumeExpression(0.5, 1)).toEqual({
		eval: 'once',
		value: '0.5',
	});
});

test('Simple expression with volume multiplier', () => {
	expect(ffmpegVolumeExpression(0.5, 2)).toEqual({
		eval: 'once',
		value: '1',
	});
});

test('Complex expression with volume multiplier', () => {
	expect(ffmpegVolumeExpression([0, 1], 2)).toEqual({
		eval: 'frame',
		value: "'if(eq(n,0),0,2)'",
	});
});

test('Really complex volume expression', () => {
	const expectedExpression = `
    if (
      eq(n,0),
      0,
      if (
        eq(n, 1),
        0.25,
        if (
          eq(n, 2),
          0.5,
          if (
            eq(n, 3)+eq(n, 4)+eq(n, 5)+eq(n, 6),
            1,
            2
          )
        )
      )
    )
  `.replace(/\s/g, '');

	expect(
		ffmpegVolumeExpression([0, 0.25, 0.5, 1, 1, 1, 1, 2, 2, 2, 2], 1)
	).toEqual({
		eval: 'frame',
		value: `'${expectedExpression}'`,
	});
});

test('Should use the most common volume as else statement', () => {
	expect(ffmpegVolumeExpression([0, 0, 0, 2, 2], 1)).toEqual({
		eval: 'frame',
		value: "'if(eq(n,3)+eq(n,4),2,0)'",
	});
});
